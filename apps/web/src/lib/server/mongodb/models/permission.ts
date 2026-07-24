import mongoose from 'mongoose';

const permission_override_schema = new mongoose.Schema(
	{
		membership: { type: mongoose.Schema.Types.ObjectId, ref: 'Membership', required: true },
		permission: { type: String, required: true },
		value: { type: Boolean, required: true }
	},
	{ timestamps: true }
);

permission_override_schema.index({ membership: 1, permission: 1 }, { unique: true });

export const permission_override_model = mongoose.model(
	'PermissionOverride',
	permission_override_schema
);
