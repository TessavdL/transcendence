<template>
	<div v-if="game" class="pong-game">
		<div class="start-button-container">
		<button @click="toggleGame">{{ game.gameStarted ? 'Stop' : 'Start' }}</button>
	</div>
	<div>
		<div class="wave"></div>
		<!-- <div class="wave"></div>
		<div class="wave"></div> -->
	</div>
	<div class="scoreboard">
		<div class="score-player1">Player One: <span id="player-1-score">{{ game.player1Score }}</span></div>
		<div class="score-player2">Player Two: <span id="player-2-score">{{ game.player2Score }}</span></div>
	</div>
	<div class="player1-paddle" :style="{ top: game.player1Position + 'px' }"></div>
	<div class="player2-paddle" :style="{ top: game.player2Position + 'px' }"></div>
	<div class="ball" :style="{ top: game.ballPosition.top + 'px', left: game.ballPosition.left + 'px' }"></div>
	</div>
</template>

<script lang="ts">
	import io from 'socket.io-client';
	import type { Game } from '../types/GameType';
import { computed, ref } from 'vue';

	export default {
	data() {
		return {
			game: ref<Game>
		};
	},

	setup() {
		const socket = io('http://localhost:3001/pong-game', { withCredentials: true });
		const game = ref<Game>();
		socket.on('gameData', (gameObject: Game) => {
			game.value = gameObject;
		});
		return { socket, game: computed(() => game.value) };
	},

	mounted() {
		this.socket.on('updategameStatus', (gameStatus) => {
			this.game.player1Position = gameStatus.player1Position;
			this.game.player2Position = gameStatus.player2Position;
			this.game.ballPosition = gameStatus.ballPosition;
			this.game.player1Score = gameStatus.player1Score;
			this.game.player2Score = gameStatus.player2Score;
		});
		this.socket.on('updatePaddlePosition', (position) => {
			this.movePaddle(position);
		});
		// this.socket.on('updateBallPosition', (ballPosition) => {
		// 	this.update(ballPosition);
		// });
		window.addEventListener('keydown', (event) => {
			if (event.key === 'ArrowUp') {
				//this.movePaddle(-25); // move the paddle up by .. pixels
				this.socket.emit('movePaddle', 'up');
			} else if (event.key === 'ArrowDown') {
				//this.movePaddle(25); // move the paddle down by .. pixels
				this.socket.emit('movePaddle', 'down');
			}
		});
	},

	beforeRouteLeave() {
		this.socket.disconnect();
	},

	methods: {

		toggleGame() {
		if (this.game.gameStarted) {
			this.game.gameStarted = false;
		} else {
			this.game.gameStarted = true;
		  this.update(); // call the update method to start the game loop
		}
	},
		movePaddle(position: number) {
		const newPosition = this.game.player1Position + position;
		if (newPosition <= 500 && newPosition >= 0) {
			//this.socket.emit('movePaddle', position);
			this.game.player1Position = newPosition;
		}
		console.log('position player 1:', newPosition);
	},
		update() {
			if (!this.game.gameStarted)
				return;
			const gameStatus = {
				ballPosition: this.game.ballPosition,
				ballVelocity: this.game.ballVelocity,
				player1Position: this.game.player1Position,
				player2Position: this.game.player2Position,
				player1Score: this.game.player1Score,
				player2Score: this.game.player2Score,
				gameStarted: this.game.gameStarted,
			};
		this.socket.emit('ballMovement', gameStatus);
		requestAnimationFrame(this.update);
		},
	},
};
</script>

<style>
.pong-game::before {
	content: "";
	position: absolute;
	top: 0;
	bottom: 0;
	left: 50%;
	border-left: 8px solid white;
}
.pong-game {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	height: 600px;
	width: 800px;
	/* background: url("../assets/game_images/neon-retro-background.jpeg") no-repeat fixed; */
	background-size: contain;
	background-position: center;
	background: linear-gradient(315deg,
		rgb(0, 101, 52) 3%,
		rgb(206, 162, 60) 38%,
		rgb(127, 48, 238) 68%,
		rgba(255,25,25,1) 98%);
	animation: gradient 12s ease infinite;
	background-size: 400% 400%;
	background-attachment: fixed;
	/* background-color: rgb(13, 12, 11); */
	display: flex;
	border-top: 8px solid rgb(249, 248, 248);
	border-bottom: 8px solid rgb(253, 251, 251);
	border-left: 8px solid rgb(253, 251, 251);
	border-right: 8px solid rgb(253, 251, 251);
}
@font-face {
	font-family: "Joy";
	src: url("./src/assets/game_images/JoyfulEaster.ttf");
	font-family: "arcadeFont";
	src: url("./src/assets/game_images/ARCADECLASSIC.TTF");
	font-family: "excellent";
	src: url("./src/assets/game_images/mexcellent 3d.otf");
}

.scoreboard {
	display: flex;
	justify-content: space-between;
	align-items: center;
	position: absolute;
	top: 20px;
	left: 20px;
	right: 20px;
}
.score-player1, .score-player2 {
	font-size: 40px;
	font-weight: normal;
	color: rgb(217, 250, 32);
	font-family: "excellent";
}
/* .score-player1 {
	order: 1;
}
.score-player2 {
	order: 3;
} */
.pong-game img {
	max-width: 100%;
	max-height: 100%;
}
.start-button-container {
	position: absolute;
	width: 100px;
	height: 30px;
	top: calc(600px);
	left: calc(345px);
 	z-index: 1; /* make sure the button is on top of the canvas */
}
.player1-paddle,
.player2-paddle {
	position: absolute;
	width: 15px;
	height: 80px;
	background-color: rgb(231, 220, 208);
}
.player1-paddle {
	left: 20px;
	top: 260px;
}
.player2-paddle {
	right: 20px;
	top: 260px;
}
.ball {
	position: absolute;
	width: 20px;
	height: 20px;
	background-color: rgb(33, 34, 32);
	/* --for round ball --*/
	/* position: absolute;
	width: 15px;
	height: 15px;
	top: 290px;
	left: 390px;
	background-color: white;
	border-radius: 50%; */
}

/* body {
	margin: auto;
	font-family: -apple-system, BlinkMacSystemFont, sans-serif;
	overflow: auto;
	background: linear-gradient(315deg, rgba(101,0,94,1) 3%, rgba(60,132,206,1) 38%, rgba(48,238,226,1) 68%, rgba(255,25,25,1) 98%);
	animation: gradient 15s ease infinite;
	background-size: 400% 400%;
	background-attachment: fixed;
} */

@keyframes gradient {
	0% {
		background-position: 0% 0%;
	}
	50% {
		background-position: 100% 100%;
	}
	100% {
		background-position: 0% 0%;
	}
}

.wave {
    /* background: rgb(255 255 255 / 25%); */
	border-radius: 1000% 1000% 0 0;
	position: fixed;
	width: 200%;
	height: 16em;
	animation: wave 15s -2s linear infinite;
	transform: translate3d(0, 0, 0);
	opacity: 0.8;
	bottom: 0;
	left: 0;
	z-index: -1;
}

/* .wave:nth-of-type(2) {
	bottom: -1.25em;
	animation: wave 18s linear reverse infinite;
	opacity: 0.8;
}

.wave:nth-of-type(3) {
	bottom: -2.5em;
	animation: wave 10s -1s reverse infinite;
	opacity: 0.9;
}

@keyframes wave {
	2% {
		transform: translateX(1);
	}

	25% {
		transform: translateX(-25%);
	}

	50% {
		transform: translateX(-50%);
	}

	75% {
		transform: translateX(-25%);
	}

	100% {
		transform: translateX(1);
	}
} */
</style>
