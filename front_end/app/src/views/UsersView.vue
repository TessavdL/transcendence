<template>
    <div>
        <div class="container-fluid">
            <div class="row flex-nowrap">
                <nav class="navbar col-auto col-md-3 col-xl-2 px-sm-2 px-0 navbar-dark" style="background-color: #032333;">
                    <ul class="navbar-nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start">
                        <li class="nav-item">
                            <i class="bi bi-people-fill fs-4" style="font-size: 2rem; color: #9aa4aa;"></i>
                            <RouterLink class="nav-link ms-1 d-none d-sm-inline" to="/">Users</RouterLink>
                        </li>
                        <li class="nav-item">
                            <i class="bi bi-person-heart fs-4" style="font-size: 2rem; color: #9aa4aa;"></i>
                            <RouterLink class="nav-link ms-1 d-none d-sm-inline" to="/users">Friends</RouterLink>
                        </li>
                        <li class="nav-item">
                            <i class="bi bi-person-fill-slash fs-4" style="font-size: 2rem; color: #9aa4aa;"></i>
                            <RouterLink class="nav-link ms-1 d-none d-sm-inline" to="/chat">Blocked</RouterLink>
                        </li>
                    </ul>
                </nav>

                <div class="col py-3">
                    <h3>Left Sidebar with Submenus</h3>
                    <p>
                        An example 2-level sidebar with collasible menu items. The menu functions like an "accordion" where only a single 
                        menu is be open at a time. While the sidebar itself is not toggle-able, it does responsively shrink in width on smaller screens.</p>
                </div>
            </div>
        </div>
    </div>

</template>

<script setup lang="ts">

</script>

<style scoped>
.navbar {
    max-width: 150px;
    font-weight: bold;
    font-size: 1em;
}

.nav-item {
    margin: 10px 0px;
}

</style>>
