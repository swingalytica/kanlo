<script lang="ts">
	let { authenticated } = $props();
</script>

<header class="flex items-center justify-between border-b border-border bg-card px-6 py-4">
	<a href={authenticated ? '/app' : '/'}
		><span class="text-lg font-semibold tracking-tight text-foreground">Kanlo</span></a
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
				href="/app/settings"
				class="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
			>
				Settings
			</a>
			<a
				href="/logout"
				class="text-destructive-foreground rounded-md bg-destructive px-3 py-2 text-sm font-medium transition-colors hover:opacity-90"
			>
				Logout
			</a>
		</nav>
	{/if}
</header>
