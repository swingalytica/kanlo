<script lang="ts">
	import { enhance } from '$app/forms';
	import { generateLogoFallback } from '$lib/utils/logo';
	import * as Avatar from '../ui/avatar';
	import { Button } from '../ui/button';
	import { Input } from '../ui/input';
	import { Label } from '../ui/label';

	let { name, icon }: { name: string; icon: string } = $props();
</script>

<section class="mb-10">
	<h2 class="mb-3 text-sm font-medium text-muted-foreground">General</h2>

	<form
		method="POST"
		action="?/update_organisation"
		use:enhance
		class="flex flex-col gap-4 rounded-xl border border-border bg-card p-5"
	>
		<div class="flex flex-col gap-1.5">
			<Label for="name">Name</Label>
			<Input id="name" name="name" bind:value={name} required />
		</div>

		<div class="flex flex-col gap-1.5">
			<Label for="icon">Icon URL</Label>
			<div class="flex items-center gap-3">
				<Avatar.Root>
					<Avatar.Image src={icon} alt="Organization Icon" />
					<Avatar.Fallback>{generateLogoFallback(name)}</Avatar.Fallback>
				</Avatar.Root>
				<Input id="icon" name="icon" bind:value={icon} placeholder="https://..." />
			</div>
		</div>

		<Button type="submit" class="w-fit">Save changes</Button>
	</form>
</section>
