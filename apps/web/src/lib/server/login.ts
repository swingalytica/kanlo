import { env } from '$env/dynamic/private';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { user_model } from './mongodb/models/user';
import { email_regex } from './utils';

export async function login_user(email: string, password: string) {
	const user = await get_user(email, password);

	if ('error' in user) {
		return { error: user.error };
	}

	const token = jwt.sign({ id: user.id, email: user.email }, env.SECRET_JWT_KEY, {
		expiresIn: '7d'
	});

	return { token, user };
}

async function get_user(email: string, password: string): Promise<{ error: string } | App.User> {
	if (!email) {
		return { error: 'E-Mail ist erforderlich' };
	}

	if (!new RegExp(email_regex).exec(email)) {
		return { error: 'E-Mail ist ungültig' };
	}

	if (!password) {
		return { error: 'Passwort ist erforderlich' };
	}

	const user = await user_model.findOne({ email });

	if (!user) {
		return { error: 'E-Mail oder Passwort ist ungültig' };
	}

	const password_is_correct = await bcrypt.compare(password, user.password);

	if (!password_is_correct) {
		return { error: 'Passwort ist ungültig' };
	}

	const id = user._id.toString();

	return { id, email: user.email };
}
