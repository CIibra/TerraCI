import { LandPlot, Home, Building2, Store, Building, Warehouse } from "lucide-react";

export const CATEGORY_ICONS = {
  terrain: LandPlot,
  maison: Home,
  appartement: Building2,
  commerce: Store,
  immeuble: Building,
  hangar: Warehouse,
};

export function CategoryIcon({ id, className }) {
  const Icon = CATEGORY_ICONS[id] || Building;
  return <Icon className={className} strokeWidth={1.5} />;
}
