<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as ContextMenu from '$lib/components/ui/context-menu';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { MoreVertical, Plus } from '@lucide/svelte';
	import type { PageData } from '../../routes/app/[id]/$types';

	let { data }: { data: PageData } = $props();
	let dialog_open = $state(false);
	let name = $state('');
</script>

<aside class="flex h-full min-h-screen w-64 flex-col border-r border-border bg-card p-4">
	<div class="mb-4 flex items-center justify-between border-b-2 border-border">
		<span class="text-sm font-semibold text-foreground">Projects</span>

		<Dialog.Root bind:open={dialog_open}>
			<Dialog.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
				<Plus class="h-4 w-4" />
			</Dialog.Trigger>
			<Dialog.Content class="sm:max-w-106.25">
				<Dialog.Header>
					<Dialog.Title>New project</Dialog.Title>
					<Dialog.Description>Give your project a name to get started.</Dialog.Description>
				</Dialog.Header>

				<form
					method="POST"
					action="?/create_project"
					class="flex flex-col gap-4"
					use:enhance={() => {
						return async ({ update }) => {
							await update();
							dialog_open = false;
							name = '';
						};
					}}
				>
					<div class="flex flex-col gap-1.5">
						<Label for="name">Name</Label>
						<Input id="name" name="name" bind:value={name} required placeholder="My Project" />
					</div>

					<Dialog.Footer>
						<Button type="submit">Create project</Button>
					</Dialog.Footer>
				</form>
			</Dialog.Content>
		</Dialog.Root>
	</div>

	<nav class="flex flex-col gap-1">
		{#each data.projects as project (project._id)}
			<div class="border-b-2 border-border py-2">
				<ContextMenu.Root>
					<ContextMenu.Trigger class="flex flex-row items-center justify-between">
						<Button
							variant="outline"
							size="sm"
							href={`/app/${data.organization._id}/${project._id}`}
						>
							{project.name}
						</Button>
						<Button variant="secondary" size="sm" disabled>
							<MoreVertical />
						</Button>
					</ContextMenu.Trigger>
					<ContextMenu.Content>
						<form action="?/delete_project" method="POST" use:enhance>
							<ContextMenu.Item class="text-destructive">
								<Button variant="ghost" size="sm" type="submit" name="id" value={project._id}>
									Delete project
								</Button>
							</ContextMenu.Item>
						</form>
					</ContextMenu.Content>
				</ContextMenu.Root>
			</div>
		{/each}
	</nav>
</aside>
