<template>
    <div class="logout">
        <div v-if="isVisible">
            <p class="confirm-msg">Are you sure?</p>
            <button type="button" class="btn btn-outline-light logout-button" @click="logOut">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-box-arrow-right" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
              </svg>
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
    .get("http://localhost:3001/auth/logout", {
      withCredentials: true,
    })
    .then(() => {
      storeUser.dispatch("logout");
      isVisible.value = false;
      socket.emit("exitUserSocketRoom");
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
.confirm-msg{
  font-size: 40px;
  margin: 30px auto;
  color: #99c4eb;
}

.logout-button{
  font-size: 20px;
  margin: 10px auto;
}
</style>