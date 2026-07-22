<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';

	type CardType = {
		_id: string;
		title: string;
		description: string;
		column: string;
		order: number;
		labels: [string];
		due_date?: string;
	};

	let {
		card,
		column,
		index,
		available_labels,
		board_id,
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
	{card.title}
</button>

<Dialog.Root bind:open={dialog_open}>
	<Dialog.Content class="sm:max-w-xl">
		<form action="?/save_card" method="POST" use:enhance>
			<Dialog.Header>
				<Dialog.Title>Edit card</Dialog.Title>
			</Dialog.Header>

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

				<!-- Aktivität -->
				<div class="flex flex-col gap-2">
					<Label>Activity</Label>

					<div class="rounded-md border border-border p-3 text-sm text-muted-foreground">
						No activity yet.
					</div>
				</div>
			</div>

			<Dialog.Footer>
				<Button type="submit">Save</Button>
			</Dialog.Footer>
			<input type="hidden" name="card_id" value={card._id} hidden />
			<input type="hidden" name="labels" value={selected_labels.join(',')} hidden />
			<input type="hidden" name="board_id" value={board_id} hidden />
		</form>
	</Dialog.Content>
</Dialog.Root>
