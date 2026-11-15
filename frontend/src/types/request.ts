export interface Request {
	id: number;
	created_at: number;
	updated_at: number;
	title: string;
	url: string;
	comment: string;
	status: 'Awaiting' | 'Approved' | 'Declined' | 'Bought';
	user_id: number;
	username: string;
}

export interface RequestFormData {
	title: string;
	url: string;
	comment: string;
	status?: 'Awaiting' | 'Approved' | 'Declined' | 'Bought';
}

export interface RequestStatusUpdate {
	status: 'Awaiting' | 'Approved' | 'Declined' | 'Bought';
}
