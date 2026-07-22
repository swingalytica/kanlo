<script lang="ts" module>
	export type ColumnType = {
		_id: string;
		name: string;
		order: number;
	};
</script>

<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Plus } from '@lucide/svelte';
	import type { ActionData, PageData } from '../../routes/app/[id]/$types';
	import Column from './Column.svelte';

	let { form, data }: { form: ActionData; data: PageData } = $props();

	let sorted_columns = $state<ColumnType[]>([]);

	let initialized = false;

	$effect(() => {
		if (!initialized) {
			sorted_columns = [...(form?.board?.columns ?? [])].sort((a, b) => a.order - b.order);

			initialized = true;
		}
	});

	let add_column_dialog_open = $state(false);
	let new_column_name = $state('');

	let draggingIndex = -1;

	function dragStart(index: number) {
		draggingIndex = index;
	}

	function dragOver(event: DragEvent, index: number) {
		event.preventDefault();

		if (draggingIndex === -1 || index === draggingIndex) {
			return;
		}

		const columns = [...sorted_columns];

		const [moved] = columns.splice(draggingIndex, 1);

		if (!moved) {
			return;
		}

		columns.splice(index, 0, moved);

		sorted_columns = columns;
		draggingIndex = index;
	}

	let reorder_form: HTMLFormElement;
	let reorder = $state('');

	async function dragEnd() {
		draggingIndex = -1;

		reorder = JSON.stringify(
			sorted_columns.map((column, order) => ({
				id: column._id,
				order
			}))
		);

		await new Promise((resolve) => setTimeout(resolve, 0));

		reorder_form.requestSubmit();
	}

	let card_input: HTMLInputElement;
	let card_reorder_form: HTMLFormElement;

	let draggingCard = $state<{
		id: string;
		column: string;
		index: number;
	} | null>(null);

	let cardDropTarget = $state<{
		column: string;
		index: number;
	} | null>(null);

	function cardDragStart(card_id: string, column_id: string, index: number) {
		draggingCard = {
			id: card_id,
			column: column_id,
			index
		};
	}

	function cardDragOver(column_id: string, index: number) {
		cardDropTarget = {
			column: column_id,
			index
		};
	}

	function cardDragEnd() {
		if (!draggingCard || !cardDropTarget) {
			return;
		}

		const payload = JSON.stringify({
			card_id: draggingCard.id,
			column_id: cardDropTarget.column,
			order: cardDropTarget.index
		});

		card_input.value = payload;

		card_reorder_form.requestSubmit();

		draggingCard = null;
		cardDropTarget = null;
	}
</script>

<div class="flex h-full gap-4 overflow-x-auto p-6">
	{#each sorted_columns as column, index (column._id)}
		<Column
			{column}
			{form}
			{index}
			available_labels={data?.labels ?? []}
			{dragStart}
			{dragOver}
			{dragEnd}
			{cardDragStart}
			{cardDragOver}
			{cardDragEnd}
		/>
	{/each}

	<Dialog.Root bind:open={add_column_dialog_open}>
		<Dialog.Trigger
			class={buttonVariants({
				variant: 'outline',
				class: 'h-fit w-72 shrink-0'
			})}
		>
			<Plus class="h-4 w-4" />
			Add Section
		</Dialog.Trigger>

		<Dialog.Content class="sm:max-w-106.25">
			<Dialog.Header>
				<Dialog.Title>New Section</Dialog.Title>
			</Dialog.Header>

			<form
				method="POST"
				action="?/add_column"
				class="flex flex-col gap-4"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						add_column_dialog_open = false;
						new_column_name = '';
					};
				}}
			>
				<input type="hidden" name="board_id" value={form?.board?._id} />

				<div class="flex flex-col gap-1.5">
					<Label for="name">Name</Label>

					<Input
						id="name"
						name="name"
						bind:value={new_column_name}
						required
						placeholder="Backlog"
					/>
				</div>

				<Dialog.Footer>
					<Button type="submit">Create Section</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>
</div>

<form method="POST" action="?/reorder_columns" use:enhance bind:this={reorder_form} class="hidden">
	<input type="hidden" name="board_id" value={form?.board?._id} />
	<input type="hidden" name="order" bind:value={reorder} />
</form>

<form
	method="POST"
	action="?/reorder_card"
	use:enhance
	bind:this={card_reorder_form}
	class="hidden"
>
	<input type="hidden" name="board_id" value={form?.board?._id} />
	<input type="hidden" name="card" bind:this={card_input} />
</form>
