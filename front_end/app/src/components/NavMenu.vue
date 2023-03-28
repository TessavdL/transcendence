<template>
    <div>
        <nav class="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
            <div class="container-fluid">
                <!-- Logo -->
                <a class="navbar-brand me-auto" href="#">
                    <img src="../assets/logo_lang.png" alt="The Big Pong Theory" class="logo">
                </a>

                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" 
                        aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
                </button>

                <!-- navbar items -->
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto mb-2 mb-lg-0 align-middle">
                        <li class="nav-item">
                            <RouterLink class="nav-link" to="/">Home</RouterLink>
                        </li>
                        <li class="nav-item">
                            <RouterLink class="nav-link" to="/users">User</RouterLink>
                        </li>
                        <li class="nav-item">
                            <RouterLink class="nav-link" to="/chat0">Chat</RouterLink>
                        </li>

                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <img :src="storeUser.state.user.avatar" alt="Avatar" class="avatar d-inline-block align-text-center">
                                {{ storeUser.state.user.username }}
                            </a>
                            <ul class="dropdown-menu dropdown-menu-end dropdown-menu-dark">
                                <li><RouterLink class="nav-link" 
                                    :to="{name: 'ProfileCurrent'}">
                                    View Profile</RouterLink></li>
                                <li><RouterLink class="nav-link" to="/logout">Log Out</RouterLink></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import storeUser from "@/store";

</script>

<style scoped>
.logo {
    height: 45px;
    margin: 0px;
    border: 0px;
}

.navbar {
    font-size: 20px;
}
.avatar {
    object-fit: cover;
    width: 35px;
    height: 35px;
    border-radius: 50%;
}

li {
    margin: 0px 5px 0px 0px;
}

</style>
