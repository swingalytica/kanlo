<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { ChevronRight, ShieldCheck } from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let name = $state('');
	let logo_url = $state('');

	function generateLogoFallback(name: string): string | null {
		if (name.trim() === '') {
			return null;
		}

		const initials = name
			.split(' ')
			.map((word) => word[0])
			.join('')
			.toUpperCase();
		return initials;
	}
</script>

<svelte:head>
	<title>Organisations - Kanlo Admin</title>
</svelte:head>

<div class="mx-auto max-w-3xl p-6 sm:p-10">
	<div class="mb-8 flex items-center gap-2">
		<ShieldCheck class="h-5 w-5 text-primary" />
		<span class="text-xs font-medium tracking-wide text-muted-foreground uppercase"
			>Admin console</span
		>
	</div>

	<h1 class="mb-1 text-2xl font-semibold tracking-tight text-foreground">Select an organisation</h1>
	<p class="mb-8 text-sm text-muted-foreground">
		Manage members, roles, and settings for an organisation you administer.
	</p>

	{#if data.memberships.length > 0}
		{#each data.memberships as membership (membership._id)}
			<div
				class="flex flex-col divide-y divide-border rounded-xl border border-border bg-card hover:border-primary"
			>
				<a
					href="/app/{membership.organization._id}"
					class="group flex items-center gap-4 px-5 py-4 transition-colors"
				>
					<Avatar.Root>
						<Avatar.Image src={membership.organization.icon} alt={membership.organization.name} />
						<Avatar.Fallback class="bg-muted text-muted-foreground">
							{generateLogoFallback(membership.organization.name)}
						</Avatar.Fallback>
					</Avatar.Root>
					<div class="flex min-w-0 flex-1 flex-col">
						<span class="truncate font-medium text-foreground">{membership.organization.name}</span>
						<Badge variant="secondary" class="mt-1 w-fit text-xs font-normal capitalize">
							{membership.role.toLowerCase()}
						</Badge>
					</div>

					<ChevronRight
						class="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
					/>
				</a>
			</div>
		{/each}
	{:else}
		<div
			class="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center"
		>
			<ShieldCheck class="h-8 w-8 text-muted-foreground" />
			<p class="text-sm font-medium text-foreground">No admin access</p>
			<p class="max-w-xs text-sm text-muted-foreground">
				You don't have admin rights in any organisation yet.
			</p>
		</div>
	{/if}
</div>
