<template>
    <div>
        <div class="col-sm-7 col-sm-offset-3 col-md-9 col-md-offset-2 chatbox-ch">
            <div class="row">
                <div class="ch-header d-inline-flex">
                    <div class="ch-name ch-header-item flex-grow-1">
                        <h3><i class="bi bi-wechat" style="font-size: 2rem; color: #ffffff;"></i> {{ props.channelName }}</h3>
                    </div>
                    <div class="ch-dropdown ch-header-item">
                        <i class="bi bi-sliders2 dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" style="font-size: 2rem; color: #ffffff;"></i>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#membersList">View All Members</a></li>
                            <li><a class="dropdown-item" href="#" @click="leaveChannel()">Leavel Channel</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="ch-body" id="messageBody">
                <div class="msg-container" v-for="msg in allMessages" :key="msg.text">
                    <div class="single-msg d-flex flex-column">
                        <div class="msg-userinfo d-inline-flex">
                            <img :src="'http://localhost:3001/user/get_avatar?avatar=' + msg.avatar" class="avatar-msg" alt="avatar">
                            <h5 class="msg-usernaem">{{ msg.name }}</h5>
                        </div>
                        <div class="msg-text">
                            <p>{{ msg.text }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="ch-input">
                <div class="input-group mb-3">
                    <input type="text" class="form-control" placeholder="type in messages here" v-model="messageText" @keyup.enter="sendMessage()" >
                    <button class="btn btn-outline-secondary" type="button" id="button-msg" @click="sendMessage()">Send</button>
                </div>
            </div>
        </div>

        <!-- Modal of Member List -->
        <div class="modal fade" id="membersList" tabindex="-1" aria-labelledby="membersListLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="membersListLabel">All Members</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div v-for="member in allMembers" :key="member.intraId">
                        <div v-if="userIntraId==member.intraId">
                            <p v-if="member.role=='OWNER'">{{ member.name }}(Owner)</p>
                            <p v-if="member.role=='ADMIN'">{{ member.name }}(Owner)</p>
                            <p v-if="member.role=='MEMBER'">{{ member.name }}(Owner)</p>
                        </div>
                        <div class="dropdown" v-else>
                            <p v-if="member.role=='OWNER'" class="dropdown-toggle" type="button" id="user-dropdown" data-bs-toggle="dropdown" aria-expanded="false">
                                {{ member.name }}(Owner)
                            </p>
                            <p v-if="member.role=='ADMIN'" class="dropdown-toggle" type="button" id="user-dropdown" data-bs-toggle="dropdown" aria-expanded="false">
                                {{ member.name }}(Admin)
                            </p>
                            <p v-if="member.role=='MEMBER'" class="dropdown-toggle" type="button" id="user-dropdown" data-bs-toggle="dropdown" aria-expanded="false">
                                {{ member.name }}
                            </p>
                            <ul class="dropdown-menu" aria-labelledby="user-dropdown" v-if="userRole=='OWNER' || userRole=='ADMIN'">
                                <li><a class="dropdown-item" href="#">
                                    <RouterLink class="nav-link" 
                                    :to="{path: '/profile/other/' + member.intraId}">
                                    View Profile</RouterLink>
                                </a></li>
                                <li><a class="dropdown-item" href="#">Invite to Game</a></li>
                                <li v-if="member.role!='OWNER'"><a class="dropdown-item" href="#" @click="banUser(member.intraId, activeChannel)">Ban</a></li>
                                <li v-if="member.role!='OWNER'"><a class="dropdown-item" href="#" @click="muteUser(member.intraId, activeChannel)">Mute</a></li>
                                <li v-if="member.role!='OWNER'"><a class="dropdown-item" href="#" @click="kickUser(member.intraId, activeChannel)">kick</a></li>
                                <li v-if="member.role=='MEMBER'"><a class="dropdown-item" href="#">Set as Admin</a></li>
                            </ul>
                            <ul class="dropdown-menu" aria-labelledby="user-dropdown" v-else>
                                <li><a class="dropdown-item" href="#">
                                    <RouterLink class="nav-link" 
                                    :to="{path: '/profile/other/' + member.intraId}">
                                    View Profile</RouterLink>
                                </a></li>
                                <li><a class="dropdown-item" href="#">Invite to Game</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref, defineProps, inject, onMounted, onUnmounted } from "vue";
import type { Socket } from "socket.io-client";
import $ from "jquery";
import { useToast } from "primevue/usetoast";
import { ErrorType, errorMessage } from "@/types/ErrorType";
import type { Messages } from "../types/ChatType";
import storeUser from "@/store";

const props = defineProps({
    channelName: String,
});

onMounted(async () => {
    await joinChannel(props.channelName);
    await loadAllMembers(props.channelName);
    socket.on('message', (data) => {
		allMessages.value.push(data);
	});
    $("#messageBody").animate({ scrollTop: 20000000 }, "slow");
});

onUnmounted(() => {
  socket.off("joinChannel");
  socket.off("sendMessageToChannel");
  socket.off("message");
});

const toast = useToast();

const socket = inject("socketioInstance") as Socket;
const axiosInstance = axios.create({
	baseURL: 'http://localhost:3001',
	withCredentials: true,
});

const activeChannel = ref('');
const activeChannelType = ref('');

const allMessages = ref<Messages[]>([]);
const messageText = ref('');

async function joinChannel(channelName: string): Promise<void> {
    socket.emit('joinChannel', channelName);
    activeChannel.value = channelName;
    activeChannelType.value = 'NORMAL';
    await loadAllMessages();
};

async function loadAllMessages(): Promise<void> {
    const request = {
        channelName: activeChannel.value,
        channelType: activeChannelType.value,
    }
    try {
		const response = await axiosInstance.get('chat/getAllMessagesInChannel', { params: request });
        allMessages.value = response.data;
	}
    catch (error: any) {
		toast.add({
            severity: "error",
            summary: "Error",
            detail: errorMessage(ErrorType.LOAD_MSG_FAILED),
            life: 3000,
        });
	}
};

async function sendMessage() {
    const messageData = {
        messageText: messageText.value,
		channelName: activeChannel.value,
    };
    try {
        socket.emit('sendMessageToChannel', messageData);
        messageText.value = '';
        $("#messageBody").animate({ scrollTop: 20000000 }, "slow");
    }
    catch (error: any) {
		toast.add({
            severity: "error",
            summary: "Error",
            detail: errorMessage(ErrorType.SEND_MSG_FAILED),
            life: 3000,
        });
	}
}

const allMembers = ref([]);
const userIntraId = ref<number>(storeUser.state.user.intraId);
const userRole = ref();
async function loadAllMembers(channelName: string): Promise<void> {
    const request = {
        channelName: channelName,
    }
    try {
		const response = await axiosInstance.get('chat/getMembersInChannel', { params: request });
        allMembers.value = response.data;
        for ( let member of allMembers.value) {
            if (member.intraId == userIntraId.value) {
                userRole.value = member.role
            }
        }
	}
    catch (error: any) {
		toast.add({
            severity: "error",
            summary: "Error",
            detail: errorMessage(ErrorType.LOAD_CHANNEL_MEMBERS_FAILED),
            life: 3000,
        });
	}
};

// don't know if it's working, does not have enough accouts to test it fully
async function kickUser(otherIntraId: number, channelName: string): Promise<void> {
	socket.emit('kickUser', { otherIntraId: otherIntraId, channelName: channelName });
}

async function banUser(otherIntraId: number, channelName: string): Promise<void> {
	socket.emit('banUser', { otherIntraId: otherIntraId, channelName: channelName });
}

async function muteUser(otherIntraId: number, channelName: string): Promise<void> {
	socket.emit('muteUser', { otherIntraId: otherIntraId, channelName: channelName });
}

// not working for this moment, don't know why
function leaveChannel(): void {
	socket.emit('leaveChannel', activeChannel);
}

</script>

<style scoped>
.chatbox-ch {
    margin-left: 30px;
    margin-top: 10px;
    min-height: 760px;
    min-width: 500px;
}

h3 {
    margin-top: 5px;
    margin-bottom: 5px;
    margin-left: 10px;
    text-align: left;
}

.ch-header-item {
    margin-right: 10px;
}
.ch-header{
    border-bottom: #c8b8b8 2px solid;
}

.avatar-msg {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 10px;
}
.msg-usernaem {
    font-style: italic;
    color: #c8b8b8;
}
.msg-text {
    text-align: left;
    margin-left: 30px;
    font-size: 20px;
}
.single-msg {
    margin-top: 15px;
}

.ch-input {
    position: fixed;
    bottom: 0;
    width: 50%;
    min-width: 500px;
}
.ch-body {
    display: flex; 
    flex-direction: column;
    overflow: auto;
    max-height: 75vh;
}

#membersList {
    color: black;
}
</style>