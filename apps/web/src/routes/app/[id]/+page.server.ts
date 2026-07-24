import { authenticate } from '$lib/server/authenticate';
import { label_model } from '$lib/server/mongodb/models/label';
import { organization_model } from '$lib/server/mongodb/models/organization';
import { project_model } from '$lib/server/mongodb/models/project';
import '$lib/server/mongodb/models/user';
import { create_project } from '$lib/server/projects/create';
import { delete_project } from '$lib/server/projects/delete';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const authenticated = authenticate(event.cookies);

	if (!authenticated) {
		throw new Error('User not authenticated');
	}

	const organization_id = event.params.id;

	const organization = await organization_model.findById(organization_id).lean();
	const projects = await project_model.find({ organization: organization_id }).lean();
	const labels = await label_model.find({ organization: organization_id }).lean();

	return {
		organization: JSON.parse(JSON.stringify(organization)),
		projects: JSON.parse(JSON.stringify(projects)),
		labels: JSON.parse(JSON.stringify(labels))
	};
};

export const actions: Actions = {
	create_project: async ({ request, params, cookies }) =>
		await create_project(cookies, request, params),
	delete_project: async (event) => await delete_project(event)
};
