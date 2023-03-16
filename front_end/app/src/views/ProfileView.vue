<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-sm-3 col-md-2 profile-sidebar">
                <div class="avatar-container">
                    <img src="../assets/logo_klein.png" alt="Avatar" class="avatar d-inline-block align-text-center">
                </div>
                
                <div class="user-name-status">
                    <h3>{{ storeUser.state.user.username }}</h3>
                    <div>
                        <i class="bi bi-circle-fill" style="font-size: 1rem; color: green;"></i>Online
                        <!-- <div class="user-status">
                            <div v-if="user.activityStatus === 'ONLINE'">
                                <i class="bi bi-circle-fill" style="font-size: 1rem; color: green;"></i> Online
                            </div>
                            <div v-if="user.activityStatus === 'OFFLINE'">
                                <i class="bi bi-circle-fill" style="font-size: 1rem; color: orange;"></i> Offline
                            </div>
                            <div v-if="user.activityStatus === 'INGAME'">
                                <i class="bi bi-circle-fill" style="font-size: 1rem; color: purple;"></i> In Game
                            </div>
                        </div> -->
                    </div>
                </div>   

                <div class="profile-matchinfo">
                    <p>win: nn</p>
                    <p>loss: nn</p>
                    <p>ladder level: nn</p>
                </div>

                <button type="button" class="btn btn-outline-primary watch-button" 
                    style="color:#ffffff; background-color: #094b5f; border: 2px solid #ffffff;"
                    @click="watchGame">
                    Edit Profile
                </button>
            </div>

            <div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 profile-main">
                <div class="profile-tab">
                    <ul class="nav nav-tabs nav-justified" id="myTab" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#history-tab-pane" type="button" role="tab" aria-controls="history-tab-pane" aria-selected="true">Match History</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#achievement-tab-pane" type="button" role="tab" aria-controls="achievement-tab-pane" aria-selected="false">Achievement</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="contact-tab" data-bs-toggle="tab" data-bs-target="#ladder-tab-pane" type="button" role="tab" aria-controls="ladder-tab-pane" aria-selected="false">Ladder</button>
                        </li>
                    </ul>
                    <div class="tab-content" id="myTabContent">
                        <div class="tab-pane fade show active" id="history-tab-pane" role="tabpanel" aria-labelledby="home-tab" tabindex="0">Match History (coming soon)</div>
                        <div class="tab-pane fade" id="achievement-tab-pane" role="tabpanel" aria-labelledby="profile-tab" tabindex="0">Achievement (coming soon)</div>
                        <div class="tab-pane fade" id="ladder-tab-pane" role="tabpanel" aria-labelledby="contact-tab" tabindex="0">Ladder (coming soon)</div>
                    </div>
                </div>


            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import storeUser from "@/store";

function watchGame() {
    console.log("edit profile")
}
</script>

<style scoped>

.profile-sidebar {
    position: fixed;
    width: 200px;
    top: 70px;
    bottom: 0;
    left: 0;
    z-index: 1000;
    display: block;
    padding: 20px;
    overflow-x: hidden;
    overflow-y: auto; /* Scrollable contents if viewport is shorter than content. */
    color: #ffffff;
    background-color: #0a242f;
}

.avatar {
    margin: 20px auto;
    width: 160px;
    height: 160px;
    border-radius: 50%;
}

.profile-matchinfo {
    margin: 30px auto;
}

p {
    margin: 5px auto;
}

.profile-main {
    padding-left: 200px;
    padding-right: 0px;
    color: #FFFF;
}

button[aria-selected="true"] {
    color: #0a242f;
}

button[aria-selected="false"] {
    color: #ffffff;
}

</style>