<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	let {
		card,
		column,
		index,
		cardDragStart,
		cardDragEnd
	}: {
		card: {
			_id: string;
			title: string;
			column: string;
			order: number;
		};
		column: string;
		index: number;
		cardDragStart: (card_id: string, column_id: string, index: number) => void;
		cardDragEnd: (card_id: string, column_id: string, order: number) => void;
	} = $props();

	let dialog_open = $state(false);
	let title: string = $state<string>('');

	$effect(() => {
		title = card.title;
	});
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
		dialog_open = true;
	}}
	class="w-full cursor-grab rounded-md border border-border bg-background p-3 text-left text-sm text-foreground shadow-sm active:cursor-grabbing"
>
	{card.title}
</button>

<Dialog.Root bind:open={dialog_open}>
	<Dialog.Content class="sm:max-w-xl">
		<Dialog.Header>
			<Dialog.Title>{card.title}</Dialog.Title>
		</Dialog.Header>

		<div class="flex flex-col gap-4">
			<div class="flex flex-col gap-1.5">
				<Label for="title-{card._id}">Title</Label>

				<Input id="title-{card._id}" bind:value={title} />
			</div>

			<div class="rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground">
				Card details coming soon...
			</div>
		</div>

		<Dialog.Footer>
			<Button>Save</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
