import { authenticate } from '$lib/server/authenticate';
import { membership_model, OrganizationRole } from '$lib/server/mongodb/models/membership';
import { organization_model } from '$lib/server/mongodb/models/organization';
import { serializeNonPOJOs } from '$lib/server/utils/serializeNonPOJOs';
import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	try {
		const authenticated = authenticate(event.cookies);

		if (!authenticated) {
			throw new Error('User not authenticated');
		}

		const organisations = await membership_model.find({ user: authenticated.id });

		return serializeNonPOJOs({ organisations });
	} catch (error) {
		console.error(error);
		return { organisations: [] };
	}
};

export const actions: Actions = {
	create_organisation: async ({ request, cookies }) => {
		const authenticated = authenticate(cookies);

		if (!authenticated) {
			throw new Error('User not authenticated');
		}

		const data = await request.formData();
		const name = (data.get('name') as string)?.trim();
		const icon = (data.get('icon') as string)?.trim();

		if (!name) {
			return { error: 'Organization name is required' };
		}

		try {
			const new_organisation = await organization_model.create({
				name,
				icon
			});

			await membership_model.create({
				user: authenticated.id,
				organization: new_organisation._id,
				role: OrganizationRole.OWNER
			});

			return { success: true, organisation: new_organisation };
		} catch (error) {
			console.error(error);
			return { error: 'Failed to create organization' };
		}
	}
};
