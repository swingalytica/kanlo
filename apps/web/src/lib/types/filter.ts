export type Filter = {
	assignee?: string;
	show_completed?: boolean;
	labels?: string[];
	due_date: 'overdue' | 'today' | 'week' | 'no_due_date' | null;
};
