ALTER TABLE "visitors" DROP CONSTRAINT "visitors_poll_id_polls_id_fk";
--> statement-breakpoint
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_poll_id_polls_id_fk" FOREIGN KEY ("poll_id") REFERENCES "public"."polls"("id") ON DELETE cascade ON UPDATE no action;