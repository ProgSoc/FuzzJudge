export interface UserMapper {
	id: number;
	teamId?: number;
	role: "admin" | "competitor";
	logn: string;
}
