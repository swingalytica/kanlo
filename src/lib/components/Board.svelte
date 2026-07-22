<script lang="ts">
	import type { ActionData } from '../../routes/app/[id]/$types';
	import Column from './Column.svelte';

	let { form }: { form: ActionData } = $props();

	export type ColumnType = {
		_id: string;
		name: string;
		order: number;
	};

	const sorted_columns: ColumnType[] = $derived(
		[...form?.board.columns].sort((a, b) => a.order - b.order)
	);
</script>

<div class="flex h-full gap-4 overflow-x-auto p-6">
	{#each sorted_columns as column (column._id)}
		<Column {column} {form} />
	{/each}
</div>
