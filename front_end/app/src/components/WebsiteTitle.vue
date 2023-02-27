<template>
    <div>
        <img class="title" src="@/assets/title.png">
        <div v-if="isUserLogIn">
            <NavMenu />
        </div>
        <NavMenu />
        <div><Toast /></div>

    </div>
    
</template>

<script setup lang="ts">
import { computed, inject } from "vue";
import { useRouter } from "vue-router";
import { Socket } from "socket.io-client";

import { useConfirm } from "primevue/useconfirm";
import Toast from "primevue/toast";
import ConfirmDialog from "primevue/confirmdialog";

import storeUser from "@/store";
import NavMenu from "@/components/NavMenu.vue";

const confirm = useConfirm();
const socket: Socket = inject("socketioInstance") as Socket;
const router = useRouter()
const isUserLogIn = computed(() => {
  // if (storeUser.state.isAuthenticated === false) {
  //   storeUser.dispatch("login");
  // }
  console.log(storeUser.state.isAuthenticated);
  return storeUser.state.isAuthenticated;
});

socket.on("logOutFromAnotherSocket", () => {
  storeUser.dispatch("logout");
  router.push({ name: "Home" });
});

</script>

<style scoped>
.title {
    display:block;
    height: 50px;
    margin: 0 auto;
}

</style>
