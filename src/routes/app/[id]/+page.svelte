<script lang="ts">
	import Board from '$lib/components/Board.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<div class="flex h-screen">
	<Sidebar {data} />
	{#if form?.success}
		<Board {form} />
	{/if}
</div>
