<script lang="ts" module>
	export type CardType = {
		_id: string;
		title: string;
		description: string;
		column: string;
		order: number;
		labels: [string];
		due_date?: string;
		completed: boolean;
	};
</script>

<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { Check } from '@lucide/svelte';
	import Badge from './ui/badge/badge.svelte';

	let {
		card,
		column,
		index,
		available_labels,
		board_id,
		activities,
		cardDragStart,
		cardDragEnd
	}: {
		card: CardType;
		column: string;
		index: number;
		available_labels: {
			_id: string;
			name: string;
			color: string;
		}[];
		board_id: string;
		activities: {
			_id: string;
			card: string;
			user: {
				name: string;
			};
			type: string;
			data: any;
			createdAt: string;
		}[];
		cardDragStart: (card_id: string, column_id: string, index: number) => void;
		cardDragEnd: (card_id: string, column_id: string, order: number) => void;
	} = $props();

	let dialog_open = $state(false);
	let title = $derived(card.title);
	let description = $derived(card.description);
	let due_date = $derived(card.due_date ? new Date(card.due_date).toISOString().split('T')[0] : '');
	let selected_labels = $derived<string[]>(card.labels);
	const available_labels_map = $derived(
		new Map(available_labels.map((label) => [label._id, label]))
	);

	function open_dialog() {
		title = card.title;
		description = card.description;
		due_date = card.due_date ? new Date(card.due_date).toISOString().split('T')[0] : '';
		selected_labels = [...card.labels];
		dialog_open = true;
	}

	function limit_text_length(text: string, max_length: number) {
		if (text.length > max_length) {
			return text.substring(0, max_length) + '...';
		}
		return text;
	}
</script>

<button
	type="button"
	draggable="true"
	ondragstart={(event) => {
		event.stopPropagation();
		cardDragStart(card._id, column, index);
	}}
	ondragend={(event) => {
		event.stopPropagation();
		cardDragEnd(card._id, column, index);
	}}
	onclick={() => {
		open_dialog();
	}}
	class="w-full cursor-grab rounded-md border border-border bg-background p-3 text-left text-sm text-foreground shadow-sm active:cursor-grabbing"
>
	{#if card.completed}
		<div
			class="mb-1 flex flex-row items-center justify-center text-xs font-semibold text-green-600"
		>
			<Check class="h-4 w-4" /> Completed
		</div>
	{/if}
	<div class="flex flex-col gap-1">
		<span class={card.completed ? 'line-through opacity-50' : ''}>{card.title}</span>
		<span class="text-xs text-muted-foreground">{limit_text_length(card.description, 10)}</span>
		<div class="flex flex-wrap gap-1">
			{#each card.labels as label}
				{@const label_data = available_labels_map.get(label)}
				{#if label_data}
					<Badge variant="outline" style="background-color: {label_data.color};">
						{label_data.name}
					</Badge>
				{/if}
			{/each}
		</div>
		<div class="mt-2 flex flex-row items-center justify-start gap-2">
			<Badge variant="destructive">
				{card.due_date ? new Date(card.due_date).toLocaleDateString() : 'No due date'}
			</Badge>
		</div>
	</div>
</button>

<Dialog.Root bind:open={dialog_open}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-xl">
		<Dialog.Header class="mb-4 flex gap-4">
			{#if !card.completed}
				<form action="?/mark_card_completed" method="POST" use:enhance>
					<div class="flex w-max flex-row items-center justify-start gap-1">
						<Button type="submit" variant="outline">
							<Check class="h-4 w-4" />
							Complete Task
						</Button>
					</div>
					<input type="hidden" name="card_id" value={card._id} hidden />
					<input type="hidden" name="completed" value="true" hidden />
				</form>
			{/if}
		</Dialog.Header>

		<form action="?/save_card" method="POST" use:enhance>
			<div class="flex flex-col gap-6">
				<!-- Titel -->
				<div class="flex flex-col gap-1.5">
					<Label for="title">Title</Label>

					<Input bind:value={title} name="title" id="title" />
				</div>

				<!-- Beschreibung -->
				<div class="flex flex-col gap-1.5">
					<Label for="description">Description</Label>

					<textarea
						bind:value={description}
						class="min-h-32 rounded-md border border-border bg-background p-3 text-sm"
						placeholder="Add a description..."
						name="description"
						id="description"></textarea>
				</div>

				<!-- Labels -->
				<div class="flex flex-col gap-2">
					<Label>Labels</Label>

					<div class="flex flex-wrap gap-2">
						{#each selected_labels as label_id}
							{@const label = available_labels_map.get(label_id)}

							{#if label}
								<span
									class="rounded px-2 py-1 text-xs text-white"
									style="background-color: {label.color}"
								>
									{label.name}
								</span>
							{/if}
						{/each}
					</div>

					<Select.Root type="multiple" bind:value={selected_labels}>
						<Select.Trigger class="w-72">Select multiple labels</Select.Trigger>

						<Select.Content>
							<Select.Group>
								<Select.Label>Available Labels</Select.Label>

								{#each available_labels as label (label._id)}
									<Select.Item value={label._id}>
										<span
											class="rounded px-2 py-1 text-xs text-white"
											style="background-color: {label.color}"
										>
											{label.name}
										</span>
									</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>
				</div>

				<!-- Fälligkeitsdatum -->
				<div class="flex flex-col gap-1.5">
					<Label for="due_date">Due date</Label>

					<Input type="date" id="due_date" name="due_date" bind:value={due_date} />
				</div>

				<Dialog.Footer>
					<Button type="submit">Save</Button>
				</Dialog.Footer>

				<!-- Aktivität -->
				<div class="flex flex-col gap-2">
					<Label>Activity</Label>

					{#if activities && activities.length > 0}
						<div class="flex flex-col gap-2">
							{#each activities as activity (activity._id)}
								<div class="rounded-md border border-border p-3 text-sm">
									<p>
										<strong>{activity.user.name}</strong>
										{activity.type}
									</p>
									<p class="text-xs text-muted-foreground">
										{new Date(activity.createdAt).toLocaleString()}
									</p>
								</div>
							{/each}
						</div>
					{:else}
						<div class="rounded-md border border-border p-3 text-sm text-muted-foreground">
							No activity yet.
						</div>
					{/if}
				</div>
			</div>

			<input type="hidden" name="card_id" value={card._id} hidden />
			<input type="hidden" name="labels" value={selected_labels.join(',')} hidden />
		</form>
	</Dialog.Content>
</Dialog.Root>
