import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { K } from './constants';
import { GameSharedService } from './game.shared.service';
import { Game, Players } from './types';

@Injectable()
export class GameService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly userService: UserService,
		private shareService: GameSharedService,
	) { }

	gameData(): Game {
		const game: Game = {
			player1Position: 240,
			player2Position: 240,
			ballPosition: { top: 280, left: 386 },
			ballVelocity: { x: 5, y: 5 },
			gameStarted: false,
			gameEnded: false,
			player1Score: 0,
			player2Score: 0,
			turnPlayerOne: true,
			turnPlayerTwo: false,
		};
		return (game);
	}

	assignPlayers(roomName: string): Players {
		const players: Players = this.shareService.playerData.get(roomName);
		return (players);
	}

	movement(movement: string): number {
		if (movement === 'up') {
			return (-25);
		}
		else if (movement === 'down') {
			return (25);
		}
		else {
			return (0);
		}
	}

	canMove(position: number, player: string, game: Game): boolean {
		if (position === 0) {
			return (false);
		}
		if (player === 'playerone') {
			const newPositionPlayerOne = game.player1Position + position;
			if (newPositionPlayerOne <= 500 && newPositionPlayerOne >= 0) {
				return (true);
			}
		}
		else if (player === 'playertwo') {
			const newPositionPlayerTwo = game.player2Position + position;
			if (newPositionPlayerTwo <= 500 && newPositionPlayerTwo >= 0) {
				return (true);
			}
		}
		return (false);
	}

	ballMovement(gameStatus: Game): Game {
		const ballPosition = {
			top: gameStatus.ballPosition.top + gameStatus.ballVelocity.y,
			left: gameStatus.ballPosition.left + gameStatus.ballVelocity.x,
		};
		// Check for collision with top or bottom walls
		if (ballPosition.top <= 0 || ballPosition.top >= 565) {
			gameStatus.ballVelocity.y = -gameStatus.ballVelocity.y;
		}
		// Check for collision with left or right walls
		// if (ballPosition.left <= 0 || ballPosition.left >= 780) {
		// 	gameStatus.ballVelocity.x = -gameStatus.ballVelocity.x;
		// }
		const paddleOneLeft = 0;
		const paddleOneRight = 15;
		const paddleOneTop = gameStatus.player1Position;
		const paddleOneBottom = gameStatus.player1Position + 80;

		const paddleTwoLeft = 750;
		const paddleTwoRight = 765;
		const paddleTwoTop = gameStatus.player2Position;
		const paddleTwoBottom = gameStatus.player2Position + 80;
		// Check for score
		if (ballPosition.left <= 0 ||
			ballPosition.left + 20 >= paddleOneLeft &&
			ballPosition.left + 20 <= paddleOneRight + 15 &&
			ballPosition.top + 20 >= paddleOneTop &&
			ballPosition.top <= paddleOneBottom) {
			gameStatus.ballPosition = { top: 300, left: 150 };
			gameStatus.ballVelocity = { x: 5, y: 5 };
			gameStatus.player2Score++;
			gameStatus.turnPlayerOne = true;
			gameStatus.turnPlayerTwo = false;
			gameStatus.gameStarted = false;
			if (gameStatus.player2Score >= 3) {
				gameStatus.gameEnded = true;
			}
		}
		else if (ballPosition.left + 20 >= 770 || //old value 780
			ballPosition.left + 20 >= paddleTwoLeft &&
			ballPosition.left + 20 <= (paddleTwoLeft - 15) &&
			ballPosition.top >= paddleTwoTop &&
			ballPosition.top <= (paddleTwoBottom - 15)) {
			gameStatus.ballPosition = { top: 300, left: 650 };
			gameStatus.ballVelocity = { x: -5, y: -5 };
			gameStatus.player1Score++;
			gameStatus.turnPlayerOne = false;
			gameStatus.turnPlayerTwo = true;
			gameStatus.gameStarted = false;
			if (gameStatus.player1Score >= 3) {
				gameStatus.gameEnded = true;
			}
		}
		else {
			gameStatus.ballPosition = ballPosition;
		}
		// Check for collision with player1 paddle
		if (ballPosition.left <= paddleOneRight + 15 &&
			ballPosition.left >= paddleOneLeft &&
			ballPosition.top + 20 >= paddleOneTop &&
			ballPosition.top <= paddleOneBottom) {
			gameStatus.ballVelocity.x = -gameStatus.ballVelocity.x;
			console.log('collision player one');
		}
		// Check for collision with player2 paddle
		if (ballPosition.left + 20 == paddleTwoLeft &&          // Right edge of the ball
			ballPosition.left <= paddleTwoRight &&               // Left edge of the paddle
			ballPosition.top + 20 >= paddleTwoTop &&             // Bottom edge of the ball
			ballPosition.top <= paddleTwoBottom) {               // Top edge of the paddle
			gameStatus.ballVelocity.x = -gameStatus.ballVelocity.x;
			console.log('collision player two');
		}
		return (gameStatus);
	}

	// endGame(gameStatus: Game): boolean {
	// 	if (gameStatus.player1Score >= 3 || gameStatus.player2Score >= 3) {
	// 		return true;
	// 	}
	// 	return false;
	// }

	async update_win_loss_elo(winner: User, loser: User): Promise<void> {
		const { newWinnerElo, newLoserElo }: { newWinnerElo: number, newLoserElo: number } = this.calculate_new_elo(winner.elo, loser.elo);
		await this.update_winner(winner.intraId, newWinnerElo);
		await this.update_loser(loser.intraId, newLoserElo);
	}

	async update_win_loss_elo_based_on_intraId(winnerIntraId: number, loserIntraId: number): Promise<void> {
		const winner: User = await this.userService.getUserBasedOnIntraId(winnerIntraId);
		const loser: User = await this.userService.getUserBasedOnIntraId(loserIntraId);
		const { newWinnerElo, newLoserElo }: { newWinnerElo: number, newLoserElo: number } = this.calculate_new_elo(winner.elo, loser.elo);
		await this.update_winner(winnerIntraId, newWinnerElo);
		await this.update_loser(loserIntraId, newLoserElo);
	}

	private calculate_new_elo(winnerElo: number, loserElo: number): { newWinnerElo: number, newLoserElo: number } {
		const expectedEloWinner: number = 1 / (1 + (10 ** ((loserElo - winnerElo) / 400)));
		const eloChange = K * (1 - expectedEloWinner);
		const newWinnerElo: number = Math.round(winnerElo + eloChange);
		const newLoserElo: number = Math.round(loserElo - eloChange);
		return {
			newWinnerElo,
			newLoserElo
		}
	}

	private async update_winner(winnerIntraId: number, newWinnerElo: number): Promise<void> {
		try {
			await this.prisma.user.update({
				where: {
					intraId: winnerIntraId,
				},
				data: {
					wins: {
						increment: 1,
					},
					elo: newWinnerElo,
				},
			});
        } catch(error: any) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2001') {
                    throw new NotFoundException('Unable to update achievement, user not found');
                }
            }
            throw new InternalServerErrorException(error.message || "Prisma failed to update user.wins");
        }
	}

	private async update_loser(loserIntraId: number, newLoserElo: number): Promise<void> {
		try {
			await this.prisma.user.update({
				where: {
					intraId: loserIntraId,
				},
				data: {
					losses: {
						increment: 1,
					},
					elo: newLoserElo,
				},
			});
		} catch(error: any) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2001') {
                    throw new NotFoundException('Unable to update achievement, user not found');
                }
            }
            throw new InternalServerErrorException(error.message || "Prisma failed to update user.losses");
        }
	}
}
