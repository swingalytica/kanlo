import type { RequestEvent } from '@sveltejs/kit';
import { activity_model, board_model, card_model, project_model } from '../mongodb/models';

export async function delete_project(event: RequestEvent): Promise<{ success: boolean }> {
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
