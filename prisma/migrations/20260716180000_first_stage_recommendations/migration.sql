ALTER TABLE "recommendations" RENAME TO "legacy_recommendations";

ALTER TABLE "crops"
ADD COLUMN "code" TEXT,
ADD COLUMN "name_uz_latn" TEXT,
ADD COLUMN "name_uz_cyrl" TEXT,
ADD COLUMN "name_ru" TEXT,
ADD COLUMN "min_bonitet" INTEGER,
ADD COLUMN "optimal_bonitet_min" INTEGER,
ADD COLUMN "optimal_bonitet_max" INTEGER,
ADD COLUMN "water_need" TEXT,
ADD COLUMN "description_uz_latn" TEXT,
ADD COLUMN "description_uz_cyrl" TEXT,
ADD COLUMN "description_ru" TEXT,
ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

UPDATE "crops" SET
  "code" = 'LEGACY_' || "id"::text,
  "name_uz_latn" = "name",
  "name_uz_cyrl" = "name",
  "name_ru" = "name",
  "min_bonitet" = 0,
  "optimal_bonitet_min" = 0,
  "optimal_bonitet_max" = 100,
  "water_need" = 'LOW',
  "description_uz_latn" = "name",
  "description_uz_cyrl" = "name",
  "description_ru" = "name"
WHERE "code" IS NULL;

ALTER TABLE "crops"
ALTER COLUMN "code" SET NOT NULL,
ALTER COLUMN "name_uz_latn" SET NOT NULL,
ALTER COLUMN "name_uz_cyrl" SET NOT NULL,
ALTER COLUMN "name_ru" SET NOT NULL,
ALTER COLUMN "min_bonitet" SET NOT NULL,
ALTER COLUMN "optimal_bonitet_min" SET NOT NULL,
ALTER COLUMN "optimal_bonitet_max" SET NOT NULL,
ALTER COLUMN "water_need" SET NOT NULL,
ALTER COLUMN "description_uz_latn" SET NOT NULL,
ALTER COLUMN "description_uz_cyrl" SET NOT NULL,
ALTER COLUMN "description_ru" SET NOT NULL;

CREATE UNIQUE INDEX "crops_code_key" ON "crops"("code");

INSERT INTO "crops" (
  "id", "code", "name", "name_uz_latn", "name_uz_cyrl", "name_ru", "category",
  "min_bonitet", "optimal_bonitet_min", "optimal_bonitet_max", "water_need",
  "description_uz_latn", "description_uz_cyrl", "description_ru", "active"
) VALUES
  (gen_random_uuid(), 'KARAM', 'KARAM', 'Karam', 'Карам', 'Капуста', 'VEGETABLE', 45, 60, 85, 'HIGH', 'Salqin mavsum sabzavoti.', 'Салқин мавсум сабзавоти.', 'Овощная культура прохладного сезона.', true),
  (gen_random_uuid(), 'MOSH', 'MOSH', 'Mosh', 'Мош', 'Маш', 'LEGUME', 35, 50, 75, 'LOW', 'Tuproqni azot bilan boyituvchi dukkakli ekin.', 'Тупроқни азот билан бойитувчи дуккакли экин.', 'Бобовая культура, обогащающая почву азотом.', true),
  (gen_random_uuid(), 'PIYOZ', 'PIYOZ', 'Piyoz', 'Пиёз', 'Лук', 'VEGETABLE', 45, 55, 80, 'MEDIUM', 'Sug‘orishga sezgir sabzavot ekini.', 'Суғоришга сезгир сабзавот экини.', 'Овощная культура, чувствительная к режиму полива.', true),
  (gen_random_uuid(), 'KARTOSHKA', 'KARTOSHKA', 'Kartoshka', 'Картошка', 'Картофель', 'VEGETABLE', 50, 60, 85, 'HIGH', 'Unumdor tuproq talab qiluvchi tuganakli ekin.', 'Унумдор тупроқ талаб қилувчи туганакли экин.', 'Клубневая культура, требовательная к плодородию.', true),
  (gen_random_uuid(), 'POMIDOR', 'POMIDOR', 'Pomidor', 'Помидор', 'Томат', 'VEGETABLE', 50, 60, 85, 'HIGH', 'Barqaror suv ta’minotini talab qiluvchi ekin.', 'Барқарор сув таъминотини талаб қилувчи экин.', 'Культура, требующая стабильного водоснабжения.', true),
  (gen_random_uuid(), 'SABZI', 'SABZI', 'Sabzi', 'Сабзи', 'Морковь', 'VEGETABLE', 40, 55, 80, 'MEDIUM', 'Yengil va unumdor tuproqqa mos ildizmeva.', 'Енгил ва унумдор тупроққа мос илдизмева.', 'Корнеплод для лёгких плодородных почв.', true),
  (gen_random_uuid(), 'MAKKAJOXORI', 'MAKKAJOXORI', 'Makkajo‘xori', 'Маккажўхори', 'Кукуруза', 'GRAIN', 45, 55, 85, 'HIGH', 'Suv va oziqa talab qiluvchi don ekini.', 'Сув ва озиқа талаб қилувчи дон экини.', 'Зерновая культура с высокой потребностью в воде и питании.', true),
  (gen_random_uuid(), 'LOVIYA', 'LOVIYA', 'Loviya', 'Ловия', 'Фасоль', 'LEGUME', 40, 50, 75, 'MEDIUM', 'Sideral ta’sirga ega dukkakli ekin.', 'Сидерал таъсирга эга дуккакли экин.', 'Бобовая культура с положительным влиянием на почву.', true)
ON CONFLICT ("name") DO NOTHING;

CREATE TABLE "crop_rotation_rules" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "previous_crop_code" TEXT NOT NULL,
  "next_crop_code" TEXT NOT NULL,
  "compatibility_score" INTEGER NOT NULL,
  "status" TEXT NOT NULL,
  "explanation_key" TEXT NOT NULL,
  CONSTRAINT "crop_rotation_rules_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "crop_rotation_rules_score_check" CHECK ("compatibility_score" BETWEEN 0 AND 100)
);

CREATE UNIQUE INDEX "crop_rotation_rules_previous_next_key"
ON "crop_rotation_rules"("previous_crop_code", "next_crop_code");

INSERT INTO "crop_rotation_rules" ("previous_crop_code", "next_crop_code", "compatibility_score", "status", "explanation_key") VALUES
  ('BUGDOY', 'MOSH', 95, 'RECOMMENDED', 'rotation.afterGrainLegume'),
  ('BUGDOY', 'KARAM', 90, 'RECOMMENDED', 'rotation.afterGrainVegetable'),
  ('BUGDOY', 'PIYOZ', 75, 'ACCEPTABLE', 'rotation.afterGrainAcceptable'),
  ('BUGDOY', 'LOVIYA', 92, 'RECOMMENDED', 'rotation.afterGrainLegume'),
  ('PAXTA', 'MOSH', 90, 'RECOMMENDED', 'rotation.afterCottonLegume'),
  ('PAXTA', 'LOVIYA', 88, 'RECOMMENDED', 'rotation.afterCottonLegume'),
  ('PAXTA', 'MAKKAJOXORI', 55, 'NEUTRAL', 'rotation.afterCottonNeutral'),
  ('MAKKAJOXORI', 'MOSH', 90, 'RECOMMENDED', 'rotation.afterCornLegume'),
  ('MAKKAJOXORI', 'LOVIYA', 88, 'RECOMMENDED', 'rotation.afterCornLegume'),
  ('MAKKAJOXORI', 'MAKKAJOXORI', 20, 'UNDESIRABLE', 'rotation.repeatedCrop'),
  ('SHOLI', 'MOSH', 70, 'ACCEPTABLE', 'rotation.afterRiceLegume'),
  ('SHOLI', 'SABZI', 45, 'NEUTRAL', 'rotation.afterRiceNeutral'),
  ('SABZAVOT', 'MOSH', 90, 'RECOMMENDED', 'rotation.afterVegetableLegume'),
  ('SABZAVOT', 'LOVIYA', 88, 'RECOMMENDED', 'rotation.afterVegetableLegume'),
  ('SABZAVOT', 'KARAM', 25, 'UNDESIRABLE', 'rotation.repeatedVegetable'),
  ('DUKKAKLI', 'KARAM', 92, 'RECOMMENDED', 'rotation.afterLegumeVegetable'),
  ('DUKKAKLI', 'KARTOSHKA', 90, 'RECOMMENDED', 'rotation.afterLegumeVegetable'),
  ('DUKKAKLI', 'POMIDOR', 88, 'RECOMMENDED', 'rotation.afterLegumeVegetable'),
  ('BOSH', 'KARAM', 65, 'ACCEPTABLE', 'rotation.afterFallow'),
  ('BOSH', 'MOSH', 70, 'ACCEPTABLE', 'rotation.afterFallow'),
  ('BOSH', 'MAKKAJOXORI', 65, 'ACCEPTABLE', 'rotation.afterFallow');

CREATE TABLE "recommendations" (
  "id" UUID NOT NULL,
  "plot_id" UUID NOT NULL,
  "stage" TEXT NOT NULL,
  "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "algorithm_version" TEXT NOT NULL,
  "input_bonitet" DECIMAL(5,2) NOT NULL,
  "input_water_supply" TEXT NOT NULL,
  "input_previous_crop" TEXT NOT NULL,
  CONSTRAINT "recommendations_v2_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "recommendations_v2_plot_fkey" FOREIGN KEY ("plot_id") REFERENCES "plots"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "recommendations_v2_plot_stage_calculated_idx"
ON "recommendations"("plot_id", "stage", "calculated_at");

CREATE TABLE "recommendation_items" (
  "id" UUID NOT NULL,
  "recommendation_id" UUID NOT NULL,
  "crop_id" UUID NOT NULL,
  "rank" INTEGER NOT NULL,
  "final_score" INTEGER NOT NULL,
  "bonitet_score" INTEGER NOT NULL,
  "water_score" INTEGER NOT NULL,
  "rotation_score" INTEGER NOT NULL,
  "status" TEXT NOT NULL,
  "reason_keys" JSONB NOT NULL,
  "warning_keys" JSONB NOT NULL,
  CONSTRAINT "recommendation_items_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "recommendation_items_recommendation_fkey" FOREIGN KEY ("recommendation_id") REFERENCES "recommendations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "recommendation_items_crop_fkey" FOREIGN KEY ("crop_id") REFERENCES "crops"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "recommendation_items_scores_check" CHECK (
    "final_score" BETWEEN 0 AND 100 AND "bonitet_score" BETWEEN 0 AND 100
    AND "water_score" BETWEEN 0 AND 100 AND "rotation_score" BETWEEN 0 AND 100
  )
);

CREATE UNIQUE INDEX "recommendation_items_recommendation_crop_key" ON "recommendation_items"("recommendation_id", "crop_id");
CREATE UNIQUE INDEX "recommendation_items_recommendation_rank_key" ON "recommendation_items"("recommendation_id", "rank");
CREATE INDEX "recommendation_items_crop_idx" ON "recommendation_items"("crop_id");
