import mongoose from 'mongoose';

const user_schema = new mongoose.Schema({
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true }
});

export const user_model = mongoose.model('User', user_schema);
