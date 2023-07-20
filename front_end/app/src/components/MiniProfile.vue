<template>
    <div class="match-history">
        <div class="mini-profile">
            <img :src=props.avatar class="avatar-pic-mini" alt="avatar">
            <p>{{ props.name }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue';

const props = defineProps({
    name: String,
    avatar: String,
});
</script>

<style scoped>
.avatar-pic-mini {
    object-fit: cover;
    width: 40px;
    height: 40px;
    margin: 1rem auto 0rem;
    border-radius: 50%;
}

</style>