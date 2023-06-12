<template>
    <div v-if="isReady">
        <div class="col-sm-7 col-sm-offset-3 col-md-9 col-md-offset-2 chatbox-ch">
            <div class="row">
                <div class="ch-header d-inline-flex">
                    <div class="ch-name ch-header-item flex-grow-1">
                        <h3><i class="bi bi-wechat" style="font-size: 2rem; color: #ffffff;"></i> {{ props.channelName }}
                        </h3>
                    </div>
                    <div class="ch-dropdown ch-header-item">
                        <i class="bi bi-sliders2 dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"
                            style="font-size: 2rem; color: #ffffff;"></i>
                        <ul class="dropdown-menu">

                            <li v-if="!isPrivate() && isMemberOwner()"><a class="dropdown-item"
                                    @click="setChannelSettingsToTrue()">Channel
                                    Settings</a></li>
                            <li><a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#membersList">View All
                                    Members</a></li>
                            <li><a class="dropdown-item" href="#" @click="leaveChannel(activeChannel)">Leave Channel</a>
                            </li>
                            <li><a class="dropdown-item" href="#" @click="abandonChannel(activeChannel)">Abandon Channel</a>
                            </li>

                        </ul>
                    </div>
                </div>
            </div>

            <div v-if="channelSettings">
                <div v-if="isProtected()">
                    <input type="password" placeholder="Old Password" v-model="oldPassword" />
                    <input type="password" placeholder="New Password" v-model="newPassword" />
                    <button @click="changePassword()">Change Password</button>
                    <button @click="setChannelSettingsToFalse()">Cancel</button>
                </div>
                <div v-if="isProtected()">
                    <input type="password" placeholder="Password" v-model="password" />
                    <button @click="removePassword()">Remove Password</button>
                    <button @click="setChannelSettingsToFalse()">Cancel</button>
                </div>
                <div v-if="!isProtected()">
                    <input type="password" placeholder="Password" v-model="password" />
                    <button @click="setPassword()">Set Password</button>
                    <button @click="setChannelSettingsToFalse()">Cancel</button>
                </div>
            </div>

            <div v-if="!channelSettings" class="ch-body" id="messageBody">
                <div class="msg-container" v-for="msg in allMessages" :key="msg.text">
                    <div class="single-msg d-flex flex-column">
                        <div class="msg-userinfo d-inline-flex">
                            <img :src="'http://localhost:3001/user/get_avatar?avatar=' + msg.avatar" class="avatar-msg"
                                alt="avatar">
                            <h5 class="msg-usernaem">{{ msg.name }}</h5>
                        </div>
                        <div class="msg-text">
                            <p>{{ msg.text }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="!channelSettings" class="ch-input">
                <div class="input-group mb-3">
                    <input type="text" class="form-control" placeholder="type in messages here" v-model="messageText"
                        @keyup.enter="sendMessage()">
                    <button class="btn btn-outline-secondary" type="button" id="button-msg"
                        @click="sendMessage()">Send</button>
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
                            <div v-if="userIntraId == member.intraId">
                                <p v-if="member.role == 'OWNER'">{{ member.name }}(Owner)</p>
                                <p v-if="member.role == 'ADMIN'">{{ member.name }}(Admin)</p>
                                <p v-if="member.role == 'MEMBER'">{{ member.name }}(Member)</p>
                            </div>
                            <div class="dropdown" v-else>
                                <p v-if="member.role == 'OWNER'" class="dropdown-toggle" type="button" id="user-dropdown"
                                    data-bs-toggle="dropdown" aria-expanded="false">
                                    {{ member.name }}(Owner)
                                </p>
                                <p v-if="member.role == 'ADMIN'" class="dropdown-toggle" type="button" id="user-dropdown"
                                    data-bs-toggle="dropdown" aria-expanded="false">
                                    {{ member.name }}(Admin)
                                </p>
                                <p v-if="member.role == 'MEMBER'" class="dropdown-toggle" type="button" id="user-dropdown"
                                    data-bs-toggle="dropdown" aria-expanded="false">
                                    {{ member.name }}
                                </p>
                                <ul class="dropdown-menu" aria-labelledby="user-dropdown"
                                    v-if="userRole == 'OWNER' || userRole == 'ADMIN'">
                                    <li><a class="dropdown-item" href="#">
                                            <RouterLink class="nav-link" :to="{ path: '/profile/other/' + member.intraId }">
                                                View Profile</RouterLink>
                                        </a></li>
                                    <li><a class="dropdown-item" href="#">Invite to Game</a></li>
                                    <li v-if="member.role != 'OWNER'"><a class="dropdown-item" href="#"
                                            @click="banUser(member.intraId, activeChannel)">Ban</a></li>
                                    <li v-if="member.role != 'OWNER'"><a class="dropdown-item" href="#"
                                            @click="muteUser(member.intraId, activeChannel)">Mute</a></li>
                                    <li v-if="member.role != 'OWNER'"><a class="dropdown-item" href="#"
                                            @click="kickUser(member.intraId, activeChannel)">Kick</a></li>
                                    <li v-if="member.role == 'MEMBER'"><a class="dropdown-item" href="#"
                                            @click="promoteMemberToAdmin(member.intraId, activeChannel)">Promote member
                                            to
                                            admin</a></li>
                                    <li v-if="member.role == 'ADMIN'"><a class="dropdown-item" href="#"
                                            @click="demoteAdmintoMember(member.intraId, activeChannel)">Demote admin to
                                            member</a></li>
                                </ul>
                                <ul class="dropdown-menu" aria-labelledby="user-dropdown" v-else>
                                    <li><a class="dropdown-item" href="#">
                                            <RouterLink class="nav-link" :to="{ path: '/profile/other/' + member.intraId }">
                                                View Profile</RouterLink>
                                        </a></li>
                                    <li><a class="dropdown-item" @click="inviteToGame(member.intraId, activeChannel)">Invite
                                            to Game</a></li>
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
import { ref, defineProps, inject, onMounted, onUnmounted, onBeforeMount, onUpdated, computed } from "vue";
import type { Socket } from "socket.io-client";
import $ from "jquery";
import { useToast } from "primevue/usetoast";
import { ErrorType, errorMessage } from "@/types/ErrorType";
import type { Member, Message, Punishment } from "../types/ChatType";
import storeUser from "@/store";
import router from "@/router";
import { onBeforeRouteLeave } from "vue-router";

const props = defineProps({
    channelName: {
        type: String,
        required: true,
    },
    channelMode: {
        type: String,
        required: true,
    },
});

const toast = useToast();
const socket = inject("socketioInstance") as Socket;
const axiosInstance = axios.create({
    baseURL: 'http://localhost:3001',
    withCredentials: true,
});

const activeChannel = ref('');
const allMessages = ref<Message[]>([]);
const channelSettings = ref<boolean>(false);
const member = ref<Member>();
const messageText = ref('');
const oldPassword = ref('');
const newPassword = ref('');
const password = ref('');
const allMembers = ref<Member[]>([]);
const userIntraId = ref<number>(storeUser.state.user.intraId);
const userRole = ref();
const joinChannelCalled = ref(false);

onBeforeMount(async () => {
    console.log('in onBeforeMount channelName = ', props.channelName);
    if (joinChannelCalled.value === false) {
        await joinChannel(props.channelName);
        joinChannelCalled.value = true;
        console.log('in onBeforeMount back from joinChannel');
    }
});

onMounted(async () => {
    socket.on('joined', async (me: Member) => {
        if (me === null) {
            // should instead be one where you have to press ok and then get pushed to chat home page
            toast.add({
                severity: "error",
                summary: "Error",
                detail: errorMessage(ErrorType.CHAT_FORBIDDEN),
                life: 3000,
            });
        }
        else {
            await loadAllMembers(props.channelName);
            member.value = me;
            console.log('in joined', { me });
        }
    });

    socket.on('leaveChannel', (data) => {
        leaveChannel(data);
    });

    socket.on('left', () => {
        router.push({
            name: 'Chat',
        });
    });

    socket.on('message', (data) => {
        allMessages.value.push(data);
        $("#messageBody").animate({ scrollTop: 20000000 }, "slow");
    });
});

onBeforeRouteLeave(() => {
    console.log('leaving page');
    socket.removeAllListeners();
    if (member.value) {
        leaveChannel(activeChannel.value);
    }
});

const isReady = computed(() => {
    return !!member.value;
});

function isMemberOwner() {
    return member.value?.role === 'OWNER';
}

function setChannelSettingsToTrue() {
    channelSettings.value = true;
}

function setChannelSettingsToFalse() {
    channelSettings.value = false;
}

function isProtected() {
    return props.channelMode === 'PROTECTED';
}

function isPrivate() {
    return props.channelMode === 'PRIVATE';
}

async function isMuted(channelName: string): Promise<Punishment> {
    const response = await axiosInstance.get('chat/amIMuted', { params: { channelName: channelName } });
    const mute: Punishment = response.data;
    return mute;
}

async function changePassword() {
    const data = {
        channelName: props.channelName,
        oldPassword: oldPassword.value,
        newPassword: newPassword.value,
    }
    try {
        await axiosInstance.patch('chat/changePassword', data);
        setChannelSettingsToFalse();
    } catch (error: any) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: errorMessage(ErrorType.CHANGE_PASSWORD_FAILED),
            life: 3000,
        });
    }
    oldPassword.value = '';
    newPassword.value = '';
}

async function setPassword() {
    const data = {
        channelName: props.channelName,
        password: password.value,
    };
    try {
        await axiosInstance.patch('chat/setPassword', data);
        setChannelSettingsToFalse();
    } catch (error: any) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: errorMessage(ErrorType.SET_PASSWORD_FAILED),
            life: 3000,
        });
    }
    password.value = '';
}

async function removePassword() {
    const data = {
        channelName: props.channelName,
        password: password.value,
    };
    console.log(data);
    try {
        await axiosInstance.patch('chat/deletePassword', data);
        setChannelSettingsToFalse();
    } catch (error: any) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: errorMessage(ErrorType.REMOVE_PASSWORD_FAILED),
            life: 3000,
        });
    }
    password.value = '';
}

async function joinChannel(channelName: string): Promise<void> {
    socket.emit('joinChannel', channelName);
    activeChannel.value = channelName;
    await loadAllMessages();
}

async function loadAllMessages(): Promise<void> {
    const request = {
        channelName: activeChannel.value,
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
}

function sendErrorMessage(mute: Punishment) {
    let text: string;
    if (mute.time === 0) {
        text = `You are still muted for one second`;
    }
    else {
        text = `You are still muted for ${mute.time} seconds`;
    }
    const data: Message = {
        channelName: '',
        intraId: 0,
        name: '',
        avatar: './src/assets/prohibited.jpeg',
        text: text,
    }
    allMessages.value.push(data);
    messageText.value = '';
    $("#messageBody").animate({ scrollTop: 20000000 }, "slow");
}

async function sendMessage() {
    const mute: Punishment = await isMuted(activeChannel.value);
    if (mute.status === true) {
        sendErrorMessage(mute);
    }
    else {
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
}

async function loadAllMembers(channelName: string): Promise<void> {
    const request = {
        channelName: channelName,
    }
    try {
        const response = await axiosInstance.get('chat/getMembersInChannel', { params: request });
        allMembers.value = response.data;
        for (let member of allMembers.value) {
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

async function kickUser(otherIntraId: number, channelName: string): Promise<void> {
    socket.emit('kickUser', { otherIntraId: otherIntraId, channelName: channelName });
}

async function banUser(otherIntraId: number, channelName: string): Promise<void> {
    socket.emit('banUser', { otherIntraId: otherIntraId, channelName: channelName });
}

async function muteUser(otherIntraId: number, channelName: string): Promise<void> {
    socket.emit('muteUser', { otherIntraId: otherIntraId, channelName: channelName });
}

async function promoteMemberToAdmin(otherIntraId: number, channelName: string): Promise<void> {
    try {
        const data = {
            channelName: channelName,
            otherIntraId: otherIntraId,
        }
        await axiosInstance.patch('chat/promoteMemberToAdmin', data);
        await loadAllMembers(channelName);
    } catch (error: any) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: errorMessage(ErrorType.GENERAL),
            life: 3000,
        });
    }
}

async function demoteAdmintoMember(otherIntraId: number, channelName: string): Promise<void> {
    try {
        const data = {
            channelName: channelName,
            otherIntraId: otherIntraId,
        }
        await axiosInstance.patch('chat/demoteAdminToMember', data);
        await loadAllMembers(channelName);
    } catch (error: any) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: errorMessage(ErrorType.GENERAL),
            life: 3000,
        });
    }
}

function inviteToGame(otherIntraId: number, channelName: string): void {
    // Jelle code here
}

async function abandonChannel(channelName: string) {
    const data = {
        channelName: channelName,
    };
    try {
        await axiosInstance.delete('chat/removeUserFromChannel', { data });
        leaveChannel(props.channelName);
    } catch (error: any) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: errorMessage(ErrorType.GENERAL),
            life: 3000,
        });
    }

}

function leaveChannel(channelName: string): void {
    socket.emit('leaveChannel', channelName);
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

.ch-header {
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