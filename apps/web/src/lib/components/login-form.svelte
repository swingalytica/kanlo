<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Field, FieldGroup, FieldLabel } from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import type { ActionData } from '../../routes/$types';

	const { form }: { form: ActionData } = $props();

	const id = $props.id();
</script>

<Card.Root class="mx-auto w-full max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Login</Card.Title>
		<Card.Description>Enter your email address below to log in to your account</Card.Description>
	</Card.Header>
	<Card.Content>
		<form method="POST" action="?/login" use:enhance>
			<FieldGroup>
				<Field>
					<FieldLabel for="email-{id}">E-Mail</FieldLabel>
					<Input
						id="email-{id}"
						name="email"
						type="email"
						placeholder="youremail@example.com"
						value={form?.user?.email ?? ''}
						required
					/>
				</Field>
				<Field>
					<div class="flex items-center">
						<FieldLabel for="password-{id}">Password</FieldLabel>
					</div>
					<Input id="password-{id}" name="password" type="password" required />
				</Field>
				<Field>
					<Button type="submit" class="w-full">Login</Button>
				</Field>
				<Field>
					{#if form?.error}
						<p class="text-sm text-destructive">{form.error}</p>
					{:else if form && 'success_message' in form && form.success_message}
						<p class="text-sm text-success">{form.success_message}</p>
					{/if}
				</Field>
			</FieldGroup>
		</form>
	</Card.Content>
</Card.Root>
