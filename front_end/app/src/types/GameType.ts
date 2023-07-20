export interface Game {
	player1Position: number;
	player2Position: number;
	ballPosition: { top: number, left: number };
	ballVelocity: { x: number, y: number };
	gameStarted: boolean;
	gameEnded: boolean;
	player1Score: number;
	player2Score: number;
	turnPlayerOne: boolean;
	turnPlayerTwo: boolean;
}

export interface Players {
	player1: {
		id: string,
	};
	player2: {
		id: string,
	};
}