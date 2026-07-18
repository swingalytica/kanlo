import { authenticate } from '$lib/server/authenticate';
import { cookie_options } from '$lib/server/utils';
import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const is_protected = event.url.pathname.startsWith('/app');
	const auth = authenticate(event.cookies);

	if (is_protected && !auth) {
		event.cookies.delete('email', cookie_options);
		throw redirect(307, '/');
	}

	return await resolve(event);
};
