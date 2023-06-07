<template>
    <div class="block-buttons" :key="componentKey">
        <div class="d-grid gap-2" v-if="blocked === false">
            <button type="button" class="btn btn-outline-light" @click="blockUser">
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
import axios from "axios";
import { ref, defineProps } from 'vue';

import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { ErrorType, errorMessage } from "@/types/ErrorType";
import { HOST } from "../constants/constants";

const confirm = useConfirm();
const toast = useToast();

const props = defineProps({
    blockedState: Boolean,
    intraId: String,
});

const componentKey = ref(0);
const componentRerender = () => {
    componentKey.value += 1;
}

let blocked = props.blockedState;

const blockUser = () => {
    confirm.require({
        message: "Are you sure you want block this user?",
        header: "Confirmation",
        accept: () => {
            sendBlockRequest("/block_user");
        },
    });
}

const unblockUser = () => {
    confirm.require({
        message: "Are you sure you want unblock this user?",
        header: "Confirmation",
        accept: () => {
            sendBlockRequest("/unblock_user");
        },
    });
}

const blockRequestBody = {
    otherIntraId: Number(props.intraId)
}

async function sendBlockRequest(endpoint: String) {
    await axios
        .post(`http://${HOST}:3001/user` + endpoint, blockRequestBody, {
            withCredentials: true,
        })
        .then(async (response) => {
            blocked = !blocked;
            componentRerender();
            toast.add({
                severity: "success",
                summary: "Success",
                detail: "Done",
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