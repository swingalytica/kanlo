import { user_model } from './models';
import { email_regex } from './utils';

export async function register_user(email: string, password: string): Promise<{ error: string }> {
	const email_error = verify_email(email);
	const password_error = verify_password(password);

	if (email_error) {
		return { error: email_error };
	}

	if (password_error) {
		return { error: password_error };
	}

	const user = new user_model({ email, password });

	try {
		await user.save();
		return { error: '' };
	} catch (error: { code: number } | any) {
		if (error.code === 11_000) {
			return { error: 'Diese E-Mail-Adresse ist bereits registriert' };
		}
		return { error: 'Fehler beim Registrieren des Benutzers' };
	}
}

export function verify_email(email: string): string {
	if (!email) {
		return 'Email ist erforderlich';
	}

	if (!email.match(email_regex)) {
		return 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
	}

	// TODO: Check if email is already registered in the database

	return '';
}

export function verify_password(password: string): string {
	if (!password) {
		return 'Passwort ist erforderlich';
	}

	if (password.length < 8) {
		return 'Passwort muss mindestens 8 Zeichen lang sein';
	}

	return '';
}
