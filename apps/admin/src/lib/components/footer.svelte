<script>
	import DarkModeToggle from './dark-mode-toggle.svelte';

	const current_year = new Date().getFullYear();
</script>

<footer class="flex items-center justify-between border-t px-6 py-4 text-sm text-muted-foreground">
	<span>&copy; {current_year} RealGolf.Games UG (haftungsbeschränkt)</span>

	<nav class="flex items-center gap-4">
		<DarkModeToggle />
	</nav>
</footer>
