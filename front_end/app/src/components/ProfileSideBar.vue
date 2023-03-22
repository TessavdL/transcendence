<template>
    <div class="profile-sidebar-info">
        <div class="avatar-container">
            <img src="../assets/logo_klein.png" alt="Avatar" class="avatar d-inline-block align-text-center">
        </div>
                
        <div class="user-name">
            <h3>{{ props.userProflie.username }}</h3>
        </div>

        <div class="user-status">
            <div v-if="props.userProflie.activityStatus === 'ONLINE'">
                <i class="bi bi-circle-fill" style="font-size: 1rem; color: green;"></i> Online
            </div>
            <div v-if="props.userProflie.activityStatus === 'OFFLINE'">
                <i class="bi bi-circle-fill" style="font-size: 1rem; color: orange;"></i> Offline
            </div>
            <div v-if="props.userProflie.activityStatus === 'INGAME'">
                <i class="bi bi-circle-fill" style="font-size: 1rem; color: purple;"></i> In Game
            </div>
        </div>

        <div class="profile-matchinfo">
            <p>win: {{ props.userProflie.win }}</p>
            <p>loss: {{ props.userProflie.loss }}</p>
            <p>ladder level: {{ props.userProflie.ladderLevel }}</p>
        </div>              
    </div>
</template>

<script setup lang="ts">

const props = defineProps({
    userProflie: Object
});

</script>

<style scoped>

.avatar {
    margin: 20px auto;
    width: 160px;
    height: 160px;
    border-radius: 50%;
}

.profile-matchinfo {
    margin: 30px auto;
}

p {
    margin: 5px auto;
}

</style>