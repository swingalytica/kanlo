import { label_model } from '$lib/server/mongodb/models/label';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const organization_id = params.id;

	const labels = await label_model
		.find({
			organization: organization_id
		})
		.sort({
			name: 1
		})
		.lean();

	return {
		labels: JSON.parse(JSON.stringify(labels))
	};
};

export const actions: Actions = {
	create_label: async ({ request, params }) => {
		const data = await request.formData();

		const name = data.get('name');
		const color = data.get('color');

		if (typeof name !== 'string' || typeof color !== 'string') {
			return fail(400);
		}

		await label_model.create({
			name,
			color,
			organization: params.id
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
