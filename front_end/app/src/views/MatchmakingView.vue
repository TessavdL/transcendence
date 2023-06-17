<template>
	<div class="matchmaking-container">
		<h2>
			Waiting for opponent...
		</h2>
	</div>
</template>

<script lang="ts">
import { HOST } from "@/constants/constants";
import { Socket, io } from "socket.io-client"
import { onBeforeMount, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
let socket: Socket;

onBeforeMount(async () => {
	socket = io(
		`http://${HOST}:3001/matchmaking`, {
		withCredentials: true,
	}
	);
})

onMounted(() => {
	socket.on('connected', () => {
		socket.emit('matchmaking');
	})

	socket.on('createGame', (data) => {
		console.log('in create game', data);
		const gameid = data;
		if (gameid === undefined || gameid === null) {
			router.push({
				name: "Home",
			})
		}
		console.log('Redirecting to game', gameid);
		router.push({
			name: 'Game',
			params: { gameid: gameid },
		})
	})

	socket.on('error', (data) => {
		console.log(data);
		router.push({
			name: "Home",
		})
	})

	socket.on('unauthorized', (data) => {
		console.log(data);
		router.push({
			name: "Home",
		})
	})
})

</script>

<style scoped>
h2 {
	color: white;
	font-size: 30px;
}
</style>