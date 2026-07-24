export function generateLogoFallback(name: string): string | null {
	if (name.trim() === '') {
		return null;
	}

	const initials = name
		.split(' ')
		.map((word) => word[0])
		.join('')
		.toUpperCase();
	return initials;
}
