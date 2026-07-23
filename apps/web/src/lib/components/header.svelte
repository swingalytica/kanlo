<script lang="ts">
	import Logo from '$lib/assets/kanlo.png';

	let { authenticated } = $props();
</script>

<header class="flex items-center justify-between border-b border-border bg-card px-6 py-4">
	<a href={authenticated ? '/app' : '/'} class="flex items-center">
		<img src={Logo} alt="Kanlo Logo" class="mr-2 h-12 w-12" />
		<span class="text-lg font-semibold tracking-tight text-foreground">Kanlo</span></a
	>
	{#if !authenticated}
		<nav class="flex items-center gap-2">
			<a
				href="/"
				class="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
			>
				Login
			</a>
			<a
				href="/register"
				class="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
			>
				Register
			</a>
		</nav>
	{:else}
		<nav class="flex items-center gap-2">
			<a
				href="/logout"
				class="text-destructive-foreground rounded-md bg-destructive px-3 py-2 text-sm font-medium transition-colors hover:opacity-90"
			>
				Logout
			</a>
		</nav>
	{/if}
</header>
