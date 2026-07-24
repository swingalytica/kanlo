import type { OrganizationRole } from '$lib/shared/enum';
import { permissions } from '$lib/shared/permissions.const';
import { permission_override_model } from './mongodb/models/permission';

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
