import { OrganizationRole } from './enum';

const { OWNER, ADMIN, MEMBER } = OrganizationRole;

export const permissions = {
	// Projects
	create_project: [OWNER, ADMIN, MEMBER],
	update_project: [OWNER, ADMIN],
	delete_project: [OWNER, ADMIN],

	// Boards
	create_board: [OWNER, ADMIN],
	update_board: [OWNER, ADMIN],
	delete_board: [OWNER, ADMIN],

	// Columns
	create_column: [OWNER, ADMIN, MEMBER],
	update_column: [OWNER, ADMIN, MEMBER],
	delete_column: [OWNER, ADMIN, MEMBER],
	reorder_columns: [OWNER, ADMIN, MEMBER],

	// Cards
	create_card: [OWNER, ADMIN, MEMBER],
	update_card: [OWNER, ADMIN, MEMBER],
	delete_card: [OWNER, ADMIN, MEMBER],
	move_card: [OWNER, ADMIN, MEMBER],
	assign_card: [OWNER, ADMIN, MEMBER],
	complete_card: [OWNER, ADMIN, MEMBER],

	// Labels
	manage_labels: [OWNER, ADMIN],

	// Members
	manage_members: [OWNER, ADMIN],
	manage_invites: [OWNER, ADMIN],

	// Organization
	update_organization: [OWNER],
	delete_organization: [OWNER]
} as const;

export const permission_mapping = {
	// Projects
	create_project: 'Create Project',
	update_project: 'Update Project',
	delete_project: 'Delete Project',
	// Boards
	create_board: 'Create Board',
	update_board: 'Update Board',
	delete_board: 'Delete Board',
	// Columns
	create_column: 'Create Column',
	update_column: 'Update Column',
	delete_column: 'Delete Column',
	reorder_columns: 'Reorder Columns',
	// Cards
	create_card: 'Create Card',
	update_card: 'Update Card',
	delete_card: 'Delete Card',
	move_card: 'Move Card',
	assign_card: 'Assign Card',
	complete_card: 'Complete Card',
	// Labels
	manage_labels: 'Manage Labels',
	// Members
	manage_members: 'Manage Members',
	manage_invites: 'Manage Invites',
	// Organization
	update_organization: 'Update Organization',
	delete_organization: 'Delete Organization'
};

export type PermissionKey = keyof typeof permissions;
