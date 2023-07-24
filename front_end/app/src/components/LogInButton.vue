<template>
  <div>
    <h3 class="logout-msg">Please login with your username and password</h3>
    <form @submit.prevent="login">
      <div>
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="username" required />
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <button class="btn btn-info login-button" type="submit">Login</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { HOST } from '@/constants/constants';
import axios from "axios";
import { useToast } from "primevue/usetoast";
import storeUser from "@/store";

const axiosInstance = axios.create({
  baseURL: `http://${HOST}:3001`,
  withCredentials: true,
})
const toast = useToast();
const username = ref<string>("");
const password = ref<string>("");

async function login() {
  const data = {
    name: username.value,
    password: password.value,
  }
  try {
    // console.log(`${HOST}`);
    const response = await axiosInstance.post("/auth/login", data);
    // Log the response headers
    console.log('Response Headers:', response.headers);
    storeUser.dispatch("login");
  } catch (error: any) {
    console.log("an error occured in login");
    let errorMessage: string;
    if (error.response && error.response.status === 401) {
      errorMessage = error.response.data.message;
    } else {
      errorMessage = "An error has occured logging in";
    }
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
