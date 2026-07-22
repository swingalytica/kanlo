<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';

	let { data } = $props();

	let organization = $state('');

	$effect(() => {
		if (!organization && data.organizations.length > 0) {
			organization = data.organizations[0]._id;
		}
	});

	const trigger_content = $derived(
		data.organizations.find((org: { _id: string }) => org._id === organization)?.name ??
			'Select organization'
	);

	let labels_dialog_open = $state(false);
	let create_dialog_open = $state(false);

	let color_presets = [
		'#ef4444',
		'#f97316',
		'#eab308',
		'#22c55e',
		'#3b82f6',
		'#8b5cf6',
		'#ec4899',
		'#64748b'
	];

	let edit_dialog_open = $state(false);

	let edit_label = $state<{
		_id: string;
		name: string;
		color: string;
	} | null>(null);

	function open_edit_label(label: { _id: any; name: any; color: any }) {
		edit_label = {
			_id: label._id,
			name: label.name,
			color: label.color
		};

		edit_dialog_open = true;
	}

	let name = $state('');
	let color = $state('#3b82f6');
</script>

<svelte:head>
	<title>Settings - Kanlo</title>
</svelte:head>

<div class="flex flex-col gap-8 p-6">
	<div>
		<h1 class="text-2xl font-semibold">Organization Settings</h1>

		<p class="text-sm text-muted-foreground">Manage your organization settings.</p>

		<Select.Root type="single" bind:value={organization}>
			<Select.Trigger class="w-64">
				{trigger_content}
			</Select.Trigger>

			<Select.Content>
				{#each data.organizations as org}
					<Select.Item value={org._id}>
						{org.name}
					</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
	</div>

	<section class="rounded-lg border border-border p-4">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="font-medium">Labels</h2>

				<p class="text-sm text-muted-foreground">
					{data.labels.length} labels
				</p>
			</div>

			<Button onclick={() => (labels_dialog_open = true)}>Manage labels</Button>
		</div>
	</section>
</div>

<Dialog.Root bind:open={labels_dialog_open}>
	<Dialog.Content class="sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title>Labels</Dialog.Title>
		</Dialog.Header>

		<form action="?/delete_label" method="POST">
			<div class="flex flex-col gap-3">
				{#each data.labels as label}
					<button
						type="button"
						class="flex items-center justify-between rounded-md border p-3"
						onclick={() => open_edit_label(label)}
					>
						<div class="flex items-center gap-2">
							<div class="h-4 w-4 rounded-full" style="background-color: {label.color}"></div>

							<span>{label.name}</span>
						</div>
						<Button type="submit" name="id" value={label._id} variant="destructive" size="sm">
							Delete
						</Button>
					</button>
				{/each}

				<Button onclick={() => (create_dialog_open = true)}>Create label</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={create_dialog_open}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Create label</Dialog.Title>
		</Dialog.Header>

		<form
			method="POST"
			action="?/create_label"
			use:enhance={() => {
				return async ({ update }) => {
					await update();
					create_dialog_open = false;
					name = '';
					color = '#3b82f6';
				};
			}}
			class="flex flex-col gap-4"
		>
			<Input name="name" placeholder="Bug" bind:value={name} required />

			<div class="flex flex-col gap-3">
				<span class="text-sm font-medium"> Color </span>

				<div class="flex flex-wrap gap-2">
					{#each color_presets as preset}
						<button
							title={preset}
							type="button"
							class="h-8 w-8 rounded-full border-2"
							style="background-color: {preset}; border-color: {color === preset
								? 'white'
								: 'transparent'}"
							onclick={() => {
								color = preset;
							}}
						></button>
					{/each}
				</div>

				<Input name="color" bind:value={color} placeholder="#ef4444" required />
			</div>

			<div class="rounded px-2 py-1 text-xs text-white" style="background-color: {color}">
				{#if name}
					{name}
				{:else}
					Label
				{/if}
			</div>

			<Button type="submit" name="organization_id" value={organization}>Create</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={edit_dialog_open}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Edit label</Dialog.Title>
		</Dialog.Header>

		{#if edit_label}
			{@const label = edit_label}

			<form
				method="POST"
				action="?/update_label"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						edit_dialog_open = false;
						edit_label = null;
					};
				}}
				class="flex flex-col gap-4"
			>
				<input type="hidden" name="id" value={label._id} />

				<Input name="name" bind:value={label.name} required />

				<div class="flex flex-wrap gap-2">
					{#each color_presets as preset}
						<button
							type="button"
							title={preset}
							class="h-8 w-8 rounded-full border-2"
							style="background-color: {preset}; border-color: {label.color === preset
								? 'white'
								: 'transparent'}"
							onclick={() => {
								label.color = preset;
							}}
						></button>
					{/each}
				</div>

				<Input name="color" bind:value={label.color} placeholder="#ef4444" required />

				<div class="rounded px-2 py-1 text-xs text-white" style="background-color: {label.color}">
					{label.name || 'Label'}
				</div>

				<Button type="submit">Save</Button>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>
