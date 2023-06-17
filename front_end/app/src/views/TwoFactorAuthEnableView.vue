<template>
    <div class="two-factor">
        <div class="qr-code">
            <h5>Please scan the QR code blow with Google authenticator</h5>
            <img :src=qrcodeUrl alt="QRcode">
        </div>
        
        <div>
            <button class="btn btn-primary" @click="RedirectToVarify">Submit</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import storeUser from "@/store";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import { ErrorType, errorMessage } from "@/types/ErrorType";

const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

const intraId = ref<number>(-1);
const qrcodeUrl = ref<string>("");

const axiosInstance = axios.create({
	baseURL: 'http://localhost:3001',
	withCredentials: true,
});

onMounted(async () => {
    await getQrcode();
});

async function getQrcode() {
    try {
        const response = await axiosInstance.patch('/twofa/enable');
		qrcodeUrl.value = response.data;
    } catch (error) {
        toast.add({
            severity: "error",
            summary: "error",
            detail: "Failed to load QR code, please retry",
            life: 3000,
        });
    }
};

function RedirectToVarify() {
    confirm.require({
      message: "Make sure that you have scaned the QR Code",
      header: "Confirmation",
      accept: () => {
        router.push({ name: "twofactorvarify" });
      },
    });
}


</script>

<style scoped>
.two-factor {
    color: white;
}

.qr-code {
    margin: 30px auto;
}


</style>