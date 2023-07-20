<template>
    <div class="friend-buttons" :key="componentKey">
        <div class="d-grid gap-2" v-if="friendtype === 'NOT_FRIENDS'">
            <button type="button" class="btn btn-light" style="color:#042d3f;" @click="requestFriend">
                Add Friend</button>
        </div>
        <div class="d-grid gap-2" v-if="friendtype === 'REQUESTED'">
            <button type="button" class="btn btn-light disabled" style="color:#094b5f; background-color: #aab9ba;">
                Requested</button>
        </div>
        <div class="d-grid gap-2" v-if="friendtype === 'PENDING'">
            <button type="button" class="btn btn-light" style="color:#094b5f; background-color: #aab9ba;"
                @click="acceptFriend">
                Pending</button>
        </div>
        <div class="d-grid gap-2" v-if="friendtype === 'FRIENDS'">
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
import { HOST } from "@/constants/constants"

const props = defineProps({
    friendStatus: String,
    id: String
});

const confirm = useConfirm();
const toast = useToast();

const componentKey = ref(0);
const componentRerender = () => {
    componentKey.value += 1;
}

let friendtype = props.friendStatus;

const requestFriend = () => {
    confirm.require({
        message: "Are you sure you want to send a friend request to this user?",
        header: "Confirmation",
        accept: () => {
            sendFriendRequest("request");
        },
    });
}

const acceptFriend = () => {
    confirm.require({
        message: "Are you sure you want to add this user as friend?",
        header: "Confirmation",
        accept: () => {
            sendFriendRequest("accept");
        },
    });
}

const friendRequestBody = {
    otherUserId: String(props.id)
}

async function sendFriendRequest(type: string) {
    await axios
        .post(`http://${HOST}:3001/user/friend_request`, friendRequestBody, {
            withCredentials: true,
        })
        .then(async (response) => {
            if (type === "request") { friendtype = "REQUESTED"; }
            else if (type === "accept") { friendtype = "FRIENDS"; }
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