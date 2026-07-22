<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { MoreVertical, Plus } from '@lucide/svelte';
	import type { ActionData } from '../../routes/app/[id]/$types';

	let { form }: { form: ActionData } = $props();

	const sorted_columns = $derived([...form?.board.columns].sort((a, b) => a.order - b.order));

	function cards_for_column(column_id: string) {
		return form?.cards
			.filter((card: { column: string }) => card.column === column_id)
			.sort((a: { order: number }, b: { order: number }) => a.order - b.order);
	}
</script>

<div class="flex h-full gap-4 overflow-x-auto p-6">
	{#each sorted_columns as column (column._id)}
		<div class="flex w-72 shrink-0 flex-col rounded-lg bg-card">
			<div class="flex items-center justify-between px-3 py-2">
				<span class="text-sm font-medium text-foreground">{column.name}</span>

				<div class="flex items-center gap-1">
					<span class="text-xs text-muted-foreground">{cards_for_column(column._id).length}</span>

					<DropdownMenu.Root>
						<DropdownMenu.Trigger
							class={buttonVariants({ variant: 'ghost', size: 'icon', class: 'h-6 w-6' })}
						>
							<MoreVertical class="h-4 w-4" />
						</DropdownMenu.Trigger>
						<DropdownMenu.Content>
							<DropdownMenu.Item>Rename column</DropdownMenu.Item>
							<DropdownMenu.Item class="text-destructive">Delete column</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
			</div>

			<div class="flex flex-col gap-2 px-3 pb-3">
				{#each cards_for_column(column._id) as card (card._id)}
					<div
						class="rounded-md border border-border bg-background p-3 text-sm text-foreground shadow-sm"
					>
						{card.title}
					</div>
				{/each}

				<button
					class="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
				>
					<Plus class="h-4 w-4" />
					Add card
				</button>
			</div>
		</div>
	{/each}
</div>
