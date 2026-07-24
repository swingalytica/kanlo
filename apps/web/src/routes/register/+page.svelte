<script lang="ts">
	import RegisterForm from '$lib/components/register-form.svelte';
	import type { ActionData } from './$types';

	const { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Register | Kanlo</title>
</svelte:head>

<div class="flex h-screen w-full items-center justify-center px-4">
	<RegisterForm {form} />
</div>
