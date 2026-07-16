export type Dictionary = {
  metadata: { title: string; description: string };
  languageNames: Record<"uz-Latn" | "uz-Cyrl" | "ru", string>;
  navigation: { home: string; map: string; ariaLabel: string; language: string };
  home: {
    eyebrow: string;
    title: string;
    description: string;
    mapTitle: string;
    mapDescription: string;
    openMap: string;
  };
  map: {
    title: string;
    description: string;
    databaseDescription: string;
    selectedPlot: string;
    zoomIn: string;
    zoomOut: string;
  };
  plot: {
    title: string;
    identifier: string;
    cadastralNumber: string;
    farmName: string;
    area: string;
    bonitet: string;
    waterSupply: string;
    previousCrop: string;
    specialization: string;
  };
  buttons: { details: string; backToMap: string };
  loading: { map: string };
  empty: { title: string; description: string; notSpecified: string; notSpecifiedFeminine: string };
  databaseError: { mapTitle: string; plotTitle: string; mapDescription: string; plotDescription: string };
  notFound: { title: string; description: string; backHome: string };
  units: { hectare: string; points: string };
  plotStatuses: { active: string; inactive: string; archived: string };
};
