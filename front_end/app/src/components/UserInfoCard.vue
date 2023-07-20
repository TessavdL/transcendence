<template>
    <div class="card info-card" style="width: 12rem; background-color: #094b5f;">
        <div>
            <RouterLink :to="{ name: 'ProfileOther', params: { id: props.user.id } }">
                <img :src="`http://${HOST}:3001/user/get_avatar?avatar=` + props.user.avatar"
                    class="card-img-top avatar-pic" alt="avatar">
            </RouterLink>
        </div>

        <div class="card-body">
            <h3 class="card-title"> {{ props.user.name }}</h3>
            <div class="user-status">
                <div v-if="props.user.activityStatus === 'ONLINE'">
                    <i class="bi bi-circle-fill" style="font-size: 1rem; color: green;"></i> Online
                </div>
                <div v-if="props.user.activityStatus === 'OFFLINE'">
                    <i class="bi bi-circle-fill" style="font-size: 1rem; color: orange;"></i> Offline
                </div>
                <div v-if="props.user.activityStatus === 'INGAME'">
                    <i class="bi bi-circle-fill" style="font-size: 1rem; color: purple;"></i> In Game
                </div>
            </div>

            <div class="friend-buttons">
                <ButtonsFriend :friendStatus="props.user.friendStatus" :id="props.user.id" />
            </div>
            <div class="block-buttons">
                <ButtonsBlock :blockedState="props.user.blockedState" :id="props.user.id)" />
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue';
import ButtonsFriend from '@/components/ButtonsFriend.vue';
import ButtonsBlock from '@/components/ButtonsBlock.vue';
import { HOST } from '@/constants/constants';

const props = defineProps({
    user: Object
});

</script>

<style scoped>
.info-card {
    color: #ffffff;
    margin: 20px;
}

.avatar-pic {
    width: 10rem;
    height: 10rem;
    object-fit: cover;
    margin: 1rem auto 0rem;
    border-radius: 50%;

}
</style>