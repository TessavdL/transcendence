<template>
    <MegaMenu :model="MenuItems" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import MegaMenu from "primevue/megamenu";
import storeUser from "@/store";

const MenuItems = ref([
    {
        label: "Home",
        icon: "pi pi-fw pi-home",
        to: { name: "Home" },
    },
    {
        label: "Chat",
        icon: "pi pi-fw pi-comments",
        to: { name: "Chat" },
    },
    {
        label: "Game",
        icon: "pi pi-fw pi-discord",
        to: { name: "Game" },
    },
    {
        label: "Profile",
        icon: "pi pi-fw pi-user",
        items: [
        [
            {
                items: [
                    { label: "View My Profile", to: { name: "Profile" } },
                    { label: "Log Out", },
                ],
            },
        ],
        ],
    },
]);
</script>
