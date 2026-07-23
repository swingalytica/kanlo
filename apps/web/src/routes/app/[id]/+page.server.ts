import { authenticate } from '$lib/server/authenticate';
import { activity_model } from '$lib/server/mongodb/models/activity';
import { board_model } from '$lib/server/mongodb/models/board';
import { card_model } from '$lib/server/mongodb/models/card';
import { label_model } from '$lib/server/mongodb/models/label';
import { membership_model } from '$lib/server/mongodb/models/membership';
import { organization_model } from '$lib/server/mongodb/models/organization';
import { project_model } from '$lib/server/mongodb/models/project';
import '$lib/server/mongodb/models/user';
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
	delete_project: async (event) => {
		try {
			const form_data = await event.request.formData();
			const project_id = form_data.get('id') as string;

			await project_model.findByIdAndDelete(project_id);
			await board_model.deleteMany({ project: project_id });
			await card_model.deleteMany({
				board: { $in: (await board_model.find({ project: project_id })).map((b) => b._id) }
			});
			await activity_model.deleteMany({
				card: {
					$in: (
						await card_model.find({
							board: { $in: (await board_model.find({ project: project_id })).map((b) => b._id) }
						})
					).map((c) => c._id)
				}
			});

			return { success: true };
		} catch (error) {
			console.log(error);
			return { success: false };
		}
	}
};
