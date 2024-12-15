ALTER TABLE "conversations" ADD COLUMN "created_at" date DEFAULT now();--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "modified_at" date DEFAULT now();