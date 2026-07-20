CREATE TABLE "farms" (
  "id" UUID NOT NULL,
  "tax_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "farms_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "farms_tax_id_key" ON "farms"("tax_id");

INSERT INTO "farms" ("id", "tax_id", "name")
SELECT gen_random_uuid(), "tax_id", MAX("farm_name")
FROM "plots"
WHERE "tax_id" IS NOT NULL
GROUP BY "tax_id"
ON CONFLICT ("tax_id") DO NOTHING;

ALTER TABLE "plots"
  ADD COLUMN "farm_id" UUID,
  ALTER COLUMN "geometry" DROP NOT NULL;

UPDATE "plots" plot
SET "farm_id" = farm."id"
FROM "farms" farm
WHERE plot."tax_id" = farm."tax_id";

CREATE INDEX "plots_farm_id_idx" ON "plots"("farm_id");

ALTER TABLE "plots"
  ADD CONSTRAINT "plots_farm_id_fkey"
  FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
