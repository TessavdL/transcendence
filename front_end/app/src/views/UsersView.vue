<template>
    <div>
        <div class="container-fluid">
            <div class="row">

                <div class="col-sm-3 col-md-2 users-sidebar">
                    <ul class="nav flex-column">
                        <li class="nav-item">
                            <h3 class="nav-link active" aria-current="page" href="#">
                                <i class="bi bi-people-fill fs-4" style="font-size: 2rem; color: #ffffff;"></i>
                                All Users</h3>
                        </li>
                        <li class="nav-item">
                            <h3 class="nav-link" href="#">
                                <i class="bi bi-person-heart fs-4" style="font-size: 2rem; color: #ffffff;"></i>
                                Friends</h3>
                        </li>
                        <li class="nav-item">
                            <h3 class="nav-link" href="#">
                                <i class="bi bi-person-fill-slash fs-4" style="font-size: 2rem; color: #ffffff;"></i>
                                Blocked</h3>
                        </li>
                    </ul>
                </div>
                    
                <div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 users-main">
                    <div v-for="user in users" :key="user.username">
                        <UserInfoCard :user="user" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref, onMounted } from "vue";

import UserInfoCard from '@/components/UserInfoCard.vue';
import UserInfo from "@/types/UserInfo.vue";

const users = ref([]);

onMounted(async () => {
    await getUsers();
});

async function getUsers() {
    await axios
        .get("http://localhost:3001/user/users", {
            withCredentials: true,
        })
        .then(async (response) =>  {
            users.value = response.data;
        })
        .catch(() => {
            console.log("cannot get users infomation");
        });
};

</script>

<style scoped>

h3 {
    color: #ffffff;
    font-weight: bold;
}

.nav-item {
    margin: 10px 0px;
}

.users-sidebar {
    position: fixed;
    width: 180px;
    top: 70px;
    bottom: 0;
    left: 0;
    z-index: 1000;
    display: block;
    padding: 20px;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: #0a242f;
}

.users-main {
    padding-left: 180px;
}

</style>>
