import { authenticate } from '$lib/server/authenticate';
import { membership_model } from '$lib/server/mongodb/models/membership';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	try {
		const authenticated = authenticate(event.cookies);

		if (!authenticated) {
			throw new Error('User not authenticated');
		}

		const organisations = await membership_model.find({ user: authenticated.id });

		console.log(organisations);
		return { organisations };
	} catch (error) {
		console.error(error);
		return { organisations: [] };
	}
};
