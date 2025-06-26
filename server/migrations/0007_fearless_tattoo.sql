DROP TABLE `comp`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_session`("id", "user_id", "expires_at") SELECT "id", "user_id", "expires_at" FROM `session`;--> statement-breakpoint
DROP TABLE `session`;--> statement-breakpoint
ALTER TABLE `__new_session` RENAME TO `session`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_subm` (
	`id` text PRIMARY KEY NOT NULL,
	`team` text NOT NULL,
	`prob` text NOT NULL,
	`time` text NOT NULL,
	`out` text,
	`code` text,
	`ok` integer,
	`vler` text,
	`vlms` real,
	FOREIGN KEY (`team`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_subm`("id", "team", "prob", "time", "out", "code", "ok", "vler", "vlms") SELECT "id", "team", "prob", "time", "out", "code", "ok", "vler", "vlms" FROM `subm`;--> statement-breakpoint
DROP TABLE `subm`;--> statement-breakpoint
ALTER TABLE `__new_subm` RENAME TO `subm`;--> statement-breakpoint
CREATE TABLE `__new_team` (
	`id` text PRIMARY KEY NOT NULL,
	`seed` text NOT NULL,
	`name` text NOT NULL,
	`hidden` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_team`("id", "seed", "name", "hidden") SELECT "id", "seed", "name", "hidden" FROM `team`;--> statement-breakpoint
DROP TABLE `team`;--> statement-breakpoint
ALTER TABLE `__new_team` RENAME TO `team`;--> statement-breakpoint
CREATE TABLE `__new_user` (
	`id` text PRIMARY KEY NOT NULL,
	`team` text,
	`logn` text NOT NULL,
	`password` text NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`role` text NOT NULL,
	FOREIGN KEY (`team`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_user`("id", "team", "logn", "password", "name", "role") SELECT "id", "team", "logn", "password", "name", "role" FROM `user`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
ALTER TABLE `__new_user` RENAME TO `user`;--> statement-breakpoint
CREATE UNIQUE INDEX `user_logn_unique` ON `user` (`logn`);