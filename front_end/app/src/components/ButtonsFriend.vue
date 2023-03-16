<template>
    <div class="friend-buttons">
        <div class="d-grid gap-2" v-if="friendStatus === 'NOT_FRIENDS' ">
            <button type="button" class="btn btn-light" style="color:#042d3f;"
                 @click="addFriend">
                 Add Friend</button>
        </div>
        <div class="d-grid gap-2" v-if="friendStatus === 'PENDING'">
            <button type="button" class="btn btn-light disabled" style="color:#094b5f; background-color: #aab9ba;">
                 Requested</button>
            </div>
        <div class="d-grid gap-2" v-if="friendStatus === 'FRIENDS'">
            <button type="button" class="btn btn-light" style="color:#ffffff; background-color: #147a99">
                Friend</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue';

const props = defineProps({
    friendStatus: String
});

const addFriend = () => {
    console.log("friend button clicked");
}

</script>

<style scoped>
.btn {
    border-radius: 10px;
    margin-top: 5px;
}

</style>