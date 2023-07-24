<template>
	<div class="home">
		<div v-if="storeUser.state.isAuthenticated">
			<div class="about">
				<h3>About PONG</h3>
				<p>Pong is one of the first computer games that ever created.</p>
				<p>The game was originally developed by Allan Alcorn and released in 1972 by Atari corporations. </p>
				<p>This simple "tennis like" game features two paddles and a ball.</p>
				<p>The goal is to defeat your opponent by being the first one to gain 10 point.</p>
				<p>A player gets a point once the opponent misses a ball.</p>
			</div>
			<div class="game-buttons">
				<button type="button" class="btn btn-outline-primary play-button"
					style="color:#09252f; background-color: #ffffff; border: 2px solid #09252f;" @click="playGame">
					Play Game
				</button>
			</div>
		</div>
		<div v-else>
			<div v-if="loginView">		
				<LoginButton/>
				<p style="color:white;">If you are a new user, please click <a href="#" @click="toggleView">here</a> to sign up</p>
			</div>
			<div v-else>
				<SignupButton />
				<button type="button" class="btn btn-outline-primary play-button"
					style="color:#09252f; background-color: #ffffff; border: 2px solid #09252f;" @click="toggleView">
					Back
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import storeUser from "@/store";
import LoginButton from "@/components/LogInButton.vue";
import SignupButton from "@/components/SignupButton.vue";

import { useRouter } from "vue-router";

const router = useRouter();
const loginView = ref<boolean>(true);

const playGame = () => {
	router.push({
		name: "Matchmaking",
	})
}

function toggleView() {
	loginView.value = !loginView.value;
}

</script>

<style scoped>
.about {
	color: #ffffff;
	text-align: center;
	font-size: 20px;
}

.about h3 {
	margin: 20px auto;
	font-size: 40px;
}

.game-buttons {
	font-size: 20px;
	margin: 30px auto;
}

.play-button {
	width: 200px;
	font-weight: bold;
	margin: 0px 20px;
}

.watch-button {
	width: 200px;
	font-weight: bold;
	margin: 0px 20px;
}
</style>
