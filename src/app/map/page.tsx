import { MapShell } from "@/components/map/map-shell";
import { PageHeader } from "@/components/ui/page-header";
import { plotMapService } from "@/services/composition-root";

export default async function MapPage() {
  const dataset = await plotMapService.getDataset();

  return (
    <div className="space-y-6">
      <PageHeader title="Карта сельскохозяйственных участков" description="Тестовый участок в системе координат EPSG:4326." />
      <MapShell dataset={dataset} />
    </div>
  );
}
