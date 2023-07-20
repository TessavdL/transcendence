<template>
    <div>
        <h3 class="logout-msg">Please sign up by filling in a username and password</h3>
        <form @submit.prevent="login">
 	       <div>
              <label for="username">Username:</label>
              <input type="text" id="username" v-model="username" required />
    	    </div>
         	<div>
            <label for="password">Password:</label>
            <input type="password" id="password" v-model="password" required />
          	</div>
          <button class="btn btn-info login-button" type="submit" onclick="signup(username, password)">Sign up</button>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { HOST } from '@/constants/constants';
import axios from "axios";
import { useToast } from "primevue/usetoast";

const axiosInstance = axios.create({
	baseURL: `http://${HOST}/auth`,
});
const toast = useToast();

const username: string = ref<string>("");
const password: string = ref<string>("");

async function signup() {
	const data = {
		name: username,
		password: password,
	}
	try {
		await axiosInstance.post("signup", data);
	} catch (error: any) {
		const errorMessage = error?.response?.data?.message ?? "An error has occured while signin up";
		toast.add({
			severity: "error",
			summary: "Error",
			detail: errorMessage,
			life: 3000,
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
</style>
