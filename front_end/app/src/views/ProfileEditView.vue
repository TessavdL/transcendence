<template>
    <div class="profile-edit-form">
        <form @submit.prevent="submitProfileForm">
            <div class="row mb-3 form-item">
                <label for="inputUsername" class="col-sm-2 col-form-label form-label">User Name</label>
                <div class="col-sm-10">
                    <input type="text" class="form-control" id="inputUsername" 
                    :placeholder="username + ' (maxima 10 charaters, only letters and numbers allowed)'" maxlength="10" pattern="[a-zA-Z0-9-]+"
                    v-model="username">
                </div>
            </div>

            <div class="row mb-3 form-item">
                <label for="inputEmail" class="col-sm-2 col-form-label form-label">Email Address</label>
                <div class="col-sm-10">
                    <input type="email" class="form-control" id="inputEmail" :placeholder="emaiAddress" v-model="emaiAddress">
                </div>
            </div>

            <div class="row mb-3 form-item">
                <label for="inputAvatar" class="col-sm-2 col-form-label form-label">Upload Avatar</label>
                <div class="col-sm-10">
                    <input type="file" class="form-control" id="inputAvatar" accept="image/*"
                    @change="handleFileUpload($event)"> 
                </div>
            </div>

            <div class="row mb-3">
                <div class="col-sm-10 offset-sm-2 d-inline-flex">
                    <div class="form-check form-check-item">
                        <input class="form-check-input" type="checkbox" id="twoFactorAuth" :checked="twoFactor" v-model="twoFactor">
                        <label class="form-check-label form-label" for="twoFactorAuth">
                            Enable two-factor authentication</label>
                    </div>
                </div>
            </div>


            <div class="form-buttons">
                <button type="button" class="btn btn-outline-primary form-button" 
                    style="color:#ffffff; background-color: #09252f; border: 2px solid #ffffff;"
                    @click="$router.push('/profile/current')">
                        Cancel
                </button>
                <button type="submit" class="btn btn-outline-primary form-button" 
                    style="color:#09252f; background-color: #ffffff; border: 2px solid #09252f;">
                        Save Changes
                </button>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import storeUser from "@/store";

const username = ref<string>(storeUser.state.user.username);
const emaiAddress = ref<string>("example@codam.nl");
const avatar = ref<string>(storeUser.state.user.avatar);
const twoFactor = ref<boolean>(storeUser.state.user.twoFactorEnabled);

function handleFileUpload(event:any) {
    avatar.value = event.target.files[0].name;
}

function submitProfileForm() {
    console.log("submit button clicked");
    console.log(username.value);
    console.log(avatar.value);
    console.log(twoFactor.value);
}
</script>

<style scoped>
.form-label {
    font-weight: bold;
    color: #FFFF;
    text-align: start;
}

.form-item {
    margin: 40px auto;
}

.form-check-item {
    margin-top: 30px;
    margin-bottom: 50px;
}

.form-button{
  width: 200px;
  font-weight: bold;
  margin: 0px 30px;
}

</style>