<template>
    <div class="match-history d-flex flex-row justify-content-around align-items-center">
        <MiniProfile :avatar="avatarPrefix + props.matchRecord.winnerAvatar" :username="props.matchRecord.winnerName" />
        <p class="match-score">{{ props.matchRecord.winnerScore }} - {{ props.matchRecord.loserScore }}</p>
        <MiniProfile :avatar="avatarPrefix + props.matchRecord.loserAvatar" :username="props.matchRecord.loserName" />
    </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue';
import MiniProfile from './MiniProfile.vue';
import { HOST } from '@/constants/constants';

const props = defineProps({
    currentName: String,
    currentAvatar: String,
    matchRecord: Object,
});

const avatarPrefix = ref(`http://${HOST}:3001/user/get_avatar?avatar=`);

</script>

<style scoped>
.match-score {
    font-weight: bold;
    font-size: 30px;
}
</style>