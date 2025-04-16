CREATE TABLE `comp` (
	`key` text PRIMARY KEY NOT NULL,
	`val` text
);
--> statement-breakpoint
CREATE TABLE `subm` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`team` integer,
	`prob` text,
	`time` text,
	`out` blob,
	`code` blob,
	`ok` integer,
	`vler` blob,
	`vlms` real,
	FOREIGN KEY (`team`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `team` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`seed` text,
	`name` text
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`team` integer,
	`logn` text,
	`salt` blob,
	`hash` blob,
	`name` text,
	`role` text,
	FOREIGN KEY (`team`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_logn_unique` ON `user` (`logn`);