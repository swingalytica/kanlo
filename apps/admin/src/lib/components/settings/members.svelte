<script lang="ts">
	import { enhance } from '$app/forms';
	import { Trash2 } from '@lucide/svelte';
	import { tick } from 'svelte';
	import type { PageData } from '../../../routes/app/[id]/$types';
	import { Button } from '../ui/button';
	import * as Select from '../ui/select';

	let { data }: { data: PageData } = $props();

	let role_forms: Record<string, HTMLFormElement> = {};

	async function handle_role_change(
		membership_id: string,
		role: string,
		form_ref: HTMLFormElement
	) {
		await tick();
		form_ref.requestSubmit();
	}
</script>

{#snippet role_select(membership: { _id: string; role: string })}
	<form
		method="POST"
		action="?/update_member_role"
		use:enhance
		bind:this={role_forms[membership._id]}
	>
		<input type="hidden" name="membership_id" value={membership._id} />
		<Select.Root
			type="single"
			name="role"
			value={membership.role}
			onValueChange={(value) =>
				handle_role_change(membership._id, value, role_forms[membership._id])}
		>
			<Select.Trigger class="h-8 w-28 text-xs capitalize">
				{membership.role.toLowerCase()}
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="OWNER">Owner</Select.Item>
				<Select.Item value="ADMIN">Admin</Select.Item>
				<Select.Item value="MEMBER">Member</Select.Item>
			</Select.Content>
		</Select.Root>
	</form>
{/snippet}

<section class="mb-10">
	<h2 class="mb-3 text-sm font-medium text-muted-foreground">Members</h2>

	<div class="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
		{#each data.memberships as membership (membership._id)}
			<div class="flex items-center justify-between gap-4 px-5 py-3">
				<span class="text-sm text-foreground">{membership.user.email}</span>

				<div class="flex items-center gap-2">
					{@render role_select(membership)}

					<form method="POST" action="?/remove_member" use:enhance>
						<input type="hidden" name="membership_id" value={membership._id} />
						<Button type="submit" variant="ghost" size="icon" class="h-8 w-8 text-destructive">
							<Trash2 class="h-4 w-4" />
						</Button>
					</form>
				</div>
			</div>
		{/each}
	</div>
</section>
