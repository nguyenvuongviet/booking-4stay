"use client";

import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useLocations } from "./hooks/useLocations";
import { LocationHeader } from "./_components/LocationHeader";
import { LocationFilters } from "./_components/LocationFilters";
import { LocationList } from "./_components/LocationList";
import { AddLocationModal } from "./_components/AddLocationModal";
import { BaseLocation } from "@/services/admin/locationsApi";
import { EditLocationModal } from "./_components/EditLocationModal";

export default function LocationsPage() {
  const state = useLocations();
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingItem, setEditingItem] = useState<BaseLocation | null>(null);

  const parents =
    state.dataType === "Province"
      ? state.countries
      : state.dataType === "District"
      ? state.provinces
      : state.dataType === "Ward"
      ? state.districts
      : [];

  const handleEdit = (item: BaseLocation) => {
    setEditingItem(item);
    setOpenEdit(true);
  };

  return (
    <div className="space-y-6">
      <LocationHeader
        onRefresh={state.fetchData}
        onAdd={() => setOpenAdd(true)}
      />

      <Card className="p-4">
        <LocationFilters {...state} openImport={() => alert("Import sau")} />
      </Card>

      <Card className="p-4">
        <LocationList
          loading={state.loading}
          filteredList={state.filteredList}
          currentType={state.dataType}
          onEdit={handleEdit}
          onDelete={state.remove}
          onUploadImage={state.uploadProvinceImage}
        />
      </Card>

      <AddLocationModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        currentType={state.dataType}
        parents={parents}
        onSubmit={(raw) => state.create(state.dataType, raw)}
      />

      <EditLocationModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        currentType={state.dataType}
        parents={parents}
        item={editingItem}
        onSubmit={(raw) => state.edit(state.dataType, editingItem!.id, raw)}
      />
    </div>
  );
}
