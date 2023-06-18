<template>
	<div class="matchmaking-container">
		<h2>
			Waiting for opponent...
		</h2>
	</div>
</template>

<script lang="ts">
import { HOST } from "@/constants/constants";
import { io } from "socket.io-client";
import { onBeforeRouteUpdate, useRouter } from "vue-router";

export default {

	setup() {
		const socket = io(`http://${HOST}:3001/matchmaking`, { withCredentials: true });
		socket.on('connected', () => {
			socket.emit('matchmaking');
		});
		console.log('created sockect');
		const router = useRouter();
		return { socket, router };
	},

	mounted() {
		this.socket.on('createGame', (data) => {
			console.log(data);
			const gameid = data;
			if (gameid === undefined || gameid === null) {
				this.router.push({
					name: "Home",
				})
			}
			console.log('Redirecting to game', gameid);
			this.router.push({
				name: 'Game',
				params: { gameid: gameid }
			});
		}),

		this.socket.on('error', (data) => {
			console.log(data);
			this.router.push({
				name: "Home",
			})
		}),

		this.socket.on('unauthorized', (data) => {
			console.log(data);
			this.router.push({
				name: "Home",
			})
		})
	},

	beforeRouteLeave() {
		this.socket.removeAllListeners();
		this.socket.disconnect();
	}
}

</script>

<style scoped>
h2 {
	color: white;
	font-size: 30px;
}
</style>