<template>
    <div>
        <div class="container-fluid">
            <div class="row">

                <div class="col-sm-3 col-md-2 users-sidebar">
                    <ul class="nav flex-column">
                        <li class="nav-item">
                            <h3 class="nav-link" @click="handleFilter('none')">
                                <i class="bi bi-people-fill fs-4" style="font-size: 2rem; color: #ffffff;"></i>
                                All Users
                            </h3>
                        </li>
                        <li class="nav-item">
                            <h3 class="nav-link" @click="handleFilter('activityStatus')">
                                <i class="bi bi-person-up fs-4" style="font-size: 2rem; color: #ffffff;"></i>
                                Online
                            </h3>
                        </li>
                        <li class="nav-item">
                            <h3 class="nav-link" @click="handleFilter('friendStatusFriend')">
                                <i class="bi bi-person-heart fs-4" style="font-size: 2rem; color: #ffffff;"></i>
                                Friends
                            </h3>
                        </li>
                        <li class="nav-item">
                            <h3 class="nav-link" @click="handleFilter('blockedState')">
                                <i class="bi bi-person-fill-slash fs-4" style="font-size: 2rem; color: #ffffff;"></i>
                                Blocked
                            </h3>
                        </li>
                        <li class="nav-item">
                            <h3 class="nav-link" @click="handleFilter('friendStatusPending')">
                                <i class="bi bi-person-add fs-4" style="font-size: 2rem; color: #ffffff;"></i>
                                Pending
                            </h3>
                        </li>
                    </ul>

                </div>

                <div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 users-main">
                    <div class="card-group">
                        <div v-for="user in filteredUsers" :key="user.intraId">
                            <UserInfoCard :user="user" />
                        </div>
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
import { HOST } from "@/constants/constants";

const users = ref([]);
const filteredUsers = ref([]);
const filterCat = ref<String>('none');

onMounted(async () => {
    await getUsers();
    filteredUsers.value = [...users.value];
});

async function getUsers() {
    await axios
        .get(`http://${HOST}:3001/user/users`, {
            withCredentials: true,
        })
        .then(async (response) => {
            users.value = response.data;
        })
        .catch(() => {
            console.log("failed get users infomation");
        });
};

const handleFilter = async (cat: String) => {
    filterCat.value = cat;
    await getUsers();
    filteredUsers.value = [...users.value];
    if (cat === 'activityStatus') {
        filteredUsers.value = filteredUsers.value.filter((user) => {
            return (
                user.activityStatus === "ONLINE"
            );
        });;
    }
    else if (cat === 'friendStatusFriend') {
        filteredUsers.value = filteredUsers.value.filter((user) => {
            return (
                user.friendStatus === "FRIENDS"
            );
        });;
    }
    else if (cat === 'friendStatusPending') {
        filteredUsers.value = filteredUsers.value.filter((user) => {
            return (
                user.friendStatus === "PENDING"
            );
        });;
    }
    else if (cat === 'blockedState') {
        filteredUsers.value = filteredUsers.value.filter((user) => {
            return (
                user.blockedState === true
            );
        });;
    }
    else {
        filteredUsers.value = filteredUsers.value;
    }
}



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
    padding-left: 200px;
}</style>
