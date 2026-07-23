<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { shorten_user_name } from '$lib/utils';

	let { data } = $props();

	let name = $state('');
	let avatar = $state('');
	let email = $state('');

	let theme = $state('system');
</script>

<div class="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6">
	<div>
		<h1 class="text-2xl font-semibold text-foreground">Settings</h1>
		<p class="text-sm text-muted-foreground">Manage your account preferences.</p>
	</div>

	<!-- Profile -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Profile</Card.Title>
			<Card.Description>Update your personal information.</Card.Description>
		</Card.Header>

		<Card.Content>
			<form method="POST" action="?/update_profile" class="flex flex-col gap-5">
				<div class="flex flex-col gap-2">
					<Label for="name">Name</Label>
					<Input id="name" name="name" bind:value={name} placeholder="Your name" />
				</div>

				<div class="flex flex-col gap-2">
					<Label for="email">Email</Label>
					<Input id="email" name="email" value={email} disabled />
					<p class="text-xs text-muted-foreground">Email changes are managed separately.</p>
				</div>

				<div class="flex flex-col gap-2">
					<Label for="avatar">Avatar URL</Label>
					<div class="flex items-center gap-3">
						<Avatar.Root class="h-12 w-12">
							<Avatar.Image src={avatar} alt="User Avatar" />
							<Avatar.Fallback>{shorten_user_name(name)}</Avatar.Fallback>
						</Avatar.Root>
						<Input
							id="avatar"
							name="avatar"
							bind:value={avatar}
							placeholder="https://example.com/avatar.png"
						/>
					</div>
				</div>

				<Button type="submit" class="w-fit">Save changes</Button>
			</form>
		</Card.Content>
	</Card.Root>

	<!-- Security -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Security</Card.Title>
			<Card.Description>Manage your account security.</Card.Description>
		</Card.Header>

		<Card.Content>
			<div class="flex flex-col gap-4">
				<div>
					<p class="text-sm font-medium">Password</p>
					<p class="text-sm text-muted-foreground">
						Update your password regularly to keep your account secure.
					</p>
				</div>

				<Button variant="outline" class="w-fit">Change password</Button>
			</div>
		</Card.Content>
	</Card.Root>
</div>
