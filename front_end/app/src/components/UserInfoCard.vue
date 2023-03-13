<template>
    <div class="card info-card" style="width: 12rem; background-color: #032333;">
        <div>
            <RouterLink to="/profile">
                <img src="../assets/logo_klein.png" class="card-img-top avatar-pic" alt="avatar">
            </RouterLink>
        </div>

        <div class="card-body">
            <h3 class="card-title">Username&nbsp;<i class="bi bi-circle-fill" style="font-size: 1rem; color: cornflowerblue;"></i></h3>
            <div class="friend-buttons">
                <div class="d-grid gap-2" v-if="users.value[0].friendStatus === 'NOT_FRIENDS' ">
                    <button type="button" class="btn btn-light" style="color:#042d3f;"
                        @click="showProps">
                        Add Friend</button>
                </div>
                <div class="d-grid gap-2">
                    <button type="button" class="btn btn-light" style="color:#094b5f; background-color: #aab9ba;">
                        Requested</button>
                </div>
                <div class="d-grid gap-2">
                    <button type="button" class="btn btn-light" style="color:#ffffff; background-color: #147a99">
                        Friend</button>
                </div>
            </div>
            <div class="block-buttons">
                <div class="d-grid gap-2">
                    <button type="button" class="btn btn-outline-light">Block</button>
                </div>
                <div class="d-grid gap-2">
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

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import Job from '@/types/Job'
import OrderTerm from '@/types/OrderTerm'
import type UserInfo from '@/types/UserInfo';

export default defineComponent({
    props: {
        // jobs: {
        //     required: true,
        //     type: Array as PropType<Job[]>
        // },
        // order: {
        //     required: true,
        //     type: String as PropType<OrderTerm>
        // },
        user: {
            required: true,
            type: Object as PropType<UserInfo>
        }
    },
    setup(props) {
        // const orderedJobs = computed(() => {
        //     return [...props.jobs].sort((a: Job, b: Job) => {
        //         return a[props.order] > b[props.order] ? 1 : -1
        //     })
        // })
        
        const showProps = () => {
            console.log(props);
        }

        return { showProps }
    }
})

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