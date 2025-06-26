export interface SubmissionMapper {
	id: string;
	teamId: string;
	problemSlug: string;
	time: Date | string;
	out?: string;
	code?: string;
	ok?: boolean;
	vler?: string;
	vlms?: number;
}
