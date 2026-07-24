import { cookie_options } from '$lib/server/utils';
import { redirect } from '@sveltejs/kit';

export const POST = async ({ cookies }) => {
	cookies.delete('auth-token', cookie_options);
	cookies.delete('email', cookie_options);

	throw redirect(303, '/');
};
