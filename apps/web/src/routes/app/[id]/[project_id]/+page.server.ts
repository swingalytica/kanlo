import { authenticate } from '$lib/server/authenticate';
import { activity_model, ActivityType } from '$lib/server/mongodb/models/activity';
import { board_model } from '$lib/server/mongodb/models/board';
import { card_model } from '$lib/server/mongodb/models/card';
import { label_model } from '$lib/server/mongodb/models/label';
import { membership_model } from '$lib/server/mongodb/models/membership';
import { organization_model } from '$lib/server/mongodb/models/organization';
import { project_model } from '$lib/server/mongodb/models/project';
import { fail, type Actions } from '@sveltejs/kit';

export const load = async (event) => {
	const authenticated = authenticate(event.cookies);

	if (!authenticated) {
		throw new Error('User not authenticated');
	}

	const organization_id = event.params.id;

	const organization = await organization_model.findById(organization_id).lean();

	const members = await membership_model
		.find({ organization: organization_id })
		.populate('user', 'name email')
		.lean();

	const projects = await project_model.find({ organization: organization_id }).lean();
	const labels = await label_model.find({ organization: organization_id }).lean();

	const board = await board_model
		.findOne({
			project: event.params.project_id
		})
		.lean();

	const cards = await card_model
		.find({
			board: board?._id
		})
		.lean();

	const activities = await activity_model
		.find({
			card: { $in: cards.map((c) => c._id) }
		})
		.populate('user', 'name')
		.lean();

	return {
		organization: JSON.parse(JSON.stringify(organization)),
		projects: JSON.parse(JSON.stringify(projects)),
		labels: JSON.parse(JSON.stringify(labels)),
		board: JSON.parse(JSON.stringify(board)),
		cards: JSON.parse(JSON.stringify(cards)),
		activities: JSON.parse(JSON.stringify(activities)),
		members: JSON.parse(JSON.stringify(members))
	};
};

export const actions: Actions = {
	add_column: async (event) => {
		try {
			const authenticated = authenticate(event.cookies);

			if (!authenticated) {
				return { success: false, error: 'Not authenticated' };
			}

			const form_data = await event.request.formData();
			const board_id = form_data.get('board_id') as string;
			const name = (form_data.get('name') as string)?.trim();

			if (!board_id || !name) {
				return { success: false, error: 'board_id and name are required' };
			}

			const board = await board_model.findById(board_id);

			if (!board) {
				return { success: false, error: 'Board not found' };
			}

			const max_order = board.columns.reduce((max, col) => Math.max(max, col.order), -1);

			board.columns.push({ name, order: max_order + 1 });
			await board.save();

			return {
				success: true
			};
		} catch (error) {
			console.error(error);
			return { success: false, error: 'Something went wrong' };
		}
	},
	rename_column: async (event) => {
		try {
			const authenticated = authenticate(event.cookies);

			if (!authenticated) {
				return { success: false, error: 'Not authenticated' };
			}

			const form_data = await event.request.formData();
			const board_id = form_data.get('board_id') as string;
			const column_id = form_data.get('column_id') as string;
			const name = (form_data.get('name') as string)?.trim();

			if (!board_id || !column_id || !name) {
				return { success: false, error: 'board_id, column_id and name are required' };
			}

			const board = await board_model.findById(board_id);

			if (!board) {
				return { success: false, error: 'Board not found' };
			}

			const column = board.columns.id(column_id);

			if (!column) {
				return { success: false, error: 'Column not found' };
			}

			column.name = name;
			await board.save();

			return {
				success: true
			};
		} catch (error) {
			console.error(error);
			return { success: false, error: 'Something went wrong' };
		}
	},
	delete_column: async (event) => {
		try {
			const authenticated = authenticate(event.cookies);

			if (!authenticated) {
				return { success: false, error: 'Not authenticated' };
			}

			const form_data = await event.request.formData();
			const board_id = form_data.get('board_id') as string;
			const column_id = form_data.get('column_id') as string;

			if (!board_id || !column_id) {
				return { success: false, error: 'board_id and column_id are required' };
			}

			const board = await board_model.findById(board_id);

			if (!board) {
				return { success: false, error: 'Board not found' };
			}

			board.columns.pull(column_id);
			await board.save();

			const remaining_columns = [...board.columns].sort((a, b) => a.order - b.order);

			if (remaining_columns.length > 0) {
				const fallback_column_id = remaining_columns[0]._id;
				await card_model.updateMany(
					{ board: board_id, column: column_id },
					{ column: fallback_column_id }
				);
			} else {
				await card_model.deleteMany({ board: board_id, column: column_id });
				await activity_model.deleteMany({
					card: {
						$in: (
							await card_model.find({
								board: board_id,
								column: column_id
							})
						).map((c) => c._id)
					}
				});
			}

			return {
				success: true
			};
		} catch (error) {
			console.error(error);
			return { success: false, error: 'Something went wrong' };
		}
	},
	reorder_columns: async ({ request }) => {
		const data = await request.formData();

		const board_id = data.get('board_id');
		const order = data.get('order');

		if (typeof board_id !== 'string' || typeof order !== 'string') {
			return fail(400, {
				error: 'Invalid data'
			});
		}

		let reordered_columns;

		try {
			reordered_columns = JSON.parse(order);
		} catch {
			return fail(400, {
				error: 'Invalid JSON'
			});
		}

		if (!Array.isArray(reordered_columns)) {
			return fail(400, {
				error: 'Invalid order format'
			});
		}

		const board = await board_model.findById(board_id);

		if (!board) {
			return fail(404, {
				error: 'Board not found'
			});
		}

		const column_order_map = new Map(reordered_columns.map((column) => [column.id, column.order]));

		board.columns.forEach((column) => {
			const new_order = column_order_map.get(column._id.toString());

			if (typeof new_order === 'number') {
				column.order = new_order;
			}
		});

		board.columns.sort((a, b) => a.order - b.order);

		board.markModified('columns');

		await board.save();

		return {
			success: true
		};
	},
	add_card: async ({ request, cookies }) => {
		try {
			const authenticated = authenticate(cookies);

			if (!authenticated) {
				return fail(401, {
					error: 'Not authenticated'
				});
			}

			const user_id = authenticated.id;

			const data = await request.formData();

			const board_id = data.get('board_id');
			const column_id = data.get('column_id');
			const title = data.get('title');

			if (
				typeof board_id !== 'string' ||
				typeof column_id !== 'string' ||
				typeof title !== 'string'
			) {
				return fail(400, {
					error: 'Invalid data'
				});
			}

			const last_card = await card_model
				.findOne({
					column: column_id
				})
				.sort({
					order: -1
				});

			const card = await card_model.create({
				title,
				board: board_id,
				column: column_id,
				order: last_card ? last_card.order + 1 : 0
			});

			await activity_model.create({
				card: card._id,
				user: user_id,
				type: ActivityType.CREATED,
				data: {
					title: card.title
				}
			});

			return {
				success: true
			};
		} catch (error) {
			console.error(error);
			return fail(500, {
				error: 'Internal Server Error'
			});
		}
	},
	reorder_card: async ({ request, cookies }) => {
		try {
			const authenticated = authenticate(cookies);

			if (!authenticated) {
				return fail(401, {
					error: 'Not authenticated'
				});
			}

			const user_id = authenticated.id;

			const data = await request.formData();

			const card = JSON.parse(data.get('card') as string);

			const { card_id, column_id, order } = card;

			if (
				typeof card_id !== 'string' ||
				typeof column_id !== 'string' ||
				typeof order !== 'number'
			) {
				return fail(400);
			}

			const old_card = await card_model.findById(card_id).lean();

			await card_model.updateOne(
				{
					_id: card_id
				},
				{
					$set: {
						column: column_id,
						order: Number(order)
					}
				}
			);

			await activity_model.create({
				card: card_id,
				user: user_id,
				type: ActivityType.MOVED,
				data: {
					from_column: old_card?.column.toString(),
					to_column: column_id,
					from_order: old_card?.order,
					to_order: order
				}
			});

			return {
				success: true
			};
		} catch (error) {
			console.error(error);
			return fail(500, {
				error: 'Internal Server Error'
			});
		}
	},
	save_card: async ({ request }) => {
		try {
			const data = await request.formData();

			const card_id = data.get('card_id') as string;
			const title = data.get('title') as string;
			const description = data.get('description') as string;
			const due_date = data.get('due_date') as string;
			const labels = (data.get('labels') as string)?.split(',').filter(Boolean) || [];

			if (!card_id || !title) {
				return fail(400, {
					error: 'Card ID and title are required'
				});
			}

			const card = await card_model.findByIdAndUpdate(
				card_id,
				{
					title,
					description,
					due_date: due_date ? new Date(due_date) : null,
					labels
				},
				{ returnDocument: 'after' }
			);

			if (!card) {
				return fail(404, {
					error: 'Card not found'
				});
			}

			return {
				success: true
			};
		} catch (error) {
			console.error(error);
			return fail(500, {
				error: 'Internal Server Error'
			});
		}
	},
	mark_card_completed: async ({ request, cookies }) => {
		try {
			const authenticated = authenticate(cookies);

			if (!authenticated) {
				return fail(401, {
					error: 'Not authenticated'
				});
			}

			const user_id = authenticated.id;

			const data = await request.formData();

			const card_id = data.get('card_id') as string;
			const completed = data.get('completed') === 'true';

			if (!card_id) {
				return fail(400, {
					error: 'Card ID is required'
				});
			}

			const card = await card_model.findByIdAndUpdate(
				card_id,
				{
					completed
				},
				{ returnDocument: 'after' }
			);

			if (!card) {
				return fail(404, {
					error: 'Card not found'
				});
			}

			await activity_model.create({
				card: card_id,
				user: user_id,
				type: ActivityType.COMPLETED,
				data: {
					completed
				}
			});

			return {
				success: true
			};
		} catch (error) {
			console.error(error);
			return fail(500, {
				error: 'Internal Server Error'
			});
		}
	},
	assign_card: async (event) => {
		try {
			const authenticated = authenticate(event.cookies);

			if (!authenticated) {
				return fail(401, { error: 'Not authenticated' });
			}

			const user_id = authenticated.id;

			const form_data = await event.request.formData();
			const card_id = form_data.get('card_id') as string;
			const assignee_id = form_data.get('assignee') as string;

			if (!card_id || !assignee_id) {
				return fail(400, { error: 'Card ID and assignee are required' });
			}

			const card = await card_model.findByIdAndUpdate(
				card_id,
				{ assignee: assignee_id },
				{ returnDocument: 'after' }
			);

			if (!card) {
				return fail(404, { error: 'Card not found' });
			}

			await activity_model.create({
				card: card_id,
				user: user_id,
				type: ActivityType.ASSIGNED,
				data: { assignee: assignee_id }
			});

			return { success: true };
		} catch (error) {
			console.error(error);
			return fail(500, { error: 'Internal Server Error' });
		}
	}
};
