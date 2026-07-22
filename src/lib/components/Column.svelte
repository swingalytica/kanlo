<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { MoreVertical, Plus } from '@lucide/svelte';
	import type { ActionData } from '../../routes/app/[id]/$types';
	import type { ColumnType } from './Board.svelte';
	import Card, { type CardType } from './Card.svelte';

	let {
		column,
		form,
		index,
		available_labels,
		dragStart,
		dragOver,
		dragEnd,
		cardDragStart,
		cardDragOver,
		cardDragEnd
	}: {
		column: ColumnType;
		form: ActionData;
		index: number;
		available_labels: {
			_id: string;
			name: string;
			color: string;
		}[];
		dragStart: (index: number) => void;
		dragOver: (event: DragEvent, index: number) => void;
		dragEnd: () => void;
		cardDragStart: (card_id: string, column_id: string, index: number) => void;
		cardDragOver: (column_id: string, order: number) => void;
		cardDragEnd: (card_id: string, column_id: string, order: number) => void;
	} = $props();

	function cards_for_column(column_id: string) {
		return form?.cards
			.filter((card: { column: string }) => card.column === column_id)
			.sort((a: { order: number }, b: { order: number }) => a.order - b.order);
	}

	let rename_dialog_open = $state(false);
	let rename_value = $derived(column.name);

	let delete_form_element: HTMLFormElement;

	let add_card_dialog_open = $state(false);
	let new_card_title = $state('');
</script>

<div class="flex w-72 shrink-0 flex-col rounded-lg bg-card">
	<div
		class="flex cursor-grab items-center justify-between px-3 py-2 active:cursor-grabbing"
		role="button"
		tabindex="0"
		draggable="true"
		ondragstart={() => dragStart(index)}
		ondragover={(event) => dragOver(event, index)}
		ondragend={dragEnd}
	>
		<span class="text-sm font-medium text-foreground">
			{column.name}
		</span>

		<div class="flex items-center gap-1">
			<span class="text-xs text-muted-foreground">
				{cards_for_column(column._id).length}
			</span>

			<DropdownMenu.Root>
				<DropdownMenu.Trigger
					class={buttonVariants({
						variant: 'ghost',
						size: 'icon',
						class: 'h-6 w-6'
					})}
				>
					<MoreVertical class="h-4 w-4" />
				</DropdownMenu.Trigger>

				<DropdownMenu.Content>
					<DropdownMenu.Item
						onSelect={() => {
							rename_value = column.name;
							rename_dialog_open = true;
						}}
					>
						Rename column
					</DropdownMenu.Item>

					<DropdownMenu.Item
						class="text-destructive"
						onSelect={() => delete_form_element.requestSubmit()}
					>
						Delete column
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</div>

	<div
		role="list"
		class="flex min-h-20 flex-col gap-2 px-3 pb-3"
		ondragover={(event) => {
			event.preventDefault();
			cardDragOver(column._id, cards_for_column(column._id).length);
		}}
	>
		{#each cards_for_column(column._id) as card, index (card._id)}
			<Card
				{card}
				column={column._id}
				{index}
				{available_labels}
				{cardDragStart}
				{cardDragEnd}
				board_id={form?.board?._id}
				activities={form?.activities?.filter(
					(activity: { card: CardType }) => activity.card === card._id
				)}
			/>
		{/each}

		<Button
			onclick={() => {
				new_card_title = '';
				add_card_dialog_open = true;
			}}
			variant="outline"
		>
			<Plus class="h-4 w-4" />
			Add card
		</Button>
	</div>
</div>

<form
	method="POST"
	action="?/delete_column"
	bind:this={delete_form_element}
	use:enhance
	class="hidden"
>
	<input type="hidden" name="board_id" value={form?.board?._id} />
	<input type="hidden" name="column_id" value={column._id} />
</form>

<Dialog.Root bind:open={rename_dialog_open}>
	<Dialog.Content class="sm:max-w-106.25">
		<Dialog.Header>
			<Dialog.Title>Rename column</Dialog.Title>
		</Dialog.Header>

		<form
			method="POST"
			action="?/rename_column"
			class="flex flex-col gap-4"
			use:enhance={() => {
				return async ({ update }) => {
					await update();
					rename_dialog_open = false;
				};
			}}
		>
			<input type="hidden" name="board_id" value={form?.board?._id} />
			<input type="hidden" name="column_id" value={column._id} />

			<div class="flex flex-col gap-1.5">
				<Label for="rename-{column._id}">Name</Label>

				<Input id="rename-{column._id}" name="name" bind:value={rename_value} required />
			</div>

			<Dialog.Footer>
				<Button type="submit">Save</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={add_card_dialog_open}>
	<Dialog.Content class="sm:max-w-106.25">
		<Dialog.Header>
			<Dialog.Title>New card</Dialog.Title>
		</Dialog.Header>

		<form
			method="POST"
			action="?/add_card"
			class="flex flex-col gap-4"
			use:enhance={() => {
				return async ({ update }) => {
					await update();
					add_card_dialog_open = false;
					new_card_title = '';
				};
			}}
		>
			<input type="hidden" name="board_id" value={form?.board?._id} />
			<input type="hidden" name="column_id" value={column._id} />

			<div class="flex flex-col gap-1.5">
				<Label for="card-title">Title</Label>

				<Input
					id="card-title"
					name="title"
					bind:value={new_card_title}
					required
					placeholder="New task"
				/>
			</div>

			<Dialog.Footer>
				<Button type="submit">Create card</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
