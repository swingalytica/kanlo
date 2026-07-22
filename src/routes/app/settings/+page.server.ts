import { authenticate } from '$lib/server/authenticate';
import { label_model } from '$lib/server/mongodb/models/label';
import { membership_model, OrganizationRole } from '$lib/server/mongodb/models/membership';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const auth = authenticate(event.cookies);

	if (!auth) {
		return {
			status: 401,
			error: new Error('Unauthorized')
		};
	}

	const memberships = await membership_model
		.find({
			user: auth.id,
			role: {
				$in: [OrganizationRole.OWNER, OrganizationRole.ADMIN]
			}
		})
		.populate('organization')
		.lean();

	const organizations = memberships.map((membership) => membership.organization);

	const labels = await label_model
		.find({
			organization: {
				$in: organizations.map((organization) => organization._id)
			}
		})
		.sort({
			name: 1
		})
		.lean();

	return {
		organizations: JSON.parse(JSON.stringify(organizations)),
		labels: JSON.parse(JSON.stringify(labels))
	};
};

export const actions: Actions = {
	create_label: async ({ request, params }) => {
		const data = await request.formData();

		const organization_id = data.get('organization_id');
		const name = data.get('name');
		const color = data.get('color');

		if (
			typeof name !== 'string' ||
			typeof color !== 'string' ||
			typeof organization_id !== 'string'
		) {
			return fail(400);
		}

		await label_model.create({
			name,
			color,
			organization: organization_id
		});

		return {
			success: true
		};
	},
	update_label: async ({ request }) => {
		const data = await request.formData();

		const id = data.get('id');
		const name = data.get('name');
		const color = data.get('color');

		if (typeof id !== 'string' || typeof name !== 'string' || typeof color !== 'string') {
			return fail(400);
		}

		await label_model.updateOne(
			{
				_id: id
			},
			{
				$set: {
					name,
					color
				}
			}
		);

		return {
			success: true
		};
	},
	delete_label: async ({ request }) => {
		const data = await request.formData();

		const id = data.get('id');

		if (typeof id !== 'string') {
			return fail(400);
		}

		await label_model.deleteOne({
			_id: id
		});

		return {
			success: true
		};
	}
};
