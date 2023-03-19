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
            <div class="tab-pane fade show active" id="history-tab-pane" role="tabpanel" aria-labelledby="home-tab" tabindex="0">Match History (coming soon)</div>
            <div class="tab-pane fade" id="achievement-tab-pane" role="tabpanel" aria-labelledby="profile-tab" tabindex="0">Achievement (coming soon)</div>
            <div class="tab-pane fade" id="ladder-tab-pane" role="tabpanel" aria-labelledby="contact-tab" tabindex="0">Ladder (coming soon)</div>
        </div>
    </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
button[aria-selected="true"] {
    color: #0a242f;
}

button[aria-selected="false"] {
    color: #ffffff;
}
</style>