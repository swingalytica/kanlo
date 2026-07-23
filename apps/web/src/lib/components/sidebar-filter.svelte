<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { Separator } from '$lib/components/ui/separator';
	import type { Filter } from '$lib/types/filter';
	import type { PageData } from '../../routes/app/[id]/[project_id]/$types';
	import { Button } from './ui/button';

	let { data, filters = $bindable() }: { data: PageData; filters: Filter } = $props();

	let selected_assignee = $state<string | undefined>();
	let show_completed = $state(true);
	let selected_labels = $state<string[]>([]);
</script>

<aside class="flex h-full min-h-screen w-64 flex-col border-l border-border bg-card p-4">
	<div class="mb-4 border-b-2 border-border pb-3">
		<span class="text-sm font-semibold text-foreground">Filters</span>
	</div>

	<div class="flex flex-col gap-6">
		<!-- Assignee -->
		<div class="flex flex-col gap-2">
			<Label class="text-xs font-semibold text-muted-foreground uppercase">Assignee</Label>

			<Select.Root type="single" bind:value={filters.assignee}>
				<Select.Trigger>
					{#if filters.assignee && filters.assignee !== 'everyone' && filters.assignee !== 'unassigned'}
						{data.members.find(
							(member: { user: { _id: string | undefined } }) =>
								member.user._id === filters.assignee
						)?.user.name}
					{:else if filters.assignee === 'unassigned'}
						Unassigned
					{:else}
						Everyone
					{/if}
				</Select.Trigger>

				<Select.Content>
					<Select.Item value="everyone">Everyone</Select.Item>

					{#each data.members as member (member.user._id)}
						<Select.Item value={member.user._id}>
							{member.user.name}
						</Select.Item>
					{/each}

					<Select.Item value="unassigned">Unassigned</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>

		<Separator />

		<!-- Status -->
		<div class="flex flex-col gap-3">
			<Label class="text-xs font-semibold text-muted-foreground uppercase">Status</Label>

			<div class="flex items-center gap-2">
				<Checkbox id="completed" bind:checked={filters.show_completed} />
				<Label for="completed">Show completed</Label>
			</div>
		</div>

		<Separator />

		<!-- Labels -->
		<div class="flex flex-col gap-3">
			<Label class="text-xs font-semibold text-muted-foreground uppercase">Labels</Label>

			<div class="flex flex-col gap-2">
				{#each data.labels as label (label._id)}
					<div class="flex items-center gap-2">
						<Checkbox
							id={label._id}
							checked={filters?.labels?.includes(label._id)}
							onCheckedChange={(checked) => {
								if (checked) {
									filters.labels = [...(filters?.labels ?? []), label._id];
								} else {
									filters.labels = (filters?.labels ?? []).filter((id) => id !== label._id);
								}
							}}
						/>

						<Label for={label._id}>
							{label.name}
						</Label>
					</div>
				{/each}
			</div>
		</div>

		<Separator />

		<!-- Due date -->
		<div class="flex flex-col gap-3">
			<Label class="text-xs font-semibold text-muted-foreground uppercase">Due date</Label>

			<div class="flex flex-col gap-2 text-sm">
				<Button
					variant={filters.due_date === 'overdue' ? 'default' : 'ghost'}
					onclick={() => {
						filters.due_date = filters.due_date === 'overdue' ? null : 'overdue';
					}}
				>
					Overdue
				</Button>

				<Button
					variant={filters.due_date === 'today' ? 'default' : 'ghost'}
					onclick={() => {
						filters.due_date = filters.due_date === 'today' ? null : 'today';
					}}
				>
					Today
				</Button>

				<Button
					variant={filters.due_date === 'week' ? 'default' : 'ghost'}
					onclick={() => {
						filters.due_date = filters.due_date === 'week' ? null : 'week';
					}}
				>
					This week
				</Button>

				<Button
					variant={filters.due_date === 'no_due_date' ? 'default' : 'ghost'}
					onclick={() => {
						filters.due_date = filters.due_date === 'no_due_date' ? null : 'no_due_date';
					}}
				>
					No due date
				</Button>
			</div>
		</div>
	</div>
</aside>
