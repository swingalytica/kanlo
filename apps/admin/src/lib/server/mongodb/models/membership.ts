import mongoose from 'mongoose';

export enum OrganizationRole {
	OWNER = 'OWNER',
	ADMIN = 'ADMIN',
	MEMBER = 'MEMBER'
}

const membership_schema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
		role: {
			type: String,
			enum: Object.values(OrganizationRole),
			default: OrganizationRole.MEMBER,
			required: true
		}
	},
	{ timestamps: true }
);

// Ein User kann pro Organisation nur eine Mitgliedschaft haben
membership_schema.index({ user: 1, organization: 1 }, { unique: true });

export const membership_model = mongoose.model('Membership', membership_schema);
