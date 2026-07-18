import { connectToDatabase } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const connection = await connectToDatabase();

	if (!connection) {
		throw error(500, 'Failed to connect to the database');
	}
};
