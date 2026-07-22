import mongoose from 'mongoose';

const organization_schema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		icon: { type: String, required: false }
	},
	{ timestamps: true }
);

export const organization_model = mongoose.model('Organization', organization_schema);
