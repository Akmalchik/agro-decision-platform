CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE "plots" (
    "id" UUID NOT NULL,
    "cadastral_number" TEXT NOT NULL,
    "farm_name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "area" DECIMAL(12,2) NOT NULL,
    "bonitet" DECIMAL(5,2),
    "geometry" geometry(Geometry, 4326) NOT NULL,
    "specialization" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "plots_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crops" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    CONSTRAINT "crops_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "production_balances" (
    "id" UUID NOT NULL,
    "crop_id" UUID NOT NULL,
    "production" DECIMAL(14,2) NOT NULL,
    "consumption" DECIMAL(14,2) NOT NULL,
    "self_supply" DECIMAL(7,2) NOT NULL,
    "deficit" DECIMAL(14,2) NOT NULL,
    "surplus" DECIMAL(14,2) NOT NULL,
    CONSTRAINT "production_balances_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "recommendations" (
    "id" UUID NOT NULL,
    "plot_id" UUID NOT NULL,
    "crop_id" UUID NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "explanation" TEXT NOT NULL,
    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "plots_cadastral_number_key" ON "plots"("cadastral_number");
CREATE INDEX "plots_farm_name_idx" ON "plots"("farm_name");
CREATE INDEX "plots_geometry_idx" ON "plots" USING GIST ("geometry");
CREATE UNIQUE INDEX "crops_name_key" ON "crops"("name");
CREATE INDEX "crops_category_idx" ON "crops"("category");
CREATE INDEX "production_balances_crop_id_idx" ON "production_balances"("crop_id");
CREATE UNIQUE INDEX "recommendations_plot_id_crop_id_key" ON "recommendations"("plot_id", "crop_id");
CREATE INDEX "recommendations_crop_id_idx" ON "recommendations"("crop_id");

ALTER TABLE "production_balances"
    ADD CONSTRAINT "production_balances_crop_id_fkey"
    FOREIGN KEY ("crop_id") REFERENCES "crops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "recommendations"
    ADD CONSTRAINT "recommendations_plot_id_fkey"
    FOREIGN KEY ("plot_id") REFERENCES "plots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "recommendations"
    ADD CONSTRAINT "recommendations_crop_id_fkey"
    FOREIGN KEY ("crop_id") REFERENCES "crops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
