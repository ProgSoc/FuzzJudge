export interface SubmissionMapper {
	id: number;
	teamId: number;
	problemSlug: string;
	time: Date | string;
	out?: string;
	code?: string;
	ok?: boolean;
	vler?: string;
	vlms?: number;
}
