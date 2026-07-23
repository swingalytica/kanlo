<script lang="ts">
	import Board from '$lib/components/Board.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>{data.organization.name} - Kanlo</title>
</svelte:head>

<div class="flex h-screen">
	<Sidebar {data} />
	<Board {data} {form} />
</div>
