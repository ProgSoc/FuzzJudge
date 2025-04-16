PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_subm` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`team` integer NOT NULL,
	`prob` text NOT NULL,
	`time` text NOT NULL,
	`out` blob NOT NULL,
	`code` blob,
	`ok` integer,
	`vler` blob,
	`vlms` real,
	FOREIGN KEY (`team`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_subm`("id", "team", "prob", "time", "out", "code", "ok", "vler", "vlms") SELECT "id", "team", "prob", "time", "out", "code", "ok", "vler", "vlms" FROM `subm`;--> statement-breakpoint
DROP TABLE `subm`;--> statement-breakpoint
ALTER TABLE `__new_subm` RENAME TO `subm`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_team` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`seed` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_team`("id", "seed", "name") SELECT "id", "seed", "name" FROM `team`;--> statement-breakpoint
DROP TABLE `team`;--> statement-breakpoint
ALTER TABLE `__new_team` RENAME TO `team`;--> statement-breakpoint
CREATE TABLE `__new_user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`team` integer,
	`logn` text NOT NULL,
	`salt` blob NOT NULL,
	`hash` blob,
	`name` text,
	`role` text,
	FOREIGN KEY (`team`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_user`("id", "team", "logn", "salt", "hash", "name", "role") SELECT "id", "team", "logn", "salt", "hash", "name", "role" FROM `user`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
ALTER TABLE `__new_user` RENAME TO `user`;--> statement-breakpoint
CREATE UNIQUE INDEX `user_logn_unique` ON `user` (`logn`);