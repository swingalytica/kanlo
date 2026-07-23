<script lang="ts">
	import Board from '$lib/components/board.svelte';
	import SidebarLeft from '$lib/components/sidebar-left.svelte';
	import SidebarRight from '$lib/components/sidebar-right.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>{data.organization.name} - Kanlo</title>
</svelte:head>

<div class="flex h-screen w-full">
	<SidebarRight {data} />

	<main class="min-w-0 flex-1">
		<Board {data} {form} />
	</main>

	<SidebarLeft {data} />
</div>
