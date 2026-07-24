import { register_user } from '$lib/server/register';
import { fail, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	register: async ({ request }) => {
		const data = await request.formData();
		const email = (data.get('email') as string)?.toLowerCase()?.trim();
		const name = (data.get('name') as string)?.trim();
		const password = (data.get('password') as string)?.trim();

		const user = { email, name };

		const { error } = await register_user(email, name, password);

		if (error) {
			return fail(400, { error });
		} else {
			const success_message = 'Successfully registered! You can now log in.';
			return { success_message, user };
		}
	}
};
