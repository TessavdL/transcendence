<template>
    <div class="ladder-table">
        <table class="table">
            <thead class="table-header">
                <tr>
                    <th scope="col">Rank</th>
                    <th scope="col">User</th>
                    <th scope="col">Win</th>
                    <th scope="col">Loss</th>
                </tr>
            </thead>
            <tbody class="table-body" v-for="player in ladder" :key="player.rank">
                <tr>
                    <th scope="row">{{ player.rank }}</th>
                    <td>
                        <img :src="avatarPrefix + player.userAvatar" class="avatar-pic-mini" alt="avatar">
                        {{ player.userName }}
                    </td>
                    <td>{{ player.win }}</td>
                    <td>{{ player.loss }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
import { HOST } from '@/constants/constants';
import { ref, defineProps } from 'vue';

const avatarPrefix = ref(`http://${HOST}:3001/user/get_avatar?avatar=`);

const ladder = ref([
    { userName: 'John', userAvatar: 'src/assets/default_avatars/Cody_Sleepy.jpeg', win: 5, loss: 10, rank: 1 },
    { userName: 'Mark', userAvatar: 'src/assets/default_avatars/Cody_Seal.jpeg', win: 10, loss: 9, rank: 2 },
    { userName: 'Peter', userAvatar: 'src/assets/default_avatars/Cody_Sad.jpeg', win: 7, loss: 10, rank: 3 }
])
</script>

<style scoped>
.table-header {
    color: #FFFF;
    font-weight: bold;
    font-size: 25px;
}

.table-body {
    color: #FFFF;
    font-size: 25px;
}

.avatar-pic-mini {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
}
</style>