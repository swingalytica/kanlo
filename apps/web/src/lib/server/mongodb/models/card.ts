import mongoose from 'mongoose';

const card_schema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true
		},
		description: {
			type: String,
			default: ''
		},
		board: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Board',
			required: true
		},
		column: {
			type: mongoose.Schema.Types.ObjectId,
			required: true
		},
		order: {
			type: Number,
			required: true
		},
		labels: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Label'
			}
		],
		due_date: {
			type: Date
		},
		completed: {
			type: Boolean,
			default: false
		},
		assignee: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		}
	},
	{
		timestamps: true
	}
);

card_schema.index({
	board: 1,
	column: 1,
	order: 1
});

export const card_model = mongoose.model('Card', card_schema);
