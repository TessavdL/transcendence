<template>
    <div class="user-list-containner">
        <input class="search-bar form-control" type="text" v-model="input" placeholder="Search User" />
        <div class="users-list" v-for="user in filteredList()" :key="user.intraId">
            <div class="user-list-item d-inline-flex align-items-center">
                <img :src="avatarPrefix + user.avatar" class="avatar-pic-mini" alt="avatar">
                <span class="user-name align-text-bottom">{{ user.name }}</span>
            </div>
        </div>
        <div class="no-result" v-if="input&&!filteredList().length">
            <p>No results found!</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref, onMounted } from "vue";
import type { User } from "../types/ChatType";

const allUsers = ref<User[]>([]);
let input = ref("");
const avatarPrefix = ref("http://localhost:3001/user/get_avatar?avatar=");

onMounted(async () => {
    await getAllUsers();
});

async function getAllUsers(): Promise<void> {
    await axios
        .get("http://localhost:3001/user/usersexceptself", {
            withCredentials: true,
        })
        .then(async (response) =>  {
            const users = response.data;
			allUsers.value = users.map(user => {
				return {
					intraId: user.intraId,
					name: user.name,
                    avatar: user.avatar,
				};
			});
        })
        .catch((error: any) => {
            console.log(error?.response?.data?.reason);
        });
};

function filteredList() {
    return allUsers.value.filter((user) => 
        user.name.toLowerCase().includes(input.value.toLocaleLowerCase())
    );
}

</script>

<style scoped>
.search-bar {
    width: 100%;
    margin-left: 30px;
}

.user-list-item {
    width: 100%;
    margin: 5px auto;
}

.avatar-pic-mini {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    margin-left: 30px;
    margin-right: 20px;
    margin-top: 10px;
}

.user-name {
    color: #FFFF;
    font-size: 25px;
}

</style>