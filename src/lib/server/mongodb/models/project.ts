import mongoose from 'mongoose';

const project_schema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true }
	},
	{ timestamps: true }
);

export const project_model = mongoose.model('Project', project_schema);
