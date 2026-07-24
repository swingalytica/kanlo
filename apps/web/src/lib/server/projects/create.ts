import type { Cookies } from '@sveltejs/kit';
import { authenticate } from '../authenticate';
import { board_model, membership_model, project_model } from '../mongodb/models';

export async function create_project(
	cookies: Cookies,
	request: { formData: () => any },
	params: any
): Promise<
	| { error: string; success?: undefined; project?: undefined }
	| { success: boolean; project: any; error?: undefined }
> {
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
}
