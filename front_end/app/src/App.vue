<script setup>
import { io } from 'socket.io-client';
import { onBeforeMount, ref } from 'vue';

// STATES
// match this to the port on which your backend is listening
const socket = io('http://localhost:3001');
const messages = ref([]);
const messageText = ref('');
const joined = ref(false);
const name = ref('');
const typingDisplay = ref('');

onBeforeMount(() => {
	socket.emit('findAllMessages', {}, (response) => {
		messages.value = response;
	});

	socket.on('message', (message) => {
		console.log(message);
		messages.value.push(message);
	});

	socket.on('typing', ({ name, isTyping }) => {
		if (isTyping) {
			typingDisplay.value = `${name} is typing...`;
		}
		else {
			typingDisplay.value = '';
		}
	});
});

// names of everyone that has joined so far in the ()
const join = () => {
	socket.emit('join', { name: name.value } ,() => {
		console.log(`${name.value} has joined the room`)
		joined.value = true;
	})
}

const sendMessage = () => {
	socket.emit('createMessage', { name: name.value, text: messageText.value }, () => {
		messageText.value = '';
	})
}

let timeout;
const emitTyping = () => {
	socket.emit('typing', { isTyping: true});
	timeout = setTimeout(() => {
		socket.emit('typing', { isTyping: false });
	}, 2000);
};

</script>

<template>
	<div class="chat">
		<div v-if="!joined">
			<form @submit.prevent = "join">
				<label style="margin: 10px">Name</label>
				<input v-model="name" />
				<button style='margin: 10px' type="submit">Send</button>
			</form>
		</div>
		<div class="chat-container" v-else>
			<div class="messages-container">
				<div v-for="message in messages">
					[{{ message.name }}]: {{ message.text }}
				</div>
			</div>
			<div class="message-input">
			<form @submit.prevent="sendMessage">
				<label style='margin: 10px'>Message</label>
				<input v-model="messageText" @input="emitTyping" />
				<button style='margin: 10px' type="submit">Send</button>
			</form>
		</div>
		</div>
		<br />
		<div v-if="typingDisplay">
			{{  typingDisplay }}
		</div>
	</div>
</template>

<style>
@import './assets/base.css';

#app {
	background-color: black;
	color: darkgray;
	font-family: Arial, Helvetica, sans-serif;
}

.chat {
	padding: 20px;
	height: 100vh;
	color: darkgray;
}

.chat-container {
	display: flex;
	flex-direction: column;
	height: 80%;
	color: darkgray;
}

.messages-container {
	flex: 1;
	color: darkgray;
}

</style>
