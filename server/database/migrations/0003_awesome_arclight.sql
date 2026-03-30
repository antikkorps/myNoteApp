CREATE TABLE "attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"note_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"filename" text NOT NULL,
	"storage_key" text NOT NULL,
	"mime_type" varchar(255) NOT NULL,
	"size" integer NOT NULL,
	"type" varchar(10) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_note_id_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;