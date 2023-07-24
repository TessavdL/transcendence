<template>
  <div>
    <h3 class="logout-msg">Please login with your username and password</h3>
    <form @submit.prevent="login">
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
    await axiosInstance.post("/auth/login", data);
    storeUser.dispatch("login");
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
.input-group {
	display: flex;
  justify-content: center;
	gap: 10px;
	margin-bottom: 10px;
  color: white;
}
</style>
