export interface InventoryFilterCriteria {
  modelSlug?: string;
  status?: string;
  exteriorColor?: string;
}

export function filterInventoryItems<T extends {
  id?: string;
  modelSlug?: string;
  status?: string;
  exteriorColor?: string;
  color?: string;
  trim?: { model?: { slug?: string } };
}>(
  items: T[],
  filters: InventoryFilterCriteria
): T[] {
  return items.filter((item) => {
    // Model match
    if (filters.modelSlug && filters.modelSlug !== 'all') {
      const itemModelSlug = item.modelSlug || item.trim?.model?.slug;
      if (itemModelSlug !== filters.modelSlug) {
        return false;
      }
    }

    // Status match
    if (filters.status && filters.status !== 'all') {
      if (item.status !== filters.status) {
        return false;
      }
    }

    // Color match
    if (filters.exteriorColor && filters.exteriorColor !== 'all') {
      const itemColor = item.exteriorColor || item.color;
      if (itemColor && itemColor.toLowerCase() !== filters.exteriorColor.toLowerCase()) {
        return false;
      }
    }

    return true;
  });
}
