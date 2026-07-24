<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { generateLogoFallback } from '$lib/utils/logo';
	import { Check, Pencil, Trash2, UserPlus } from '@lucide/svelte';
	import { tick } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const preset_colors = [
		'#4c9a6a', // moss
		'#3b82f6', // cobalt
		'#e5484d', // red
		'#8b5cf6', // violet
		'#f59e0b', // amber
		'#617169' // muted
	];

	let name = $derived(data.organization?.name ?? '');
	let icon = $derived(data.organization?.icon ?? '');
	let invite_email = $state('');
	let invite_role = $state('MEMBER');
	let new_label_name = $state('');
	let new_label_color = $state(preset_colors[0]);

	let editing_label_id = $state<string | null>(null);
	let edit_label_name = $state('');
	let edit_label_color = $state('');

	let role_forms: Record<string, HTMLFormElement> = {};

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

	async function handle_role_change(
		membership_id: string,
		role: string,
		form_ref: HTMLFormElement
	) {
		await tick();
		form_ref.requestSubmit();
	}

	function start_edit(label: { _id: string; name: string; color: string }) {
		editing_label_id = label._id;
		edit_label_name = label.name;
		edit_label_color = label.color;
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

		<section class="my-10">
			<h2 class="mb-3 text-sm font-medium text-muted-foreground">Labels</h2>

			<form
				method="POST"
				action="?/create_label"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						new_label_name = '';
						new_label_color = preset_colors[0];
					};
				}}
				class="mb-4 flex flex-col gap-4 rounded-xl border border-border bg-card p-5"
			>
				<div class="flex flex-col gap-1.5">
					<Label for="label-name">Name</Label>
					<Input
						id="label-name"
						name="name"
						bind:value={new_label_name}
						required
						placeholder="Bug"
					/>
				</div>

				<div class="flex flex-col gap-1.5">
					<Label>Color</Label>

					<div class="flex flex-wrap items-center gap-2">
						{#each preset_colors as color (color)}
							<button
								type="button"
								onclick={() => (new_label_color = color)}
								class="flex h-8 w-8 items-center justify-center rounded-full ring-2 transition-shadow"
								style="background-color: {color}; --tw-ring-color: {new_label_color === color
									? 'var(--foreground)'
									: 'transparent'};"
							>
								{#if new_label_color === color}
									<Check class="h-4 w-4 text-white mix-blend-difference" />
								{/if}
							</button>
						{/each}

						<Input
							name="color"
							bind:value={new_label_color}
							required
							placeholder="#c4973a"
							class="h-8 w-28 text-xs"
						/>
					</div>
				</div>

				<Button type="submit" class="w-fit">Create label</Button>
			</form>

			{#if data.labels.length > 0}
				<div class="flex flex-col gap-2">
					{#each data.labels as label (label._id)}
						{#if editing_label_id === label._id}
							<form
								method="POST"
								action="?/update_label"
								use:enhance={() => {
									return async ({ update }) => {
										await update();
										editing_label_id = null;
									};
								}}
								class="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
							>
								<input type="hidden" name="label_id" value={label._id} />

								<Input name="name" bind:value={edit_label_name} required />

								<div class="flex flex-wrap items-center gap-2">
									{#each preset_colors as color (color)}
										<button
											type="button"
											onclick={() => (edit_label_color = color)}
											class="flex h-7 w-7 items-center justify-center rounded-full ring-2"
											style="background-color: {color}; --tw-ring-color: {edit_label_color === color
												? 'var(--foreground)'
												: 'transparent'};"
										>
											{#if edit_label_color === color}
												<Check class="h-3.5 w-3.5 text-white mix-blend-difference" />
											{/if}
										</button>
									{/each}

									<Input
										name="color"
										bind:value={edit_label_color}
										required
										class="h-7 w-28 text-xs"
									/>
								</div>

								<div class="flex gap-2">
									<Button type="submit" size="sm">Save</Button>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onclick={() => (editing_label_id = null)}
									>
										Cancel
									</Button>
								</div>
							</form>
						{:else}
							<div
								class="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-2.5"
							>
								<div class="flex items-center gap-2">
									<span class="h-2.5 w-2.5 rounded-full" style="background-color: {label.color}"
									></span>
									<span class="text-sm text-foreground">{label.name}</span>
								</div>

								<div class="flex items-center gap-1">
									<Button
										variant="ghost"
										size="icon"
										class="h-7 w-7 text-muted-foreground"
										onclick={() => start_edit(label)}
									>
										<Pencil class="h-3.5 w-3.5" />
									</Button>

									<form method="POST" action="?/delete_label" use:enhance>
										<input type="hidden" name="label_id" value={label._id} />
										<Button
											type="submit"
											variant="ghost"
											size="icon"
											class="h-7 w-7 text-destructive"
										>
											<Trash2 class="h-3.5 w-3.5" />
										</Button>
									</form>
								</div>
							</div>
						{/if}
					{/each}
				</div>
			{/if}
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
