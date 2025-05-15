PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`team` integer,
	`logn` text NOT NULL,
	`salt` blob NOT NULL,
	`hash` blob,
	`name` text,
	`role` text NOT NULL,
	FOREIGN KEY (`team`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_user`("id", "team", "logn", "salt", "hash", "name", "role") SELECT "id", "team", "logn", "salt", "hash", "name", "role" FROM `user`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
ALTER TABLE `__new_user` RENAME TO `user`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `user_logn_unique` ON `user` (`logn`);