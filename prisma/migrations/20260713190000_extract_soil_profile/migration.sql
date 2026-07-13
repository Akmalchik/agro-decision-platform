CREATE TABLE "soil_profiles" (
    "id" UUID NOT NULL,
    "plot_id" UUID NOT NULL,
    "bonitet" DECIMAL(5,2),
    CONSTRAINT "soil_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "soil_profiles_plot_id_key" ON "soil_profiles"("plot_id");

ALTER TABLE "soil_profiles"
    ADD CONSTRAINT "soil_profiles_plot_id_fkey"
    FOREIGN KEY ("plot_id") REFERENCES "plots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "soil_profiles" ("id", "plot_id", "bonitet")
SELECT gen_random_uuid(), "id", "bonitet"
FROM "plots"
WHERE "bonitet" IS NOT NULL;

ALTER TABLE "plots" DROP COLUMN "bonitet";
