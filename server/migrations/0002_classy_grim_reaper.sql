PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_subm` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`team` integer NOT NULL,
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
PRAGMA foreign_keys=ON;