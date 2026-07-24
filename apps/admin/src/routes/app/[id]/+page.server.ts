import { authenticate } from '$lib/server/authenticate';
import { invite_model } from '$lib/server/mongodb/models/invite';
import { label_model } from '$lib/server/mongodb/models/label';
import { membership_model, OrganizationRole } from '$lib/server/mongodb/models/membership';
import { organization_model } from '$lib/server/mongodb/models/organization';
import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

async function require_admin(user_id: string, organization_id: string) {
	const membership = await membership_model.findOne({
		user: user_id,
		organization: organization_id
	});

	if (
		!membership ||
		(membership.role !== OrganizationRole.OWNER && membership.role !== OrganizationRole.ADMIN)
	) {
		return null;
	}

	return membership;
}

export const load: PageServerLoad = async (event) => {
	const authenticated = authenticate(event.cookies);

	if (!authenticated) {
		throw new Error('User not authenticated');
	}

	const organization_id = event.params.id;

	const membership = await require_admin(authenticated.id, organization_id);
	const labels = await label_model.find({ organization: organization_id }).lean();

	if (!membership) {
		return { error: 'You do not have admin access to this organisation' };
	}

	const organization = await organization_model.findById(organization_id).lean();

	const memberships = await membership_model
		.find({ organization: organization_id })
		.populate('user', 'email')
		.lean();

	const invites = await invite_model.find({ organization: organization_id }).lean();

	return {
		organization: JSON.parse(JSON.stringify(organization)),
		memberships: JSON.parse(JSON.stringify(memberships)),
		invites: JSON.parse(JSON.stringify(invites)),
		current_membership: JSON.parse(JSON.stringify(membership)),
		labels: JSON.parse(JSON.stringify(labels))
	};
};

export const actions: Actions = {
	update_organisation: async (event) => {
		const authenticated = authenticate(event.cookies);

		if (!authenticated) {
			return fail(401, { error: 'Not authenticated' });
		}

		const organization_id = event.params.id;

		if (!organization_id) {
			return fail(400, { error: 'Organization ID is required' });
		}

		const admin_membership = await require_admin(authenticated.id, organization_id);

		if (!admin_membership) {
			return fail(403, { error: 'Not authorized' });
		}

		const data = await event.request.formData();
		const name = (data.get('name') as string)?.trim();
		const icon = (data.get('icon') as string)?.trim();

		if (!name) {
			return fail(400, { error: 'Name is required' });
		}

		await organization_model.findByIdAndUpdate(organization_id, { name, icon });

		return { success: true, message: 'Organization updated successfully' };
	},

	create_invite: async (event) => {
		const authenticated = authenticate(event.cookies);

		if (!authenticated) {
			return fail(401, { error: 'Not authenticated' });
		}

		const organization_id = event.params.id;

		if (!organization_id) {
			return fail(400, { error: 'Organization ID is required' });
		}

		const admin_membership = await require_admin(authenticated.id, organization_id);

		if (!admin_membership) {
			return fail(403, { error: 'Not authorized' });
		}

		const data = await event.request.formData();
		const email = (data.get('email') as string)?.trim().toLowerCase();
		const role = data.get('role') as string;

		if (!email) {
			return fail(400, { error: 'Email is required' });
		}

		const memberships = await membership_model
			.find({ organization: organization_id })
			.populate('user', 'email');

		const already_member = memberships.some(
			(m) => (m.user as unknown as { email: string })?.email === email
		);

		if (already_member) {
			return fail(400, { error: 'This person is already a member' });
		}

		try {
			const safe_role: OrganizationRole = Object.values(OrganizationRole).includes(
				role as OrganizationRole
			)
				? (role as OrganizationRole)
				: OrganizationRole.MEMBER;

			await invite_model.create({
				organization: organization_id,
				email,
				role: safe_role,
				invited_by: authenticated.id
			});

			return { success: true, message: 'Invite created successfully' };
		} catch (error) {
			console.error(error);
			return fail(500, { error: 'Failed to create invite (maybe already invited?)' });
		}
	},

	revoke_invite: async (event) => {
		const authenticated = authenticate(event.cookies);

		if (!authenticated) {
			return fail(401, { error: 'Not authenticated' });
		}

		const organization_id = event.params.id;

		if (!organization_id) {
			return fail(400, { error: 'Organization ID is required' });
		}

		const admin_membership = await require_admin(authenticated.id, organization_id);

		if (!admin_membership) {
			return fail(403, { error: 'Not authorized' });
		}

		const data = await event.request.formData();
		const invite_id = data.get('invite_id') as string;

		await invite_model.deleteOne({ _id: invite_id, organization: organization_id });

		return { success: true, message: 'Invite revoked successfully' };
	},

	update_member_role: async (event) => {
		const authenticated = authenticate(event.cookies);

		if (!authenticated) {
			return fail(401, { error: 'Not authenticated' });
		}

		const organization_id = event.params.id;

		if (!organization_id) {
			return fail(400, { error: 'Organization ID is required' });
		}

		const admin_membership = await require_admin(authenticated.id, organization_id);

		if (!admin_membership) {
			return fail(403, { error: 'Not authorized' });
		}

		const data = await event.request.formData();
		const membership_id = data.get('membership_id') as string;
		const role = data.get('role') as string;

		if (!Object.values(OrganizationRole).includes(role as OrganizationRole)) {
			return fail(400, { error: 'Invalid role' });
		}

		if (membership_id === admin_membership._id.toString()) {
			return fail(400, { error: "You can't change your own role" });
		}

		await membership_model.findOneAndUpdate(
			{ _id: membership_id, organization: organization_id },
			{ role }
		);

		return { success: true, message: 'Member role updated successfully' };
	},

	remove_member: async (event) => {
		const authenticated = authenticate(event.cookies);

		if (!authenticated) {
			return fail(401, { error: 'Not authenticated' });
		}

		const organization_id = event.params.id;

		if (!organization_id) {
			return fail(400, { error: 'Organization ID is required' });
		}

		const admin_membership = await require_admin(authenticated.id, organization_id);

		if (!admin_membership) {
			return fail(403, { error: 'Not authorized' });
		}

		const data = await event.request.formData();
		const membership_id = data.get('membership_id') as string;

		if (membership_id === admin_membership._id.toString()) {
			return fail(400, { error: "You can't remove yourself" });
		}

		await membership_model.deleteOne({ _id: membership_id, organization: organization_id });

		return { success: true, message: 'Member removed successfully' };
	},
	create_label: async (event) => {
		const authenticated = authenticate(event.cookies);

		if (!authenticated) {
			return fail(401, { error: 'Not authenticated' });
		}

		const organization_id = event.params.id;

		if (!organization_id) {
			return fail(400, { error: 'Organization ID is required' });
		}

		const admin_membership = await require_admin(authenticated.id, organization_id);

		if (!admin_membership) {
			return fail(403, { error: 'Not authorized' });
		}

		const data = await event.request.formData();
		const name = (data.get('name') as string)?.trim();
		const color = (data.get('color') as string)?.trim();

		if (!name || !color) {
			return fail(400, { error: 'Name and color are required' });
		}

		await label_model.create({
			organization: organization_id,
			name,
			color
		});

		return { success: true };
	},

	delete_label: async (event) => {
		const authenticated = authenticate(event.cookies);

		if (!authenticated) {
			return fail(401, { error: 'Not authenticated' });
		}

		const organization_id = event.params.id;

		if (!organization_id) {
			return fail(400, { error: 'Organization ID is required' });
		}

		const admin_membership = await require_admin(authenticated.id, organization_id);

		if (!admin_membership) {
			return fail(403, { error: 'Not authorized' });
		}

		const data = await event.request.formData();
		const label_id = data.get('label_id') as string;

		await label_model.deleteOne({ _id: label_id, organization: organization_id });

		return { success: true };
	},
	update_label: async (event) => {
		const authenticated = authenticate(event.cookies);

		if (!authenticated) {
			return fail(401, { error: 'Not authenticated' });
		}

		const organization_id = event.params.id;

		if (!organization_id) {
			return fail(400, { error: 'Organization ID is required' });
		}

		const admin_membership = await require_admin(authenticated.id, organization_id);

		if (!admin_membership) {
			return fail(403, { error: 'Not authorized' });
		}

		const data = await event.request.formData();
		const label_id = data.get('label_id') as string;
		const name = (data.get('name') as string)?.trim();
		const color = (data.get('color') as string)?.trim();

		if (!label_id || !name || !color) {
			return fail(400, { error: 'label_id, name and color are required' });
		}

		await label_model.findOneAndUpdate(
			{ _id: label_id, organization: organization_id },
			{ name, color }
		);

		return { success: true };
	}
};
