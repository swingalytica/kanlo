<script lang="ts">
	import LoginForm from '$lib/components/login-form.svelte';
	import type { ActionData } from './$types';

	const { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Login | Kanlo</title>
</svelte:head>

<div class="flex h-screen w-full items-center justify-center px-4">
	<LoginForm {form} />
</div>
