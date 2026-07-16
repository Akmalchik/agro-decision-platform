import { MapShell } from "@/components/map/map-shell";
import { DataState } from "@/components/ui/data-state";
import { PageHeader } from "@/components/ui/page-header";
import { plotMapService } from "@/services/composition-root";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  let dataset;

  try {
    dataset = await plotMapService.getDataset();
  } catch (error) {
    console.warn("Unable to load plots from PostGIS.", error);

    return (
      <div className="space-y-6">
        <PageHeader title="Карта сельскохозяйственных участков" description="Данные загружаются из PostgreSQL/PostGIS." />
        <DataState
          title="Карта временно недоступна"
          description="Не удалось подключиться к базе данных. Проверьте, что PostgreSQL/PostGIS запущен, и повторите попытку."
        />
      </div>
    );
  }

  if (!dataset.viewport || dataset.featureCollection.features.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Карта сельскохозяйственных участков" description="Данные загружаются из PostgreSQL/PostGIS." />
        <DataState title="Участки пока не добавлены" description="В базе данных нет земельных участков для отображения." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Карта сельскохозяйственных участков" description="Данные PostgreSQL/PostGIS в системе координат EPSG:4326." />
      <MapShell dataset={dataset} />
    </div>
  );
}
