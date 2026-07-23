<script lang="ts">
	import Logo from '$lib/assets/kanlo.png';
	import { Button } from './ui/button';

	let { authenticated } = $props();
</script>

<header class="flex items-center justify-between border-b border-border bg-card px-6 py-4">
	<a href={authenticated ? '/app' : '/'} class="flex items-center">
		<img src={Logo} alt="Kanlo Logo" class="mr-2 h-12 w-12" />
		<span class="text-lg font-semibold tracking-tight text-foreground">Kanlo</span></a
	>
	{#if !authenticated}
		<nav class="flex items-center gap-2">
			<Button href="/">Login</Button>
			<Button variant="secondary" href="/register">Register</Button>
		</nav>
	{:else}
		<nav class="flex items-center gap-2">
			<Button href="/app/settings">Settings</Button>
			<form action="/logout" method="POST">
				<Button variant="destructive" type="submit">Logout</Button>
			</form>
		</nav>
	{/if}
</header>
