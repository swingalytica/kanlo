<script lang="ts">
	import { enhance } from '$app/forms';
	import { Trash2 } from '@lucide/svelte';
	import type { PageData } from '../../../routes/app/[id]/$types';
	import { Button } from '../ui/button';
	import RoleSelect from './role-select.svelte';

	let { data }: { data: PageData } = $props();
</script>

{#snippet role_select(membership: { _id: string; role: string })}
	<RoleSelect {membership} />
{/snippet}

<section class="mb-10">
	<h2 class="mb-3 text-sm font-medium text-muted-foreground">Members</h2>

	<div class="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
		{#each data.memberships as membership (membership._id)}
			<div class="group flex items-center justify-between gap-4 px-5 py-3">
				<a href="/app/{data.organization._id}/members/{membership.user._id}" class="flex-1">
					<span class="text-sm text-foreground">{membership.user.email}</span>
				</a>

				<div class="flex items-center gap-2">
					{@render role_select(membership)}

					<form method="POST" action="?/remove_member" use:enhance>
						<input type="hidden" name="membership_id" value={membership._id} />

						<Button type="submit" variant="ghost" size="icon" class="h-8 w-8 text-destructive">
							<Trash2 class="h-4 w-4" />
						</Button>
					</form>
				</div>
			</div>
		{/each}
	</div>
</section>
