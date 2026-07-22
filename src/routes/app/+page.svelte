<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let name = $state('');
	let logo_url = $state('');

	function generateLogoFallback(name: string): string | null {
		if (name.trim() === '') {
			return null;
		}

		const initials = name
			.split(' ')
			.map((word) => word[0])
			.join('')
			.toUpperCase();
		return initials;
	}
</script>

{#if data.organisations && data.organisations.length == 0}
	<div class="flex h-full flex-col items-center justify-center gap-6">
		<div class="text-center">
			<h1 class="mb-2 text-2xl font-bold text-foreground">No organisations found</h1>
			<p class="text-muted-foreground">You are not a member of any organisations yet.</p>
		</div>

		<form
			method="POST"
			action="?/create_organisation"
			class="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-border bg-card p-6"
		>
			<div class="flex flex-col gap-1.5">
				<Avatar.Root>
					<Avatar.Image src={logo_url} alt={name} />
					<Avatar.Fallback>{generateLogoFallback(name) ?? 'AC'}</Avatar.Fallback>
				</Avatar.Root>
			</div>

			<div class="flex flex-col gap-1.5">
				<Label for="name" class="text-sm font-medium text-foreground">Name</Label>
				<Input
					id="name"
					name="name"
					type="text"
					bind:value={name}
					required
					placeholder="Acme Inc."
					class="rounded-md border border-input bg-input px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
				/>
			</div>

			<div class="flex flex-col gap-1.5">
				<Label for="logo_url" class="text-sm font-medium text-foreground">Logo URL</Label>
				<Input
					id="logo_url"
					name="logo_url"
					type="url"
					bind:value={logo_url}
					placeholder="https://example.com/logo.png"
					class="rounded-md border border-input bg-input px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
				/>
			</div>

			<Button
				type="submit"
				class="mt-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
			>
				Create organisation
			</Button>
		</form>
	</div>
{/if}
