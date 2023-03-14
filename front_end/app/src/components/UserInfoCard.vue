<template>
    <div class="card info-card" style="width: 12rem; background-color: #032333;">
        <div>
            <RouterLink to="/profile">
                <img src="../assets/logo_klein.png" class="card-img-top avatar-pic" alt="avatar">
                <!-- need to do dymatic avatar -->
            </RouterLink>
        </div>

        <div class="card-body">
            <h3 class="card-title">{{ user.username }}&nbsp;<i class="bi bi-circle-fill" style="font-size: 1rem; color: cornflowerblue;"></i></h3>
            <div class="friend-buttons">
                <div class="d-grid gap-2" v-if="user.friendStatus === 'NOT_FRIENDS' ">
                    <button type="button" class="btn btn-light" style="color:#042d3f;"
                        @click="addFriend">
                        Add Friend</button>
                </div>
                <div class="d-grid gap-2" v-if="user.friendStatus === 'PENDING'">
                    <button type="button" class="btn btn-light disabled" style="color:#094b5f; background-color: #aab9ba;">
                        Requested</button>
                </div>
                <div class="d-grid gap-2" v-if="user.friendStatus === 'FRIENDS'">
                    <button type="button" class="btn btn-light" style="color:#ffffff; background-color: #147a99">
                        Friend</button>
                </div>
            </div>
            <div class="block-buttons">
                <div class="d-grid gap-2" v-if="user.blockedState === false">
                    <button type="button" class="btn btn-outline-light">Block</button>
                </div>
                <div class="d-grid gap-2" v-else>
                    <button type="button" class="btn btn-outline-light" style="color:#094b5f; background-color: #aab9ba;">
                        Unblock</button>
                </div>
            </div>
        </div>
    </div>
    <!-- <div class="job-list">
        <p>Ordered by {{ order }}</p>
        <ul>
            <li v-for="job in orderedJobs" :key="job.id">
                <h2>{{ job.title }} in {{ job.location }}</h2>
                <div class="salary">
                    <p>{{ job.salary }} rupees</p>
                </div>
                <div class="description">
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Adipisci quae recusandae enim iusto, error autem debitis. Velit temporibus consequatur optio libero, repudiandae alias laboriosam qui quibusdam incidunt non, enim obcaecati!</p>
                </div>
            </li>
        </ul>    
    </div>  -->
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue';
import type UserInfo from '@/types/UserInfo';

const props = defineProps({
    user: Object
});
        
const addFriend = () => {
    console.log("friend button clicked");
    console.log(props);
}

</script>

<style scoped>
.info-card {
    color: #ffffff;
    margin: 20px;
}

.avatar-pic {
    width: 10rem;
    margin: 1rem auto 0rem;
    border-radius: 50%;

}

.btn {
    border-radius: 10px;
    margin-top: 5px;
}
</style>