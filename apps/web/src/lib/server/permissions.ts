import { OrganizationRole } from './mongodb/models/membership';
import { permission_override_model } from './mongodb/models/permission';

export const permissions = {
	create_project: [OrganizationRole.OWNER, OrganizationRole.ADMIN, OrganizationRole.MEMBER],
	manage_members: [OrganizationRole.OWNER, OrganizationRole.ADMIN],
	manage_labels: [OrganizationRole.OWNER, OrganizationRole.ADMIN],
	manage_invites: [OrganizationRole.OWNER, OrganizationRole.ADMIN]
} as const;

export async function has_permission(
	membership: { _id: string; role: OrganizationRole },
	permission: keyof typeof permissions
): Promise<boolean> {
	const override = await permission_override_model
		.findOne({ membership: membership._id, permission })
		.lean();

	if (override) {
		return override.value;
	}

	return (permissions[permission] as readonly OrganizationRole[]).includes(membership.role);
}
