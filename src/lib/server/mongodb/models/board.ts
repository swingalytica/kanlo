import mongoose from 'mongoose';

const column_schema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		order: { type: Number, required: true }
	},
	{ _id: true }
);

const board_schema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
		columns: { type: [column_schema], default: [] }
	},
	{ timestamps: true }
);

export const board_model = mongoose.model('Board', board_schema);
