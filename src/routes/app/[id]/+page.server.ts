import { authenticate } from '$lib/server/authenticate';
import { board_model } from '$lib/server/mongodb/models/board';
import { card_model } from '$lib/server/mongodb/models/card';
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

			await board_model.create({
				name: 'Main Board',
				project: project._id,
				columns: [
					{ name: 'To Do', order: 0 },
					{ name: 'In Progress', order: 1 },
					{ name: 'Done', order: 2 }
				]
			});

			return { success: true, project: JSON.parse(JSON.stringify(project)) };
		} catch (error) {
			console.error(error);
			return { error: 'Failed to create project' };
		}
	},
	get_project: async (event) => {
		try {
			const form_data = await event.request.formData();
			const project_id = form_data.get('id') as string;

			const board = await board_model.findOne({ project: project_id }).lean();
			const cards = await card_model.find({ board: board?._id }).lean();

			return {
				success: true,
				board: JSON.parse(JSON.stringify(board)),
				cards: JSON.parse(JSON.stringify(cards))
			};
		} catch (error) {
			console.log(error);
			return { success: false };
		}
	},
	delete_project: async (event) => {
		try {
			const form_data = await event.request.formData();
			const project_id = form_data.get('id') as string;

			await project_model.findByIdAndDelete(project_id);
			await board_model.deleteMany({ project: project_id });
			await card_model.deleteMany({
				board: { $in: (await board_model.find({ project: project_id })).map((b) => b._id) }
			});

			return { success: true };
		} catch (error) {
			console.log(error);
			return { success: false };
		}
	}
};
