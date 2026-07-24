<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { generateLogoFallback } from '$lib/utils/logo';
	import { Trash2, UserPlus } from '@lucide/svelte';
	import { tick } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let name = $state(data.organization?.name ?? '');
	let icon = $state(data.organization?.icon ?? '');
	let invite_email = $state('');
	let invite_role = $state('MEMBER');

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

<svelte:head>
	<title>{data.organization?.name ?? 'Settings'} - Admin</title>
</svelte:head>

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

{#if data.error}
	<div class="mx-auto max-w-2xl p-10 text-center">
		<p class="text-sm text-muted-foreground">{data.error}</p>
	</div>
{:else}
	<div class="mx-auto max-w-2xl p-6 sm:p-10">
		<h1 class="mb-8 text-2xl font-semibold tracking-tight text-foreground">
			{data.organization.name}
		</h1>

		<section class="mb-10">
			<h2 class="mb-3 text-sm font-medium text-muted-foreground">General</h2>

			<form
				method="POST"
				action="?/update_organisation"
				use:enhance
				class="flex flex-col gap-4 rounded-xl border border-border bg-card p-5"
			>
				<div class="flex flex-col gap-1.5">
					<Label for="name">Name</Label>
					<Input id="name" name="name" bind:value={name} required />
				</div>

				<div class="flex flex-col gap-1.5">
					<Label for="icon">Icon URL</Label>
					<div class="flex items-center gap-3">
						<Avatar.Root>
							<Avatar.Image src={icon} alt="Organization Icon" />
							<Avatar.Fallback>{generateLogoFallback(name)}</Avatar.Fallback>
						</Avatar.Root>
						<Input id="icon" name="icon" bind:value={icon} placeholder="https://..." />
					</div>
				</div>

				<Button type="submit" class="w-fit">Save changes</Button>
			</form>
		</section>

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
	</div>
{/if}
