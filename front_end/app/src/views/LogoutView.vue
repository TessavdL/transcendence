<template>
    <div class="logout">
        <br />
        <div v-if="isVisible">
            <p>Are you sure to log out?</p>
            <Button class="p-button-rounded p-button-text p-button-outlined"
                label="Log Out" icon="pi pi-power-off"
                @click="logOut"> </Button>
        </div>
    </div>

</template>

<script  setup lang="ts">
import { ref, inject } from "vue";
import axios from "axios";
import storeUser from "@/store";
import router from "@/router";
import { useToast } from "primevue/usetoast";
import Button from "primevue/button";
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

<style>

</style>