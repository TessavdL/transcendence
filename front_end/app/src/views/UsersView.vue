<template>
    <div>
        <div class="container-fluid">
            <div class="row flex-nowrap">
                <nav class="navbar col-auto col-md-3 col-xl-2 px-sm-2 px-0 navbar-dark" style="background-color: #032333;">
                    <ul class="navbar-nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start">
                        <li class="nav-item">
                            <button class="ms-1 btn btn-dark" style="background-color: #032333;" >
                                <i class="bi bi-people-fill fs-4" style="font-size: 2rem; color: #9aa4aa;"></i>
                                All Users</button>
                        </li>
                        <li class="nav-item">
                            <button class="ms-1 btn btn-dark" style="background-color: #032333;" >
                                <i class="bi bi-person-heart fs-4" style="font-size: 2rem; color: #9aa4aa;"></i>
                                Friends</button>
                        </li>
                        <li class="nav-item">
                            <button class="ms-1 btn btn-dark" style="background-color: #032333;" >
                                <i class="bi bi-person-fill-slash fs-4" style="font-size: 2rem; color: #9aa4aa;"></i>
                                Blocked</button>
                        </li>
                    </ul>
                </nav>

                <div class="col py-3">
                    <!-- <UserInfoCard :jobs="jobs" :order="order"/> -->
                    <!-- <UserInfoCard :users="users" /> -->
                    <div v-for="user in users" :key="user.username">
                        <p>{{ user }}</p>
                        <!-- <UserInfoCard :user="user" /> -->
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- @click="handleClick('title')"
    @click="handleClick('salary')"
    @click="handleClick('location')" -->
</template>

<script lang="ts">
import axios from "axios";
import { ref, onMounted, onBeforeMount, defineComponent } from "vue";

import UserInfoCard from '@/components/UserInfoCard.vue';
import UserInfo from "@/types/UserInfo.vue";
import Job from '@/types/Job'
import OrderTerm from '@/types/OrderTerm'

export default defineComponent({
    components: { UserInfoCard },
    setup() {  

        // const users = ref<UserInfo[]>([]);
        const users = ref([]);
        const getUsers = async () => {
            await axios
                .get("http://localhost:3001/user/users", {
                    withCredentials: true,
                })
                .then(async (response) =>  {
                    users.value = response.data;
                    console.log(users.value);
                })
                .catch(() => {
                    console.log("cannot get users infomation");
                });
        }

        getUsers();

        // const jobs = ref<Job[]>([
        //     { title: 'farm worker', location: 'lon lon ranch', salary: 30000, id: '1' },
        //     { title: 'quarryman', location: 'death mountain', salary: 40000, id: '2' },
        //     { title: 'flute player', location: 'the lost woods', salary: 35000, id: '3' },
        //     { title: 'fisherman', location: 'lake hylia', salary: 21000, id: '4' },
        //     { title: 'prison guard', location: 'gerudo valley', salary: 32000, id: '5' }
        // ])

        // const order = ref<OrderTerm>('title')

        // const handleClick = (term: OrderTerm) => {
        //     order.value = term
        // }
        
        return { users }
    }
})

</script>

<style scoped>
.navbar {
    max-width: 150px;
    font-weight: bold;
    font-size: 1em;
}

.nav-item {
    margin: 10px 0px;
}

p {
    color: #ffff;
}

</style>>
