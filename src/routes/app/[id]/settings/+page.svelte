<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';

	let { data } = $props();

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

	let name = $state('');
	let color = $state('#3b82f6');
</script>

<div class="flex flex-col gap-8 p-6">
	<div>
		<h1 class="text-2xl font-semibold">Organization Settings</h1>

		<p class="text-sm text-muted-foreground">Manage your organization settings.</p>
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

		<div class="flex flex-col gap-3">
			{#each data.labels as label}
				<div class="flex items-center justify-between rounded-md border p-3">
					<div class="flex items-center gap-2">
						<div class="h-4 w-4 rounded-full" style="background-color: {label.color}"></div>

						<span>
							{label.name}
						</span>
					</div>

					<form method="POST" action="?/delete_label" use:enhance>
						<input type="hidden" name="id" value={label._id} />

						<Button variant="destructive" size="sm" type="submit">Delete</Button>
					</form>
				</div>
			{/each}

			<Button onclick={() => (create_dialog_open = true)}>Create label</Button>
		</div>
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

			<Button type="submit">Create</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>
