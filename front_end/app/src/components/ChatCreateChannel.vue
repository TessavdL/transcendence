<!-- <template>
    <div class="create-channel-container">
		<input class="search-bar form-control" type="text" v-model="input" placeholder="Search Channel" />
		<form @submit.prevent="createChannel">
			<div class="input-container">
            <div class="mb-3 channel-name">
                <label for="channelName" class="form-label">Channel Name</label>
                <input type="text" class="form-control" id="channelName" v-model="channelName">
            </div>

            <div class="form-check form-check-inline channel-type">
                <input class="form-check-input" type="radio" name="inlineRadioOptions" id="type-public" value="PUBLIC" v-model="channelType">
                <label class="form-check-label" for="type-public">public</label>
            </div>
            <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="inlineRadioOptions" id="type-protected" value="PROTECTED" v-model="channelType">
                <label class="form-check-label" for="type-protected">protected</label>
            </div>
            <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="inlineRadioOptions" id="type-private" value="PRIVATE" v-model="channelType">
                <label class="form-check-label" for="type-private">private</label>
            </div>
            
            <div class="mb-3 channel-password" v-if="channelType === 'PROTECTED'">
                <label for="channelPassword" class="form-label">Channel Password</label>
                <input type="password" class="form-control" id="channelPassword" v-model="channelPassword" minlength="4" required placeholder="minimal 4 charaters">
            </div>

            <div class="submit-channel">
                <button type="submit" class="btn btn-outline-light" style="color:#ffffff; background-color: #09252f; border: 2px solid #ffffff;">Create Channel</button>
            </div>
		</div>
		</form>
	</div>
</template> -->
<template>
	<div class="create-channel-container">
		<form @submit.prevent="createChannel">
		<div class="channel-types">
				<div class="form-check form-check-inline channel-types">
					<input class="form-check-input" type="radio" name="inlineRadioOptions" id="type-public" value="PUBLIC" v-model="channelType">
					<label class="form-check-label" for="type-public">Public</label>
				</div>
				<div class="form-check form-check-inline">
					<input class="form-check-input" type="radio" name="inlineRadioOptions" id="type-protected" value="PROTECTED" v-model="channelType">
					<label class="form-check-label" for="type-protected">Protected</label>
				</div>
				<div class="form-check form-check-inline">
					<input class="form-check-input" type="radio" name="inlineRadioOptions" id="type-private" value="PRIVATE" v-model="channelType">
					<label class="form-check-label" for="type-private">Private</label>
				</div>
				<div class="mb-3 channel-password" v-if="channelType === 'PROTECTED'">
					<label for="channelPassword" class="form-label">Channel Password</label>
					<input type="password" class="form-control" id="channelPassword" v-model="channelPassword" minlength="4" required placeholder="Minimum 4 characters">
				</div>
				<div class="input-container">
					<input type="text" class="form-control" v-model="channelName" placeholder="Channel Name">
					<button type="submit" class="btn btn-outline-light">Create Channel</button>
				</div>
			</div>
		</form>
	</div>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref, defineEmits } from "vue";
import { useToast } from "primevue/usetoast";
import { ErrorType, errorMessage } from "@/types/ErrorType";
import { ChannelMode } from "@/types/ChatType"
import ChatUserList from "@/components/ChatUserList.vue";

const toast = useToast();

const channelName = ref('');
const channelType = ref(ChannelMode.PUBLIC);
const channelPassword = ref('');

const emit = defineEmits<{
    (event: "isActionSuccess"): boolean;
}>();

let input = ref("");

function createChannel() {
    createRequestBody();
    console.log(requestBody);
    sendCreateChannelRequest();
}

let requestBody = {};
function createRequestBody() {
    if (channelPassword.value === '') {
        requestBody = {
            channelMode: channelType.value,
            channelName: channelName.value,
        }
    }
    else {
        requestBody = {
            channelMode: channelType.value,
            channelName: channelName.value,
            password: channelPassword.value,
        }  
    }
}

async function sendCreateChannelRequest() {
    await axios
        .post("http://localhost:3001/chat/createChannel", requestBody, {
            withCredentials: true,
        })
        .then(async (response) =>  {
            toast.add({
                severity: "success",
                summary: "Success",
                detail: "Created",
                life: 3000,
            });
            emit("isActionSuccess", true);
        })
        .catch(() => {
            toast.add({
                severity: "error",
                summary: "Error",
                detail: errorMessage(ErrorType.CREATE_CHANNEL_FAILED),
                life: 3000,
            });
            emit("isActionSuccess", false);
        });
};
</script>

<!-- <style scoped>
.create-channel-container{
    margin-left: 20px;
}

.channel-password {
    margin-top: 30px;
    margin-bottom: 30px;
}

.form-label {
    font-weight: bold;
    font-size: 30px;
}
.form-check-label{
    font-size: 20px;
}
.btn{
    margin-top: 30px;
    margin-bottom: 30px;
}
</style> -->

<style scoped>
.create-channel-container {
  margin-left: 30px;
}

.channel-type {
  /* display: flex; */
	justify-content: space-between;
	margin-bottom: 18px;
}

.input-container {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
}

.input-container input {
  padding-right: 120px;
}

.input-container .btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  color: #ffffff;
  background-color: #09252f;
  border: 1px solid #ffffff;
}

.form-check-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 18px;
  color: #ffffff;
  /* background-color: #09252f; */
  border: 1px solid #ffffff;
  padding: 5px 10px;
  width: 100px;
}
.channel-password {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
}

.channel-password label {
  display: flex;
}

.channel-password input {
  padding-right: 120px;
  color: #ffffff;
  background-color: #09252f;
  border: 1px solid #ffffff;
  position: absolute;
  margin-top: 150px;
}

.channel-password input::placeholder {
  color: #ffffff;
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
}

.channel-password .btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  color: #ffffff;
  background-color: #09252f;
  border: 1px solid #ffffff;
}

</style>