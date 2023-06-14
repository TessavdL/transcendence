<template>
    <div>
        <h2>Verify 2FA code</h2>
        <form @submit.prevent="submitCode">
            <label for="code">Enter 6-digit code:</label>
            <input type="text" id="code" name="code" v-model="verificationCode" />
            <button type="submit">Submit</button>
        </form>
    </div>
</template>

<script lang="ts">
import { HOST } from '@/constants/constants';
import axios from 'axios';

export default {
    data() {
        return {
            intraId: -1,
            verificationCode: ''
        };
    },
    mounted() {
        const params = new URLSearchParams(window.location.search);
        const paramsData = params.get('intraId');
        if (paramsData) {
            this.intraId = parseInt(paramsData);
        }
    },
    methods: {
        async submitCode() {
            if (this.intraId === -1) {
                console.log('Unauthorized user');
            }
            const data = {
                code: this.verificationCode,
                intraId: this.intraId,
            };
            try {
                await axios.patch(`http://${HOST}:3001/twofa/authenticate`, data);
                this.$router.push({ name: "Home" });
            } catch (error: any) {
                console.log(error);
                this.verificationCode = '';
            }
        }
    }
}
</script>