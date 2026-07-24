import mongoose from 'mongoose';

const label_schema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true
		},
		color: {
			type: String,
			required: true
		},
		organization: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Organization',
			required: true
		}
	},
	{
		timestamps: true
	}
);

export const label_model = mongoose.model('Label', label_schema);
