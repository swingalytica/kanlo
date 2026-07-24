import { env } from '$env/dynamic/private';
import type { Cookies } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';

export function authenticate(cookies: Cookies): App.Auth | undefined {
	const token = cookies.get('auth-token');

	if (!token) return undefined;

	try {
		const auth = jwt.verify(token, env.SECRET_JWT_KEY);

		if (!auth) throw '';

		return auth as App.Auth;
	} catch (error) {
		return undefined;
	}
}
