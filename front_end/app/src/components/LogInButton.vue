<template>
  <div>
    <h3 class="logout-msg">Please login with 42 authentication</h3>
    <a class="btn btn-light logout-button" href="http://localhost:3001/auth/login">42 Intra Login</a>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.logout-msg{
  font-size: 30px;
  color: #99c4eb;
  margin: 30px auto;
}
.logout-button {
  margin: 30px auto;
  color: #07434c;
  background-color: #99c4eb;
  border: 1px solid #07434c;
  font-size: 30px;
}
</style>
