<template>
    <div class="d-inline-flex justify-content-around align-items-center" 
        v-for="badge in achievements" :key="badge.id">
        <div class="badge-item">
            <img :src="badgesPicture(badge.achievement)" class="badge-pic" :alt="badgesTitle(badge.achievement)">
            <h4 class="badge-title">{{ badgesTitle(badge.achievement) }}</h4>
            <p class="badge-description">{{ badgesdescription(badge.achievement) }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BadgesType, badgesPicture, badgesTitle, badgesdescription } from '@/types/BadgesType';

const achievements = ref([
    { achievement: BadgesType.WON_GAME, id: 1 },
    { achievement: BadgesType.WON_3GAME, id: 2 },
    { achievement: BadgesType.WON_3GAME_ROW, id: 3 },
    { achievement: BadgesType.LOSE_GAME, id: 4 },
    { achievement: BadgesType.LOSE_3GAME, id: 5 },
    { achievement: BadgesType.PLAYED_GAME, id: 6 },
    { achievement: BadgesType.CHANGE_NAME, id: 7 },
    { achievement: BadgesType.UPLOAD_AVATAR, id: 8 },
    { achievement: BadgesType.ADDED_2FA, id: 9 },
    { achievement: BadgesType.RANK1, id: 9 }
]);

</script>

<style scoped>
.badge-pic {
    width: 150px;
}

.badge-title {
    font-weight: blod;
    color: #ffffff;
    margin: 10px auto;
}

.badge-description {
    font-style: italic;
    color: #d3d3d3;
}

.badge-item {
    margin: 30px;
}

</style>