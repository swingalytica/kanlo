<script lang="ts">
	import { enhance } from '$app/forms';
	import { UserPlus } from '@lucide/svelte';
	import type { PageData } from '../../../routes/app/[id]/$types';
	import { Badge } from '../ui/badge';
	import { Button } from '../ui/button';
	import { Input } from '../ui/input';
	import { Label } from '../ui/label';
	import * as Select from '../ui/select';

	let { data }: { data: PageData } = $props();

	let invite_email = $state('');
	let invite_role = $state('MEMBER');
</script>

<section>
	<h2 class="mb-3 text-sm font-medium text-muted-foreground">Invites</h2>

	<form
		method="POST"
		action="?/create_invite"
		use:enhance={() => {
			return async ({ update }) => {
				await update();
				invite_email = '';
			};
		}}
		class="mb-4 flex items-end gap-2 rounded-xl border border-border bg-card p-5"
	>
		<div class="flex flex-1 flex-col gap-1.5">
			<Label for="invite-email">Email</Label>
			<Input
				id="invite-email"
				name="email"
				type="email"
				bind:value={invite_email}
				required
				placeholder="colleague@company.com"
			/>
		</div>

		<Select.Root type="single" name="role" bind:value={invite_role}>
			<Select.Trigger class="w-28 capitalize">{invite_role.toLowerCase()}</Select.Trigger>
			<Select.Content>
				<Select.Item value="ADMIN">Admin</Select.Item>
				<Select.Item value="MEMBER">Member</Select.Item>
			</Select.Content>
		</Select.Root>

		<Button type="submit">
			<UserPlus class="h-4 w-4" />
			Invite
		</Button>
	</form>

	{#if data.invites.length > 0}
		<div class="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
			{#each data.invites as invite (invite._id)}
				<div class="flex items-center justify-between px-5 py-3">
					<div class="flex items-center gap-2">
						<span class="text-sm text-foreground">{invite.email}</span>
						<Badge variant="secondary" class="text-xs font-normal capitalize">
							{invite.role.toLowerCase()}
						</Badge>
					</div>

					<form method="POST" action="?/revoke_invite" use:enhance>
						<input type="hidden" name="invite_id" value={invite._id} />
						<Button type="submit" variant="ghost" size="sm" class="text-muted-foreground">
							Revoke
						</Button>
					</form>
				</div>
			{/each}
		</div>
	{/if}
</section>
