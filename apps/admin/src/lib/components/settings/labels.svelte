<script lang="ts">
	import { enhance } from '$app/forms';
	import { Check, Pencil, Trash2 } from '@lucide/svelte';
	import type { PageData } from '../../../routes/app/[id]/$types';
	import { Button } from '../ui/button';
	import { Input } from '../ui/input';
	import { Label } from '../ui/label';

	let { data }: { data: PageData } = $props();

	const preset_colors = [
		'#4c9a6a', // moss
		'#3b82f6', // cobalt
		'#e5484d', // red
		'#8b5cf6', // violet
		'#f59e0b', // amber
		'#617169' // muted
	];

	let new_label_name = $state('');
	let new_label_color = $state(preset_colors[0]);
	let editing_label_id = $state<string | null>(null);
	let edit_label_name = $state('');
	let edit_label_color = $state('');

	function start_edit(label: { _id: string; name: string; color: string }) {
		editing_label_id = label._id;
		edit_label_name = label.name;
		edit_label_color = label.color;
	}
</script>

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
			<Input id="label-name" name="name" bind:value={new_label_name} required placeholder="Bug" />
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

							<Input name="color" bind:value={edit_label_color} required class="h-7 w-28 text-xs" />
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
							<span class="h-2.5 w-2.5 rounded-full" style="background-color: {label.color}"></span>
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
								<Button type="submit" variant="ghost" size="icon" class="h-7 w-7 text-destructive">
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
