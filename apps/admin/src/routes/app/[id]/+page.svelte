<script lang="ts">
	import General from '$lib/components/settings/general.svelte';
	import Invites from '$lib/components/settings/invites.svelte';
	import Labels from '$lib/components/settings/labels.svelte';
	import Members from '$lib/components/settings/members.svelte';
	import { toast } from 'svelte-sonner';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let name = $derived(data.organization?.name ?? '');
	let icon = $derived(data.organization?.icon ?? '');

	$effect(() => {
		if (form?.success) {
			if (form.message) {
				toast.success(form.message);
			}
		} else if (form?.error) {
			if (form.error) {
				toast.error(form.error);
			}
		}
	});
</script>

<svelte:head>
	<title>{data.organization?.name ?? 'Settings'} - Admin</title>
</svelte:head>

{#if data.error}
	<div class="mx-auto max-w-2xl p-10 text-center">
		<p class="text-sm text-muted-foreground">{data.error}</p>
	</div>
{:else}
	<div class="mx-auto max-w-2xl p-6 sm:p-10">
		<h1 class="mb-8 text-2xl font-semibold tracking-tight text-foreground">
			{data.organization.name}
		</h1>

		<General {name} {icon} />

		<Members {data} />

		<Labels {data} />

		<Invites {data} />
	</div>
{/if}
