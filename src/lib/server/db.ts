import { SECRET_MONGODB_URI } from '$env/static/private';
import mongoose from 'mongoose';

export async function connectToDatabase() {
	try {
		return await mongoose.connect(SECRET_MONGODB_URI);
	} catch (error) {
		console.error('Error connecting to MongoDB:', error);
	}
}
