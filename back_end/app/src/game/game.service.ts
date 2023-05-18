import { Game } from './type';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { K } from './constants';
import { SharedService } from './game.shared.service';
import { GameData } from './types';

@Injectable()
export class GameService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly userService: UserService,
		private shareService: SharedService,
	) { }

	gameData(): Game {
		const game: Game = {
			player1Position: 240,
			player2Position: 240,
			ballPosition: { top: 300, left: 385 },
			ballVelocity: { x: 5, y: 5 },
			gameStarted: false,
			player1Score: 0,
			player2Score: 0,
		};
		return (game);
	}

	assignPlayers(roomName: string): GameData {
		const players = this.shareService.gameData.get(roomName);
		console.log(this.shareService.gameData.size);
		console.log({players});
		console.log(roomName);
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
	ballMovement(gameStatus: Game): Game {
		const ballPosition = {
			top: gameStatus.ballPosition.top + gameStatus.ballVelocity.y,
			left: gameStatus.ballPosition.left + gameStatus.ballVelocity.x,
		};
		// Check for collision with top or bottom walls
		if (ballPosition.top <= 0 || ballPosition.top >= (600 - 20)) {
			gameStatus.ballVelocity.y = -gameStatus.ballVelocity.y;
		}
		// Check for collision with left or right walls
		if (ballPosition.left <= 0 || ballPosition.left >= (800 - 20)) {
			gameStatus.ballVelocity.x = -gameStatus.ballVelocity.x;
		}
		const paddleLeft = 0;
		const paddleRight = 15;
		const paddleTop = gameStatus.player1Position;
		const paddleBottom = gameStatus.player1Position + 80;
		// Check for score
		if (ballPosition.left <= 0 || ballPosition.left + 20 >= paddleLeft && ballPosition.left + 20 <= paddleRight + 15 &&
			ballPosition.top + 20 >= paddleTop && ballPosition.top <= paddleBottom) {
			gameStatus.ballPosition = { top: 300, left: 150 };
			gameStatus.ballVelocity = { x: 5, y: 5 };
			gameStatus.player2Score++;
			gameStatus.gameStarted = false;
		}
		else if (ballPosition.left >= 780) {
			gameStatus.ballPosition = { top: 300, left: 650 };
			gameStatus.ballVelocity = { x: -5, y: -5 };
			gameStatus.player1Score++;
			gameStatus.gameStarted = false;
		}
		else {
			gameStatus.ballPosition = ballPosition;
		}
		// Check for collision with player1 paddle
		if (ballPosition.left <= paddleRight + 15 &&
			ballPosition.left >= paddleLeft &&
			ballPosition.top + 20 >= paddleTop &&
			ballPosition.top <= paddleBottom) {
			gameStatus.ballVelocity.x = -gameStatus.ballVelocity.x;
			console.log('collision');
		}
		return (gameStatus);
	}

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
		} catch (error: any) {
			throw new InternalServerErrorException("Prisma failed to update user.wins");
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
		} catch (error: any) {
			throw new InternalServerErrorException("Prisma failed to update user.losses");
		}
	}
}
