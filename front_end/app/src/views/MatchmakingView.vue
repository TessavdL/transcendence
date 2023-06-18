<template>
	<div class="matchmaking-container">
		<h2>
			Waiting for opponent...
		</h2>
	</div>
</template>
  
<script lang="ts">
import { HOST } from "@/constants/constants";
import { useToast } from "primevue/usetoast";
import { Socket, io } from "socket.io-client";
import { onBeforeMount, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

export default {
	setup() {
		const router = useRouter();
		const toast = useToast();
		let socket: Socket;

		onBeforeMount(() => {
			socket = io(`http://${HOST}:3001/matchmaking`, {
				withCredentials: true,
			});
			waitForConnection()
		});

		onMounted(() => {
			socket.on('createGame', (data) => {
				const gameid = data;
				if (gameid === undefined || gameid === null) {
					toast.add({
						severity: "error",
						summary: "Error",
						detail: 'Gameid is invalid, redirecting to home',
						life: 3000,
					});
					router.push({ name: "Home" });
				} else {
					toast.add({
						severity: "success",
						summary: "Success",
						detail: "Match found, redirecting to game",
						life: 3000,
					})
					router.push({ name: 'Game', params: { gameid: gameid } });
				}
			});

			socket.on('error', (data) => {
				toast.add({
					severity: "error",
					summary: "Error",
					detail: (data.message || 'An error has occured') + ', redirecting to home',
					life: 3000,
				});
				router.push({ name: "Home" });
			});

			socket.on('unauthorized', (data) => {
				toast.add({
					severity: "error",
					summary: "Error",
					detail: (data.message || 'Authorization Failed') + ', redirecting to home',
					life: 3000,
				});
				router.push({ name: "Home" });
			});
		});

		function waitForConnection() {
			if (socket.connected) {
				socket.emit('matchmaking');
			}
			else {
				socket.on('hasConnected', async () => {
					socket.emit('matchmaking');
				});
			}
		}

		onBeforeUnmount(() => {
			socket.removeAllListeners();
			socket.disconnect();
		})
	},
};
</script>
  
<style scoped>
h2 {
	color: white;
	font-size: 30px;
}
</style>
  