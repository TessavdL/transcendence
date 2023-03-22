<template>
    <div>
        <div class="container-fluid">
            <div class="row">

                <div class="col-sm-3 col-md-2 chat-sidebar">
                    <ul class="nav flex-column">
                        <li class="nav-item">
                            <h2 class="nav-element" @click="changeChatMain('allChannels')">
                                <i class="bi bi-border-all" style="font-size: 1.5rem; color: #ffffff;"></i>
                                View All Channels</h2>
                        </li>
                        <li class="nav-item">
                            <h2 class="nav-element">My Channels
                                <i class="bi bi-plus-lg" style="font-size: 1.5rem; color: #ffffff;" @click="changeChatMain('mychannels')"></i>
                            </h2>
                            </li>
                        <li class="nav-item">
                            <h2 class="nav-element">Direct Messages
                                <i class="bi bi-plus-lg" style="font-size: 1.5rem; color: #ffffff;" @click="changeChatMain('dm')"></i>
                            </h2>
                        </li>
                    </ul>
                </div>
                
                <div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 chat-main" :key="componentKey">
                    <div v-if="chatMain==='allChannels'">
                        <h2>All Channels</h2>
                    </div>
                    <div v-if="chatMain==='mychannels'">
                        <h2>My Channels</h2>
                    </div>
                    <div v-if="chatMain==='dm'">
                        <h2>Direct Msg</h2>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref, onMounted } from "vue";

const componentKey = ref(0);
const componentRerender = () => {
    componentKey.value += 1;
}

let chatMain = ref<String>("");
function changeChatMain(chatType: String) {
    chatMain.value = chatType;
    console.log(chatType);
    componentRerender();
}

// const users = ref([]);
// const filteredUsers= ref([]);
// const filterCat = ref<String>('none');

// onMounted(async () => {
//     await getUsers();
//     filteredUsers.value = [...users.value];
// });

// async function getUsers() {
//     await axios
//         .get("http://localhost:3001/user/users", {
//             withCredentials: true,
//         })
//         .then(async (response) =>  {
//             users.value = response.data;
//         })
//         .catch(() => {
//             console.log("failed get users infomation");
//         });
// };
</script>

<style scoped>
h2 {
    color: #ffffff;
}
.nav-item {
    margin: 10px auto;
}

.nav-element {
    font-size: 20px;
    color: #ffffff;
    font-weight: bold;
}

.chat-sidebar {
    position: fixed;
    width: 230px;
    top: 70px;
    bottom: 0;
    left: 0;
    z-index: 1000;
    display: block;
    padding: 10px;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: #0a242f;
}

.chat-main {
    padding-left: 230px;
    color: #ffffff;
}

</style>>
