export type NeighborBalance = { district: string; crop: string; production: number; demand: number; source: string };
export type TradeFlow = { from: string; to: string; crop: string; tons: number; confirmed: boolean };
export type RoadRoute = { from: string; to: string; kilometers: number; minutes: number; source: string };
export function proposeTransfers(origin: string, surplus: Array<{ crop: string; surplus: number | null }>, neighbors: NeighborBalance[], routes: RoadRoute[], flows: TradeFlow[]) {
  const result = [];
  for (const row of surplus) {
    if (row.surplus === null || row.surplus <= 0) continue;
    const committed = flows.filter((flow) => flow.confirmed && flow.from === origin && flow.crop === row.crop).reduce((sum, flow) => sum + flow.tons, 0);
    let available = Math.max(0, row.surplus - committed);
    const candidates = neighbors.filter((item) => item.district !== origin && item.crop === row.crop).map((neighbor) => {
      const incoming = flows.filter((flow) => flow.confirmed && flow.to === neighbor.district && flow.crop === row.crop).reduce((sum, flow) => sum + flow.tons, 0);
      const deficit = Math.max(0, neighbor.demand - neighbor.production - incoming);
      const route = routes.find((item) => item.from === origin && item.to === neighbor.district && Number.isFinite(item.kilometers) && item.kilometers > 0);
      return { neighbor, route, deficit, incoming };
    }).filter((item) => item.deficit > 0).sort((a, b) => (a.route?.kilometers ?? Infinity) - (b.route?.kilometers ?? Infinity));
    for (const { neighbor, route, deficit, incoming } of candidates) {
      const potentialTons = Math.min(available, deficit);
      const proposedTons = route ? potentialTons : null;
      if (proposedTons !== null) available -= proposedTons;
      result.push({ crop: row.crop, destination: neighbor.district, destinationProduction: neighbor.production, destinationDemand: neighbor.demand,
        confirmedIncoming: incoming, originCommitted: committed, potentialTons, proposedTons,
        roadDistanceKm: route?.kilometers ?? null, travelMinutes: route?.minutes ?? null,
        sources: [neighbor.source, ...(route ? [route.source] : [])], requiresHumanReview: true });
    }
  }
  return result;
}
