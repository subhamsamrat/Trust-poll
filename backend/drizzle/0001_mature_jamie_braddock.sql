CREATE TABLE "visitors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"poll_id" uuid NOT NULL,
	"visitor_id" varchar NOT NULL
);
--> statement-breakpoint
ALTER TABLE "polls" ALTER COLUMN "is_active" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "polls" ALTER COLUMN "responseMode" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "polls" ALTER COLUMN "is_published" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "polls" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "answerTable" ADD COLUMN "answer" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_poll_id_polls_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE no action ON UPDATE no action;