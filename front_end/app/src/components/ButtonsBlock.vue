<template>
    <div class="block-buttons">
        <div class="d-grid gap-2" v-if="blockedState === false">
            <button type="button" class="btn btn-outline-light"
                @click="blockUser">
                Block</button>
        </div>
        <div class="d-grid gap-2" v-else>
            <button type="button" class="btn btn-outline-light" style="color:#094b5f; background-color: #aab9ba;"
            @click="unblockUser">
                Unblock</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue';

const props = defineProps({
    blockedState: Boolean
});

const blockUser = () => {
    console.log("block button clicked");
}

const unblockUser = () => {
    console.log("unblock button clicked");
}

</script>

<style scoped>
.btn {
    border-radius: 10px;
    margin-top: 5px;
}

</style>