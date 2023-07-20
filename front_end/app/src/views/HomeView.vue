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
			<LoginButton v-if="!showSignupView" @switchToSignup="showSignupView = true" />
      		<SignupButton v-else @switchToLogin="showSignupView = false" />
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
const showSignupView = ref(false);

const playGame = () => {
	router.push({
		name: "Matchmaking",
	})
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
