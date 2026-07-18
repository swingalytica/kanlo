import { login_user } from '$lib/server/login';
import { cookie_options } from '$lib/server/utils';
import { fail, redirect, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = (data.get('email') as string)?.toLowerCase()?.trim();
		const password = data.get('password') as string;

		const user_data = await login_user(email, password);

		if ('error' in user_data) {
			return fail(400, { email, error: user_data.error });
		}

		const { token, user } = user_data;

		cookies.set('auth-token', token, cookie_options);
		cookies.set('email', email, cookie_options);

		throw redirect(303, '/app');
	}
};
