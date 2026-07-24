import mongoose from 'mongoose';

const user_schema = new mongoose.Schema({
	email: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	avatar: { type: String },
	password: { type: String, required: true, select: false }
});

export const user_model = mongoose.model('User', user_schema);
