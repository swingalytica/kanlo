<script lang="ts">
	import SidebarLeft from '$lib/components/sidebar-left.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.organization.name} - Kanlo</title>
</svelte:head>

<div class="flex h-screen">
	<SidebarLeft {data} />
</div>
