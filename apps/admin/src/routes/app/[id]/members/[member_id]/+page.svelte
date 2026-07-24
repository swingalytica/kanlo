<script lang="ts">
	import { enhance } from '$app/forms';
	import { Badge } from '$lib/components/ui/badge';
	import * as ToggleGroup from '$lib/components/ui/toggle-group';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const permission_labels: Record<string, string> = {
		create_project: 'Create projects',
		delete_project: 'Delete projects',
		manage_members: 'Manage members',
		manage_labels: 'Manage labels',
		manage_invites: 'Manage invites'
	};

	function current_state(row: { override: boolean | null }): string {
		if (row.override === null) return 'default';
		return row.override ? 'allow' : 'deny';
	}
</script>

<svelte:head>
	<title>{data.membership?.user.email ?? 'Member'} - Permissions</title>
</svelte:head>

{#if data.error}
	<div class="mx-auto max-w-2xl p-10 text-center">
		<p class="text-sm text-muted-foreground">{data.error}</p>
	</div>
{:else}
	<div class="mx-auto max-w-2xl p-6 sm:p-10">
		<div class="mb-8">
			<h1 class="text-2xl font-semibold tracking-tight text-foreground">
				{data.membership.user.email}
			</h1>
			<Badge variant="secondary" class="mt-2 w-fit text-xs font-normal capitalize">
				{data.membership.role.toLowerCase()}
			</Badge>
		</div>

		<h2 class="mb-3 text-sm font-medium text-muted-foreground">Permissions</h2>

		<div class="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
			{#each data.permission_rows as row (row.key)}
				<div class="flex items-center justify-between gap-4 px-5 py-4">
					<div class="flex flex-col">
						<span class="text-sm font-medium text-foreground">
							{permission_labels[row.key] ?? row.key}
						</span>
						<span class="text-xs text-muted-foreground">
							Default for {data.membership.role.toLowerCase()}: {row.default_allowed
								? 'allowed'
								: 'not allowed'}
						</span>
					</div>

					<form method="POST" action="?/set_permission_override" use:enhance>
						<input type="hidden" name="permission" value={row.key} />

						<ToggleGroup.Root
							type="single"
							value={current_state(row)}
							onValueChange={(value) => {
								if (!value) return;
								const form = new FormData();
								form.set('permission', row.key);
								form.set('state', value);
								fetch('?/set_permission_override', { method: 'POST', body: form }).then(() => {
									window.location.reload();
								});
							}}
							class="rounded-lg border border-border p-0.5"
						>
							<ToggleGroup.Item
								value="deny"
								class="h-7 px-3 text-xs data-[state=on]:bg-destructive data-[state=on]:text-white"
							>
								Deny
							</ToggleGroup.Item>
							<ToggleGroup.Item value="default" class="h-7 px-3 text-xs">Default</ToggleGroup.Item>
							<ToggleGroup.Item
								value="allow"
								class="h-7 px-3 text-xs data-[state=on]:bg-success data-[state=on]:text-success-foreground"
							>
								Allow
							</ToggleGroup.Item>
						</ToggleGroup.Root>
					</form>
				</div>
			{/each}
		</div>
	</div>
{/if}
