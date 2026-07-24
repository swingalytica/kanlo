<script lang="ts">
	import { enhance } from '$app/forms';
	import GoBack from '$lib/components/go-back.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import * as ToggleGroup from '$lib/components/ui/toggle-group';
	import { permission_mapping, type PermissionKey } from '$lib/shared/permissions.const';
	import { toast } from 'svelte-sonner';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	function current_state(row: { override: boolean | null }): string {
		if (row.override === null) return 'default';
		return row.override ? 'allow' : 'deny';
	}

	let forms = $state<Record<string, HTMLFormElement>>({});

	let states = $state<Record<string, string>>({});

	let initialized = false;

	$effect(() => {
		if (!initialized && data.permission_rows) {
			for (const row of data.permission_rows) {
				states[row.key] = current_state(row);
			}

			initialized = true;
		}
	});

	let previous_states: Record<string, string> = {};

	$effect(() => {
		if (form?.success && form.message) {
			toast.success(form.message);
		}

		if (form?.error) {
			toast.error(form.error);
		}
	});
</script>

<svelte:head>
	<title>{data.membership?.user.email ?? 'Member'} - Permissions</title>
</svelte:head>

{#if data.error}
	<div class="mx-auto max-w-2xl p-10 text-center">
		<GoBack />
		<p class="text-sm text-muted-foreground">{data.error}</p>
	</div>
{:else}
	<div class="mx-auto max-w-2xl p-6 sm:p-10">
		<GoBack />

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
							{permission_mapping[row.key as PermissionKey] ?? row.key}
						</span>

						<span class="text-xs text-muted-foreground">
							Default for {data.membership.role.toLowerCase()}:
							{row.default_allowed ? 'allowed' : 'not allowed'}
						</span>
					</div>

					<form
						method="POST"
						action="?/set_permission_override"
						bind:this={forms[row.key]}
						use:enhance={({ formData }) => {
							previous_states[row.key] = states[row.key];

							formData.set('state', states[row.key]);

							return async ({ update, result }) => {
								await update();

								if (result.type === 'failure' || result.type === 'error') {
									states = {
										...states,
										[row.key]: previous_states[row.key]
									};
								}
							};
						}}
					>
						<input type="hidden" name="permission" value={row.key} />

						<ToggleGroup.Root
							type="single"
							value={states[row.key]}
							disabled={row.key === 'manage_members' && data.user_id === data.membership.user._id}
							onValueChange={(value) => {
								if (!value) return;

								states[row.key] = value;
								forms[row.key]?.requestSubmit();
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
