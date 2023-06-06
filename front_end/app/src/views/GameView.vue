
<template>
	<div>
		<button @click="toggleColorMode">Switch to Color Mode</button>
			{{ isColorMode ? 'Switch to Classic Mode' : 'Switch to Color Mode' }}
			<!-- condition to check if it is color mode -->
		<div v-if="game" :class="isColorMode ? 'pong-game-color' : 'pong-game-classic'"> 
			<div class="start-button-container" v-if="isPlayerOne && (game.player1Score === game.player2Score) && !game.gameStarted && !isGameOver">
				<!-- <button @click="toggleGame">{{ game.gameStarted ? 'Stop' : 'Start' }}</button> -->
				<a class="start-button" style="--color:#e9d930;" @click="toggleGame">{{ game.gameStarted ? 'Stop' : 'Start' }}
					<span></span>
					<span></span>
					<span></span>
					<span></span>
				</a>
			</div>
			<div class="start-button-container" v-if="!isPlayerOne && (game.player2Score !== game.player1Score) && !game.gameStarted && !isGameOver">
				<!-- <button @click="toggleGame">{{ game.gameStarted ? 'Stop' : 'Start' }}</button> -->
				<a class="start-button" style="--color:#e8eb2c;" @click="toggleGame">{{ game.gameStarted ? 'Stop' : 'Start' }}
					<span></span>
					<span></span>
					<span></span>
					<span></span>
				</a>
			</div>
			<div>
				<div class="wave"></div>
				<!-- <div class="wave"></div> -->
				<!-- <div class="wave"></div> -->
			</div>
			<div class="scoreboard">
				<div class="score-player1">Player One: 
					<span id="player-1-score">{{ game.player1Score }}</span></div>
				<div class="score-player2">Player Two: 
					<span id="player-2-score">{{ game.player2Score }}</span></div>
			</div>
			<div class="player1-paddle" :style="{ top: game.player1Position + 'px' }"></div>
			<div class="player2-paddle" v-if="game.player2Position" :style="{ top: game.player2Position + 'px' }"></div>
			<div :class="isColorMode ? 'ball-round' : 'ball-classic'" :style="{ top: game.ballPosition.top + 'px', left: game.ballPosition.left + 'px' }"></div>
			<div v-if="isGameOver" class="game-over-canvas">
				<h2>Game Over</h2>
					<p>Player {{ game.player1Score === 3 ? 'One' : 'Two' }} wins!</p>
					<!-- <button @click="toggleGame">Restart</button> -->
			</div>
		</div>
		
	</div>
</template>

<script lang="ts">
import io from 'socket.io-client';
import type { Game, Players } from '../types/GameType';
import { computed, ref } from 'vue';
import storeUser from '@/store';

export default {
	data() {
		return {
			game: ref<Game>,
			player: '',
			roomName: '',
			gameOver: false,
			isColorMode: false,
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

	computed: {
		isPlayerOne() {
			console.log('checking player');
			return this.player === 'playerone';
		},
		isGameOver() {
			// Check if the game is over
			return this.game.player1Score === 3 || this.game.player2Score === 3;
		}
	},

	mounted() {
		this.socket.on('connected', () => {
			if (typeof this.$route.params.gameid === 'string') {
				this.roomName = this.$route.params.gameid;
			}
			this.socket.emit('assignPlayers', this.$route.params.gameid);
		});

		this.socket.on('playerisSet', async (players: Players) => {
			if (storeUser.state.user.intraId === players.player1.intraId) {
				this.player = 'playerone';
			}
			else {
				this.player = 'playertwo';
			}
		});

		this.socket.on('gameStarted', () => {
			this.game.gameStarted = true;
			this.update();
		});

		this.socket.on('updategameStatus', (gameStatus: Game) => {
			this.game.ballPosition = gameStatus.ballPosition;
			this.game.ballVelocity = gameStatus.ballVelocity;
			this.game.gameStarted = gameStatus.gameStarted;
			this.game.player1Score = gameStatus.player1Score;
			this.game.player2Score = gameStatus.player2Score;
		});

		this.socket.on('updatePaddlePosition', (position: number) => {
			if (this.player === 'playerone') {
				this.movePaddle(position);
			}
			else if (this.player === 'playertwo') {
				this.movePaddlePlayerTwo(position);
			}
		});

		this.socket.on('otherPlayerUpdatePaddlePosition', (position) => {
			if (this.player === 'playerone')
				this.movePaddlePlayerTwo(position);
			else if (this.player === 'playertwo')
				this.movePaddle(position);
		});

		window.addEventListener('keydown', (event) => {
			if (event.key === 'ArrowUp') {
				const data = {
					movement: 'up',
					player: this.player,
					roomName: this.roomName,
					game: this.game,
				};
				this.socket.emit('movePaddle', data);
			}
			else if (event.key === 'ArrowDown') {
				const data = {
					movement: 'down',
					player: this.player,
					roomName: this.roomName,
					game: this.game,
				};
				this.socket.emit('movePaddle', data);
			}
		});
	},

	beforeRouteLeave() {
		this.socket.disconnect();
	},

	methods: {

		toggleGame() {
			if (!this.game.gameStarted) {
				this.game.gameStarted = true;
				this.socket.emit('startGame', this.roomName);
			}
			// if (this.game.gameStarted) {
			// 	this.game.gameStarted = false;
			// }
			// else {
			// 	this.game.gameStarted = true;
			// 	this.socket.emit('startGame', this.roomName);
			// }
		},
		toggleColorMode() {
			this.isColorMode = !this.isColorMode;

		},
		movePaddle(position: number) {
			this.game.player1Position += position;
		},

		movePaddlePlayerTwo(position: number) {
			this.game.player2Position += position;
		},

		update() {
			if (!this.game.gameStarted)
				return;
			if (this.game.player1Score === 3 || this.game.player2Score === 3) {
				this.game.gameStarted = false;
				this.gameOver = true;
				return ;
			}
			const gameStatus: Game = {
				ballPosition: this.game.ballPosition,
				ballVelocity: this.game.ballVelocity,
				player1Position: this.game.player1Position,
				player2Position: this.game.player2Position,
				player1Score: this.game.player1Score,
				player2Score: this.game.player2Score,
				gameStarted: this.game.gameStarted,
			};
			const data = {
				gameStatus: gameStatus,
				roomName: this.roomName,
			}
			requestAnimationFrame(this.update);
			if (this.player === 'playerone') {
				this.socket.emit('ballMovement', data);
			}
		},
	},
};
</script>

<style>
@import url("../assets/game_mode/button.css");
@import url("../assets/game_mode/classic_pong.css");
@import url("../assets/game_mode/color_pong.css");

/* .pong-game-classic::before {
	content: "";
	position: absolute;
	top: 0;
	bottom: 0;
	left: 50%;
	border-left: 8px solid white;
}

.pong-game-classic {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	height: 600px;
	width: 800px;
	background-size: contain;
	background-color: rgb(13, 12, 11);
	display: flex;
	border-top: 8px solid rgb(249, 248, 248);
	border-bottom: 8px solid rgb(253, 251, 251);
	border-left: 8px solid rgb(253, 251, 251);
	border-right: 8px solid rgb(253, 251, 251);
} */

/* .pong-game {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	height: 600px;
	width: 800px; */
	/* background: url("../assets/game_images/neon-retro-background.jpeg") no-repeat fixed; */
	/* background-size: contain;
	background-position: center;
	background: linear-gradient(315deg,
	rgb(0, 101, 52) 3%,
	rgb(206, 162, 60) 38%,
	rgb(127, 48, 238) 68%,
	rgba(255, 25, 25, 1) 98%);
	animation: gradient 12s ease infinite;
	background-size: 400% 400%;
	background-attachment: fixed; */
	/* background-color: rgb(13, 12, 11); */
	/* display: flex;
	border-top: 8px solid rgb(249, 248, 248);
	border-bottom: 8px solid rgb(253, 251, 251);
	border-left: 8px solid rgb(253, 251, 251);
	border-right: 8px solid rgb(253, 251, 251);
} */

@font-face {
	
	font-family: "Joy";
	src: url("../assets/game_images/JoyfulEaster.ttf");
}
@font-face {
	font-family: "arcadeFont";
	src: url("../assets/game_images/ARCADECLASSIC.TTF");
}
@font-face {
	font-family: "excellent";
	src: url("../assets/game_images/mexcellent 3d.otf");
}
.game-over-canvas {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 999;
}

.game-over-canvas h2 {
	font-family: "arcadeFont";
	font-size: 64px;
	color: white;
	margin-bottom: 16px;
}

.game-over-canvas p {
	font-family: "arcadeFont";
	font-size: 48px;
	color: white;
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

.score-player1,
.score-player2 {
	font-size: 40px;
	font-weight: normal;
	color: rgb(217, 250, 32);
	font-family: "arcadeFont";
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
}

.ball-classic {
	position: absolute;
	width: 20px;
	height: 20px;
	background-color: rgb(243, 246, 240);
}
.ball-round {
	position: absolute;
	width: 15px;
	height: 15px;
	top: 290px;
	left: 390px;
	background-color: white;
	border-radius: 50%;
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
	/* border-radius: 100% 100% 0 0; */
	position: fixed;
	width: 150%;
	height: 16em;
	animation: wave 15s -2s linear infinite;
	transform: translate3d(0, 0, 0);
	opacity: 0.8;
	bottom: 0;
	left: 0;
	z-index: -1;
}

</style>
