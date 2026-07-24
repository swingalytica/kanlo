import { authenticate } from '$lib/server/authenticate';
import { membership_model } from '$lib/server/mongodb/models/membership';
import { permission_override_model } from '$lib/server/mongodb/models/permission';
import { has_permission } from '$lib/server/permissions';
import { require_admin } from '$lib/server/utils/requireAdmin';
import type { OrganizationRole } from '$lib/shared/enum';
import { permissions } from '$lib/shared/permissions.const';
import { fail, type Actions, type Cookies } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event: {
	params: { member_id: string; id: string };
	cookies: Cookies;
}) => {
	const { member_id, id: organization_id } = event.params;
	const authenticated = authenticate(event.cookies);

	if (!authenticated) {
		throw new Error('User not authenticated');
	}

	const membership = await membership_model
		.findOne({
			user: member_id,
			organization: organization_id
		})
		.populate('user', 'email')
		.lean();

	if (!membership) {
		return { error: 'Member not found' };
	}

	const overrides = await permission_override_model.find({ membership: membership._id }).lean();

	const override_map = new Map(overrides.map((o) => [o.permission, o.value]));

	const permission_rows = Object.entries(permissions).map(([key, allowed_roles]) => ({
		key,
		default_allowed: (allowed_roles as readonly OrganizationRole[]).includes(membership.role),
		override: override_map.get(key) ?? null
	}));

	return {
		membership: JSON.parse(JSON.stringify(membership)),
		user_id: authenticated.id,
		permission_rows
	};
};

export const actions: Actions = {
	set_permission_override: async (event) => {
		try {
			const { member_id, id: organization_id } = event.params;
			const authenticated = authenticate(event.cookies);

			if (!authenticated) {
				return fail(401, { error: 'Not authenticated' });
			}

			if (!member_id || !organization_id) {
				return fail(400, { error: 'Member ID and Organization ID are required' });
			}

			const admin_membership = await require_admin(authenticated.id, organization_id);

			if (!admin_membership) {
				return fail(403, { error: 'Not authorized' });
			}

			const can_manage_members = await has_permission(
				{ _id: admin_membership.user.toString(), role: admin_membership.role },
				'manage_members'
			);

			if (!can_manage_members) {
				return fail(403, { error: 'Insufficient permissions to manage members' });
			}

			const member_membership = await membership_model.findOne({
				user: member_id,
				organization: organization_id
			});

			if (!member_membership) {
				return fail(404, { error: 'Member not found in this organization' });
			}

			const data = await event.request.formData();
			const permission = data.get('permission') as string;
			const state = data.get('state') as string; // 'default' | 'allow' | 'deny'

			if (!permission || !state) {
				return fail(400, { error: 'Permission and state are required' });
			}

			if (authenticated.id === member_id && permission === 'manage_members') {
				return fail(400, { error: 'You cannot change your own Manage Members permission' });
			}

			if (state === 'default') {
				await permission_override_model.deleteOne({
					membership: member_membership._id,
					permission
				});
			} else {
				await permission_override_model.findOneAndUpdate(
					{ membership: member_membership._id, permission },
					{ value: state === 'allow' },
					{ upsert: true }
				);
			}

			return { success: true, message: 'Permission override updated successfully' };
		} catch (error) {
			console.error('Error in set_permission_override action:', error);
			return fail(500, { error: 'An unexpected error occurred' });
		}
	}
};
