CREATE TABLE IF NOT EXISTS "products" (
	"id" text PRIMARY KEY DEFAULT 'uuid_generate_v4()' NOT NULL,
	"name" text NOT NULL,
	"imageId" text NOT NULL,
	"price" double precision NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
