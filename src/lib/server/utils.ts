export const email_regex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

const one_week = 60 * 60 * 24 * 7;

export const cookie_options = {
	httpOnly: true,
	secure: true,
	sameSite: 'strict',
	path: '/',
	maxAge: one_week
} as const;
