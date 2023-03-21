<template>
    <div class="friend-buttons">
        <div class="d-grid gap-2" v-if="friendState === 'NOT_FRIENDS' ">
            <button type="button" class="btn btn-light" style="color:#042d3f;"
                 @click="addFriend">
                 Add Friend</button>
        </div>
        <div class="d-grid gap-2" v-if="friendState === 'PENDING'">
            <button type="button" class="btn btn-light disabled" style="color:#094b5f; background-color: #aab9ba;">
                 Requested</button>
            </div>
        <div class="d-grid gap-2" v-if="friendStatus === 'FRIENDS'">
            <button type="button" class="btn btn-light disabled" style="color:#ffffff; background-color: #147a99">
                Friend</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref, defineProps } from 'vue';

import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { ErrorType, errorMessage } from "@/types/ErrorType";

const props = defineProps({
    friendStatus: String,
    intraId: String
});

const confirm = useConfirm();
const toast = useToast();

const componentKey = ref(0);
const componentRerender = () => {
    componentKey.value += 1;
}

let friendState = props.friendStatus;


const addFriend = () => {
    console.log(props.intraId);
    confirm.require({
      message: "Are you sure you want to add this user as user?",
      header: "Confirmation",
      accept: () => {
        sendFriendRequest();
      },
    });
}

const friendRequestBody = {
    otherIntraId: Number(props.intraId)
}

async function sendFriendRequest() {
    await axios
        .post("http://localhost:3001/user/friend_request", friendRequestBody, {
            withCredentials: true,
        })
        .then(async (response) =>  {
            console.log(response.data);
            friendState = "PENDING";
            componentRerender();
            toast.add({
                severity: "success",
                summary: "Success",
                detail: "Send a friend request to the user",
                life: 3000,
            })
        })
        .catch(() => {
            toast.add({
                severity: "error",
                summary: "Error",
                detail: errorMessage(ErrorType.GENERAL),
                life: 3000,
            }); 
        });
};

</script>

<style scoped>
.btn {
    border-radius: 10px;
    margin-top: 5px;
}

</style>