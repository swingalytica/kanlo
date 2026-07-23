<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Field, FieldGroup, FieldLabel } from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import type { ActionData as RegisterActionData } from '../../routes/register/$types';

	const { form }: { form: RegisterActionData } = $props();

	const id = $props.id();
</script>

<Card.Root class="mx-auto w-full max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Register</Card.Title>
		<Card.Description
			>Geben Sie unten Ihre E-Mail-Adresse ein, um ein neues Konto zu erstellen</Card.Description
		>
	</Card.Header>
	<Card.Content>
		<form method="POST" action="?/register" use:enhance>
			<FieldGroup>
				<Field>
					<FieldLabel for="email-{id}">E-Mail</FieldLabel>
					<Input
						id="email-{id}"
						name="email"
						type="email"
						placeholder="v.nachname@hammer.partners"
						value={form?.user?.email ?? ''}
						required
					/>
				</Field>
				<Field>
					<FieldLabel for="name-{id}">Name</FieldLabel>
					<Input
						id="name-{id}"
						name="name"
						type="text"
						placeholder="Vorname Nachname"
						value={form?.user?.name ?? ''}
						required
					/>
				</Field>
				<Field>
					<div class="flex items-center">
						<FieldLabel for="password-{id}">Passwort</FieldLabel>
					</div>
					<Input id="password-{id}" name="password" type="password" required />
				</Field>
				<Field>
					<Button type="submit" class="w-full">Register</Button>
				</Field>
				<Field>
					{#if form?.user && !('success_message' in form)}
						<p class="text-sm text-success">
							Erfolgreich registriert als {form.user.email}. Sie können nun fortfahren.
						</p>
					{/if}
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
