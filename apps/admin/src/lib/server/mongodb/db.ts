import { env } from '$env/dynamic/private';
import mongoose from 'mongoose';

export async function connectToDatabase() {
	try {
		return await mongoose.connect(env.SECRET_MONGODB_URI);
	} catch (error) {
		console.error('Error connecting to MongoDB:', error);
	}
}
