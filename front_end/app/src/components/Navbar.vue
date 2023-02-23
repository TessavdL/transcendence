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
        to: { name: "UserHome" },
    },
    {
        label: "Chat",
        icon: "pi pi-fw pi-comments",
    },
    {
        label: "Game",
        icon: "pi pi-fw pi-discord",
    },
    {
        label: "Profile",
        icon: "pi pi-fw pi-user",
        items: [
        [
            {
                items: [
                    { label: "View My Profile",},
                    { label: "Log Out", },
                ],
            },
        ],
        ],
    },
]);
</script>
