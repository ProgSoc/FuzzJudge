export interface UserMapper {
	id: number;
	teamId?: number;
	role: "ADMIN" | "COMPETITOR";
	logn: string;
}
