<template>
    <div class="profile-edit-form">
        <form @submit.prevent="submitProfileForm">
            <div class="row mb-3 form-item">
                <label for="inputUsername" class="col-sm-2 col-form-label form-label">User Name</label>
                <div class="col-sm-10">
                    <input type="text" class="form-control" id="inputUsername" 
                    maxlength="10" pattern="[a-zA-Z0-9\-]+"
                    v-model="username">
                    <p>maxima 10 charaters, only letters and numbers allowed</p>
                </div>
            </div>

            <div class="row mb-3 form-item">
                <label for="inputAvatar" class="col-sm-2 col-form-label form-label">Upload Avatar</label>
                <div class="col-sm-10">
                    <input type="file" class="form-control" id="inputAvatar" ref="fileInput" name="avatar" accept="image/*"
                    @change="fileSelected($event)"> 
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
import axios from "axios";
import { ref } from "vue";
import storeUser from "@/store";
import { useToast } from "primevue/usetoast";
import { ErrorType, errorMessage } from "@/types/ErrorType";

const toast = useToast();

const username = ref<string>(storeUser.state.user.username);
const avatar = ref<string>(storeUser.state.user.avatar);
const twoFactor = ref<boolean>(storeUser.state.user.twoFactorEnabled);
const usernameValid = ref<boolean>(true);

function warnUserNameInvalid(message: string) {
  toast.add({
    severity: "error",
    summary: "Error",
    detail: message,
    life: 3000,
  });
  usernameValid.value = false;
  setTimeout(() => (usernameValid.value = true), 3000);
}

const selectedFile = ref(null);
function fileSelected(event:any) {
    selectedFile.value = event.target.files[0];
    avatar.value = event.target.files[0].name;
    if (!selectedFile.value) {
        toast.add({
            severity: "info",
            summary: "info",
            detail: "Please choose an image",
            life: 3000,
        });
    }
    else if (selectedFile.value.size > 8000000) {
        toast.add({
            severity: "info",
            summary: "info",
            detail: "File size is too big (maxima 1MB.)",
            life: 3000,
        });
    }
}

async function submitProfileForm() {
    if (username.value.length === 0) {
        warnUserNameInvalid("User name can not be empty")
    } else if (username.value !== storeUser.state.user.username) {
        await update_username(username.value)
    }
    if (selectedFile.value) {
        console.log("here");
        await update_avatar();
    }

    // console.log(username.value);
    // console.log(avatar.value);
    // console.log(twoFactor.value);
}


async function update_username(username: string) {
    const requestBody = {username: username}
    await axios
        .put("http://localhost:3001/user/update_username", requestBody, {
            withCredentials: true,
        })
        .then(async (response) =>  {
            storeUser.state.user.username = username;
            toast.add({
                severity: "success",
                summary: "Success",
                detail: "Username has been changed",
                life: 3000,
            });
        })
        .catch((error: any) => {
            if (error.response) {
                if (error.response.status == 403) {
                    toast.add({
                        severity: "info",
                        summary: "info",
                        detail: "User name already exist, please choose another one",
                        life: 3000,
                    });
                }
                else {
                    toast.add({
                        severity: "error",
                        summary: "Error",
                        detail: errorMessage(ErrorType.CHANGE_NAME_FAILED),
                        life: 3000,
                    });
                }
            }
        });
}

async function update_avatar() {
    const formData = new FormData();
    formData.append("avatar", selectedFile.value);
    await axios
        .post("http://localhost:3001/user/avatar", formData, {
            withCredentials: true,
        })
        .then(async (response) =>  {
            console.log(response);
            storeUser.state.user.avatar = selectedFile.value.name;
            toast.add({
                severity: "success",
                summary: "Success",
                detail: "New avatar has been uploaded",
                life: 3000,
            });
        })
        .catch((error: any) => {
            if (error.response) {
                // server side validation?
                if (error.response.status == 403) {
                    toast.add({
                        severity: "info",
                        summary: "info",
                        detail: "File not meet the requirement",
                        life: 3000,
                    });
                }
                else {
                    toast.add({
                        severity: "error",
                        summary: "Error",
                        detail: errorMessage(ErrorType.CHANGE_AVATAR_FAILED),
                        life: 3000,
                    });
                }
            }
        });
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

p {
    color: #FFFF;
    text-align: start;
}

</style>