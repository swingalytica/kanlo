import { register_user } from '$lib/server/register';
import { fail, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	login: async ({ request }) => {
		const data = await request.formData();
		const email = (data.get('email') as string)?.toLowerCase()?.trim();
		const password = (data.get('password') as string)?.trim();

		const user = { email };

		const { error } = await register_user(email, password);

		if (error) {
			return fail(400, { error });
		} else {
			const success_message = 'Registrierung erfolgreich! Sie können sich jetzt anmelden.';
			return { success_message, user };
		}
	}
};
