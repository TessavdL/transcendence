<template>
	<div class="logout">
		<div v-if="isVisible">
			<p class="confirm-msg">Are you sure?</p>
			<button type="button" class="btn btn-outline-light logout-button" @click="logOut">
				<i class="bi bi-box-arrow-in-right" style="font-size: 1.2em;"></i>
				Log Out
			</button>
		</div>
	</div>
</template>

<script  setup lang="ts">
import { ref, inject } from "vue";
import axios from "axios";
import storeUser from "@/store";
import router from "@/router";
import { useToast } from "primevue/usetoast";
import { ErrorType, errorMessage } from "@/types/ErrorType";
import { Socket } from "socket.io-client";
import { HOST } from "@/constants/constants";

const socket: Socket = inject("socketioInstance") as Socket;
const toast = useToast();
const isVisible = ref<boolean>(true);

function redirectToHome() {
	toast.add({
		severity: "info",
		summary: "Success",
		detail: "Log out successfully. Redirecting to home...",
		life: 3000,
	});
	setTimeout(() => router.push({ name: "Home" }), 1000);
}

async function logOut() {
	await axios
		.get(`http://${HOST}:3001/auth/logout`, {
			withCredentials: true,
		})
		.then(() => {
			storeUser.dispatch("logout");
			isVisible.value = false;
			socket.emit("exitUserSocketRoom");
			socket.disconnect();
			redirectToHome();
		})
		.catch(() => {
			toast.add({
				severity: "error",
				summary: "Error",
				detail: errorMessage(ErrorType.GENERAL),
				life: 3000,
			});
		});
}

</script>

<style scoped>
.confirm-msg {
	font-size: 40px;
	margin: 30px auto;
	color: #ffffff;
}

.logout-button {
	font-size: 20px;
	margin: 10px auto;
	border-radius: 10px;
}
</style>