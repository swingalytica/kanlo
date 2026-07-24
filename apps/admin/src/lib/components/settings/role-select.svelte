<script lang="ts">
	import { enhance } from '$app/forms';
	import { OrganizationRole } from '$lib/shared/enum';
	import * as Select from '../ui/select';

	let { membership } = $props();

	let role = $state('');

	$effect(() => {
		role = membership.role;
	});

	let role_forms = $state<Record<string, HTMLFormElement>>({});

	function handle_role_change(membership_id: string, form_ref: HTMLFormElement) {
		queueMicrotask(() => {
			form_ref.requestSubmit();
		});
	}
</script>

<form
	method="POST"
	action="?/update_member_role"
	use:enhance
	bind:this={role_forms[membership._id]}
>
	<Select.Root
		type="single"
		bind:value={role}
		onValueChange={() => {
			handle_role_change(membership._id, role_forms[membership._id]);
		}}
	>
		<Select.Trigger class="h-8 w-28 text-xs capitalize">
			{role.toLowerCase()}
		</Select.Trigger>

		<Select.Content>
			<Select.Item value={OrganizationRole.OWNER}>Owner</Select.Item>
			<Select.Item value={OrganizationRole.ADMIN}>Admin</Select.Item>
			<Select.Item value={OrganizationRole.MEMBER}>Member</Select.Item>
		</Select.Content>
	</Select.Root>

	<input type="hidden" name="membership_id" value={membership._id} />
	<input type="hidden" name="role" value={role} />
</form>
