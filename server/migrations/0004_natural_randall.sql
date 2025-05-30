ALTER TABLE `user` ADD `password` text;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `salt`;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `hash`;