import { Injectable } from '@nestjs/common';
import { Game } from './type';

@Injectable()
export class GameService {
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
	movement(movement: string): number {
		if (movement ==='up') {
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
		// Check for score
		if (ballPosition.left <= 0 ) {
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
		const paddleLeft = 0;
		const paddleRight = 15;
		const paddleTop = gameStatus.player1Position;
		const paddleBottom = gameStatus.player1Position + 80;
		if (ballPosition.left <= paddleRight + 15 && 
		ballPosition.left >= paddleLeft &&
		ballPosition.top + 20 >= paddleTop && 
		ballPosition.top <= paddleBottom) {
			gameStatus.ballVelocity.x = -gameStatus.ballVelocity.x;
		}
		return (gameStatus);
	}
	
}
