<template>
    <div class="match-history d-flex flex-row justify-content-around align-items-center">
        <MiniProfile :avatar="selfAvatar" :username="selfName" />
        <p class="match-score">{{ props.matchRecord.selfScore }} - {{ props.matchRecord.otherScore }}</p>
        <MiniProfile :avatar="props.matchRecord.otherAvatar" :username="props.matchRecord.otherName" />
    </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue';
import storeUser from "@/store";
import MiniProfile from './MiniProfile.vue';

const props = defineProps({
    matchRecord: Object
});

const selfName = ref<string>(storeUser.state.user.username);
// const selfAvatar = ref<string>(storeUser.state.user.avatar);
const selfAvatar = ref<string>("http://localhost:5173/src/assets/logo_klein.png");

</script>

<style scoped>
.match-score {
    font-weight: bold;
    font-size: 30px;
}
</style>