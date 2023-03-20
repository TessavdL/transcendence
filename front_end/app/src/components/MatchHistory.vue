<template>
    <div class="match-history d-flex flex-row justify-content-around align-items-center">
        <MiniProfile :avatar="props.currentAvatar" :username="props.currentName" />
        <p class="match-score">{{ props.matchRecord.currentScore }} - {{ props.matchRecord.otherScore }}</p>
        <MiniProfile :avatar="props.matchRecord.otherAvatar" :username="props.matchRecord.otherName" />
    </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue';
import MiniProfile from './MiniProfile.vue';

const props = defineProps({
    currentName: String,
    currentAvatar: String,
    matchRecord: Object,
});

</script>

<style scoped>
.match-score {
    font-weight: bold;
    font-size: 30px;
}
</style>