<template>
    <div class="channel-list-containner">
        <input class="search-bar form-control" type="text" v-model="input" placeholder="Search Channel" />
        <div class="channels-list" v-for="channel in filteredList()" :key="channel.id">
            <div class="channel-list-item d-inline-flex align-items-center">
                <span class="channel-info align-text-bottom" @click="addUserToChannel(channel.channelName)">
                    {{ channel.channelName }} - {{ channel.channelMode }}
                </span>
            </div>
        </div>
        <div class="no-result" v-if="input && !filteredList().length">
            <p>No results found!</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref, onMounted } from "vue";
import type { Channel } from "../types/ChatType";
import { useToast } from "primevue/usetoast";
import { ErrorType, errorMessage } from "@/types/ErrorType";
import { propsToAttrMap } from "@vue/shared";
import { HOST } from "../constants/constants";

const toast = useToast();

const allChannels = ref<Channel[]>([]);
const myChannels = ref<Channel[]>([]);

let input = ref("");

onMounted(async () => {
    await getAllChannels();
    await getMyChannels();
});

async function getMyChannels(): Promise<void> {
    await axios
        .get(`http://${HOST}:3001/chat/getMyChannels`, {
            withCredentials: true,
        })
        .then(async (response) => {
            const channels = response.data;
            const normalChannels: Channel[] = channels.filter((type) => {
                return (type.channelType === 'NORMAL');
            });
            myChannels.value = normalChannels.map(channel => {
                return {
                    id: channel.id,
                    channelName: channel.channelName,
                    channelMode: channel.channelMode,
                };
            });
        })
        .catch((error: any) => {
            console.log(error?.response?.data?.reason);
        });
};

async function getAllChannels(): Promise<void> {
    await axios
        .get(`http://${HOST}:3001/chat/getAllChannels`, {
            withCredentials: true,
        })
        .then(async (response) => {
            const channels = response.data;
            const normalChannels: Channel[] = channels.filter((type) => {
				return (type.channelType === 'NORMAL' && type.channelMode !== 'PRIVATE');
			});
			allChannels.value = normalChannels.map(channel => {
				return {
					id: channel.id,
					channelName: channel.channelName,
                return (type.channelType === 'NORMAL');
            });
            allChannels.value = normalChannels.map(channel => {
                return {
                    id: channel.id,
                    channelName: channel.channelName,
                    channelMode: channel.channelMode,
				};
			});
                };
            });
            console.log(allChannels.value);
        })
        .catch((error: any) => {
            console.log(error?.response?.data?.reason);
        });
};

function filteredList() {
    return allChannels.value.filter((channel) =>
        channel.channelName.toLowerCase().includes(input.value.toLocaleLowerCase())
    );
}

const emit = defineEmits<{
    (event: "isActionSuccess"): boolean;
}>();

function isChannelMember(name: string) {
    for (const ele of myChannels.value) {
        if (ele.channelName === name) {
            return true;
        }
    }
    return false;
}

async function addUserToChannel(name: string) {
    if (isChannelMember(name) === false) {
        await axios
            .post(`http://${HOST}:3001/chat/addUserToChannel`, { channelName: name }, {
                withCredentials: true,
            })
            .then(async (response) => {
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
                    detail: errorMessage(ErrorType.JOIN_CHANNEL_FAILED),
                    life: 3000,
                });
                emit("isActionSuccess", false);
            });
    }
    else {
        toast.add({
            severity: "info",
            summary: "info",
            detail: "You are already a member of this channel",
            life: 3000,
        });
    }
}

</script>

<style scoped>
.search-bar {
    width: 100%;
    margin-left: 30px;
}

.channel-list-item {
    width: 100%;
    margin-top: 10px;
    margin-left: 30px;
}

.channel-info {
    color: #FFFF;
    font-size: 25px;
}
</style>