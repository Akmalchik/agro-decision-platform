ALTER TABLE "plots"
ADD COLUMN "tax_id" TEXT;

CREATE INDEX "plots_tax_id_idx" ON "plots"("tax_id");
