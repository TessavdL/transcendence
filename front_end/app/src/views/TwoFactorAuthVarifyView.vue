<template>  
    <div class="digit-code">
        <h5>Enter 6-digit code</h5>
        <form @submit.prevent="submitCode">
            <input type="text" id="code" name="code" class="form-control" v-model="verificationCode" pattern="[0-9]{6}"/>
            <button type="button" class="btn btn-outline-primary form-button" 
                style="color:#ffffff; background-color: #09252f; border: 2px solid #ffffff;"
                @click="$router.push('/twofactorenable')">
                Back
            </button>
            <button type="submit" class="btn btn-outline-primary form-button" 
                style="color:#09252f; background-color: #ffffff; border: 2px solid #09252f;">
                Submit
            </button>
        </form>
    </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import storeUser from "@/store";
import { useToast } from "primevue/usetoast";

const router = useRouter();
const toast = useToast();

const intraId = ref<number>(-1);
const twoFactorEnabled = ref<boolean>(false);
const verificationCode = ref<string>("");

const axiosInstance = axios.create({
	baseURL: 'http://localhost:3001',
	withCredentials: true,
});

onMounted(async () => {
    twoFactorEnabled.value = storeUser.state.user.twoFactorEnabled;
    intraId.value = storeUser.state.user.intraId;
});

async function verify2fa() {
    const requestBody = {
        code: verificationCode.value,
    };
    try {
        const response = await axiosInstance.patch('/twofa/verify', requestBody);
        toast.add({
            severity: "success",
            summary: "success",
            detail: "enabled 2FA, redirecting to home",
            life: 3000,
        });
        storeUser.state.user.twoFactorEnabled = true;
        router.push({ name: "Home" });
    } catch (error) {
        verificationCode.value = '';
        toast.add({
            severity: "error",
            summary: "error",
            detail: "Failed to enable the 2FA",
            life: 3000,
        });
    }
}

async function authenticate2fa() {
    const requestBody = {
        code: verificationCode.value,
        intraId: intraId.value,
    };
    try {
        const response = await axiosInstance.patch('/twofa/authenticate', requestBody);
        storeUser.state.is2FA = true;
        toast.add({
            severity: "success",
            summary: "success",
            detail: "Logged in with 2FA, redirecting to home",
            life: 3000,
        });
        router.push({ name: "Home" });
    } catch (error) {
        verificationCode.value = '';
        toast.add({
            severity: "error",
            summary: "error",
            detail: "Failed to varify the digital code",
            life: 3000,
        });
    }
}

async function submitCode() {
    if (twoFactorEnabled.value === false) {
        await verify2fa();
    }
    else {
        await authenticate2fa();
    }     
}


</script>

<style scoped>

.form-control {
    width: 300px;
    margin: 5px auto;
    color: black;
    font-size: 30px;
    letter-spacing: 20px;
}

.btn {
    margin: 20px;
}

h5 {
    color: white;
    margin-top: 30px;
}

</style>