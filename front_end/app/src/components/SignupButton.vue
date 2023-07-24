<template>
    <div>
        <h3 class="logout-msg">Please sign up by filling this form</h3>
        <form @submit.prevent="signup">
			<div class="input-group">
        <div>
          <label for="username"></label>
          <input type="text" id="username" class="form-control" placeholder="Enter username" v-model="username" required />
          </div>
          <div>
          <label for="password"></label>
          <input type="password" placeholder="Enter password" id="password" class="form-control" v-model="password" required />
        </div>      
      </div>
          <button class="btn btn-info login-button" type="submit">Sign up</button>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { HOST } from '@/constants/constants';
import axios from "axios";
import { useToast } from "primevue/usetoast";

const toast = useToast();

const username = ref<string>('');
const password = ref<string>('');

async function signup() {
	const data = {
		name: username.value,
		password: password.value,
	}
	try {
		await axios.post(`http://${HOST}:3001/auth/signup`, data);
	} catch (error: any) {
		const response = error?.response?.data?.message ?? "An error has occured while signin up";
		let errorMessage: string = "";
		if (typeof response === "object") {
			response.forEach((message: string) => {
				errorMessage += message;
			});
		}
		else {
			errorMessage = response;
		}
		toast.add({
			severity: "error",
			summary: "Error",
			detail: errorMessage,
			life: 8000,
		}); 
	}
}

</script>

<style scoped>
.logout-msg {
	font-size: 30px;
	color: #ffffff;
	margin: 30px auto;
}

.login-button {
	margin: 30px auto;
	font-size: 30px;
	border-radius: 10px;
}

.input-group {
	display: flex;
  justify-content: center;
	gap: 10px;
	margin-bottom: 10px;
  color: white;
}
</style>
