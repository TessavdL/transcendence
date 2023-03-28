<template>
    <div class="channel-list-containner">
        <input class="search-bar form-control" type="text" v-model="input" placeholder="Search Channel" />
        <div class="channels-list" v-for="channel in filteredList()" :key="channel.id">
            <div class="channel-list-item d-inline-flex align-items-center">
                <span class="channel-info align-text-bottom">{{ channel.channelName }} - {{ channel.channelMode }}</span>
            </div>
        </div>
        <div class="no-result" v-if="input&&!filteredList().length">
            <p>No results found!</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref, onMounted } from "vue";
import type { Channel } from "../types/ChatType";

const allChannels = ref<Channel[]>([]);
let input = ref("");

onMounted(async () => {
    await getAllChannels();
});

async function getAllChannels(): Promise<void> {
    await axios
        .get("http://localhost:3001/chat/getAllChannels", {
            withCredentials: true,
        })
        .then(async (response) =>  {
            const channels = response.data;
            const normalChannels: Channel[] = channels.filter((type) => {
				return (type.channelType === 'NORMAL');
			});
			allChannels.value = normalChannels.map(channel => {
				return {
					id: channel.id,
					channelName: channel.channelName,
                    channelMode: channel.channelMode,
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

</script>

<style scoped>
.search-bar {
    width: 100%;
    margin-left: 30px;
}

.channel-list-item {
    width: 100%;
    margin: 5px auto;
}

.channel-info {
    color: #FFFF;
    font-size: 25px;
}

</style>