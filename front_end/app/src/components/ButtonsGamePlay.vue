<template>
	<button class="neon-button" @click="onClick">
		<slot></slot>
	</button>
</template>

<script lang="ts">
	export default {
	name: 'NeonButton',
};

</script>

<style>
	.neon-button {
		position: relative;
		display: inline-block;
		padding: 8px 16px;
		font-size: 16px;
		font-weight: bold;
		text-align: center;
		color: #ffffff;
		background-color: #000000;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		overflow: hidden;
		}
	.neon-button::before,
	.neon-button::after {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		}

	.neon-button::before {
		background: linear-gradient(45deg, #ff00ff, #00ffff);
		opacity: 0.8;
		z-index: -1;
		animation: neonGlow 1.5s ease-in-out infinite alternate;
		}

	.neon-button::after {
		background: linear-gradient(45deg, #00ffff, #ff00ff);
		opacity: 0;
		z-index: -2;
		animation: neonGlow 1.5s ease-in-out infinite alternate-reverse;
		}

	@keyframes neonGlow {
		0% {
			opacity: 0;
			transform: scale(0.9);
		}
		100% {
			opacity: 1;
			transform: scale(1.1);
		}
	}
</style>
