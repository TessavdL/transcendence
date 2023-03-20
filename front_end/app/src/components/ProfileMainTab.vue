<template>
    <div class="profile-tab">
        <ul class="nav nav-tabs nav-justified" id="myTab" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#history-tab-pane" type="button" role="tab" aria-controls="history-tab-pane" aria-selected="true">Match History</button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#achievement-tab-pane" type="button" role="tab" aria-controls="achievement-tab-pane" aria-selected="false">Achievement</button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="contact-tab" data-bs-toggle="tab" data-bs-target="#ladder-tab-pane" type="button" role="tab" aria-controls="ladder-tab-pane" aria-selected="false">Ladder</button>
            </li>
        </ul>
        
        <div class="tab-content" id="myTabContent">
            <div class="tab-pane fade show active" id="history-tab-pane" role="tabpanel" aria-labelledby="home-tab" tabindex="0">
                <div v-for="match in matches" :key="match.intraId">
                    <MatchHistory :matchRecord="match" />
                </div>
            </div>

            <div class="tab-pane fade" id="achievement-tab-pane" role="tabpanel" aria-labelledby="profile-tab" tabindex="0">
                <AchievementBadges />
            </div>

            <div class="tab-pane fade" id="ladder-tab-pane" role="tabpanel" aria-labelledby="contact-tab" tabindex="0">
                <LadderTable />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MatchHistory from './MatchHistory.vue';
import AchievementBadges from './AchievementBadges.vue';
import LadderTable from './LadderTable.vue';

const matches = ref([
    { otherName: 'John', otherAvatar: 'http://localhost:5173/src/assets/logo_klein.png', otherScore: 5, selfScore: 10, id: 1 },
    { otherName: 'Mark', otherAvatar: 'http://localhost:5173/src/assets/logo_klein.png', otherScore: 10, selfScore: 9, id: 2 },
    { otherName: 'Peter', otherAvatar: 'http://localhost:5173/src/assets/logo_klein.png', otherScore: 7, selfScore: 10, id: 3 }
])

</script>

<style scoped>
.nav-item {
    font-weight: bold;
    font-size: 1.5em;
}

button[aria-selected="true"] {
    color: #0a242f;
}

button[aria-selected="false"] {
    color: #ffffff;
}
</style>