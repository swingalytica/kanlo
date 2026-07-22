import { authenticate } from '$lib/server/authenticate';
import { membership_model } from '$lib/server/mongodb/models/membership';
import { organization_model } from '$lib/server/mongodb/models/organization';
import { project_model } from '$lib/server/mongodb/models/project';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const authenticated = authenticate(event.cookies);

	if (!authenticated) {
		throw new Error('User not authenticated');
	}

	const organization_id = event.params.id;

	const organization = await organization_model.findById(organization_id).lean();
	const projects = await project_model.find({ organization: organization_id }).lean();

	return {
		organization: JSON.parse(JSON.stringify(organization)),
		projects: JSON.parse(JSON.stringify(projects))
	};
};

export const actions: Actions = {
	create_project: async ({ request, params, cookies }) => {
		const authenticated = authenticate(cookies);

		if (!authenticated) {
			throw new Error('User not authenticated');
		}

		const membership = await membership_model.findOne({
			user: authenticated.id,
			organization: params.id
		});

		if (!membership) {
			return { error: 'Not a member of this organization' };
		}

		const data = await request.formData();
		const name = (data.get('name') as string)?.trim();

		if (!name) {
			return { error: 'Project name is required' };
		}

		try {
			const project = await project_model.create({
				name,
				organization: params.id
			});

			return { success: true, project: JSON.parse(JSON.stringify(project)) };
		} catch (error) {
			console.error(error);
			return { error: 'Failed to create project' };
		}
	}
};
