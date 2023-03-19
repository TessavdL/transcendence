<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-sm-3 col-md-2 profile-sidebar">
                <ProfileSideBar :userProflie="userProflie" />

                <div class="profile-buttons">
                    <ButtonsFriend :friendStatus="userProflie.friendStatus" :intraId="props.intraId" />
                    <ButtonsBlock :blockedState="userProflie.blockedState" :intraId="props.intraId" />
                </div>
                
            </div>

            <div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 profile-main">
                <ProfileMainTab />
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref, onMounted } from "vue";
import ProfileSideBar from "@/components/ProfileSideBar.vue";
import ButtonsFriend from '@/components/ButtonsFriend.vue';
import ButtonsBlock from '@/components/ButtonsBlock.vue';
import ProfileMainTab from "@/components/ProfileMainTab.vue";

const props = defineProps({
    intraId: String,
});

const userProflie = ref({
    avatar: null,
    username: "",
    activityStatus: "ONLINE",
    blockedState: false,
    friendStatus: "NOT_FRIENDS",
    win: "00",
    loss: "00",
    ladderLevel: "00",
});

onMounted(async () => {
    await getUserProfile();
});

async function getUserProfile() {
    await axios
        .get("http://localhost:3001/user/" + props.intraId, {
            withCredentials: true,
        })
        .then(async (response) =>  {
            userProflie.value.avatar = response.data.avatar;
            userProflie.value.username = response.data.username;
            userProflie.value.activityStatus = response.data.activityStatus;
            userProflie.value.blockedState = response.data.blockedState;
            userProflie.value.friendStatus = response.data.friendStatus;
            // userProflie.value.win = response.data.win;
            // userProflie.value.loss = response.data.loss;
            // userProflie.value.ladderLevel = response.data.ladderLevel;
        })
        .catch(() => {
            console.log("cannot get users profile infomation");
        });
};

function watchGame() {
    console.log(userProflie.value);
}
</script>

<style scoped>

.profile-sidebar {
    position: fixed;
    width: 200px;
    top: 70px;
    bottom: 0;
    left: 0;
    z-index: 1000;
    display: block;
    padding: 20px;
    overflow-x: hidden;
    overflow-y: auto; /* Scrollable contents if viewport is shorter than content. */
    color: #ffffff;
    background-color: #0a242f;
}

.profile-main {
    padding-left: 200px;
    padding-right: 0px;
    color: #FFFF;
}

</style>