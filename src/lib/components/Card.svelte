<script lang="ts">

	let { card }: { card: { _id: string; title: string; column: string; order: number } } = $props();
</script>

<div class="rounded-md border border-border bg-background p-3 text-sm text-foreground shadow-sm">
	{card.title}
</div>
