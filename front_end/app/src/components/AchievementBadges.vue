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
    { achievement: BadgesType.CAHMP, id: 1 },
    { achievement: BadgesType.SUPER_LOSSER, id: 2 },
    { achievement: BadgesType.SUPER_WINNER, id: 3 },
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