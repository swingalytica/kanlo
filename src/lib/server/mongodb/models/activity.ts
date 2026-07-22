import mongoose from 'mongoose';

const activity_schema = new mongoose.Schema(
	{
		card: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Card',
			required: true
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		type: {
			type: String,
			enum: [
				'CREATED',
				'UPDATED_TITLE',
				'UPDATED_DESCRIPTION',
				'UPDATED_DUE_DATE',
				'ADDED_LABEL',
				'REMOVED_LABEL',
				'COMPLETED',
				'ARCHIVED',
				'MOVED'
			],
			required: true
		},
		data: {
			type: mongoose.Schema.Types.Mixed
		},
		description: {
			type: String,
			required: true
		}
	},
	{
		timestamps: true
	}
);

activity_schema.index({
	card: 1,
	createdAt: -1
});

export const activity_model = mongoose.model('Activity', activity_schema);
