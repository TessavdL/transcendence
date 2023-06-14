<template>
    <div class="match-history d-flex flex-row justify-content-around align-items-center">
        <MiniProfile :avatar="props.currentAvatar" :username="props.currentName" />
        <p class="match-score">{{ props.matchRecord.currentScore }} - {{ props.matchRecord.otherScore }}</p>
        <MiniProfile :avatar="avatarPrefix + props.matchRecord.otherAvatar" :username="props.matchRecord.otherName" />
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