"use client";

import { BaseLocation } from "@/services/admin/locationsApi";
import { useState } from "react";
import { AddLocationModal } from "./_components/AddLocationModal";
import { EditLocationModal } from "./_components/EditLocationModal";
import { LocationFilters } from "./_components/LocationFilters";
import { LocationHeader } from "./_components/LocationHeader";
import { LocationList } from "./_components/LocationList";
import { LocationPagination } from "./_components/LocationPagination";
import { useLocations } from "./_hooks/useLocations";

export default function LocationsPage() {
  const state = useLocations();
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingItem, setEditingItem] = useState<BaseLocation | null>(null);

  const parents =
    state.dataType === "Province"
      ? state.countries
      : state.dataType === "Ward"
        ? state.provinces
        : [];

  const handleEdit = (item: BaseLocation) => {
    setEditingItem(item);
    setOpenEdit(true);
  };

  return (
    <div className="space-y-4 max-w-400 mx-auto">
      <LocationHeader
        onRefresh={state.fetchData}
        onAdd={() => setOpenAdd(true)}
      />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <LocationFilters
          {...state}
          provinces={state.provinces}
          filterProvinceId={state.filterProvinceId}
          setFilterProvinceId={state.setFilterProvinceId}
          clearFilters={state.clearFilters}
        />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <LocationList
          loading={state.loading}
          filteredList={state.filteredList}
          currentType={state.dataType}
          onEdit={handleEdit}
          onDelete={state.remove}
          onUploadImage={state.uploadProvinceImage}
        />
        <LocationPagination
          currentPage={state.page}
          totalPages={state.meta.totalPages}
          totalItems={state.meta.totalItems}
          onPageChange={state.setPage}
        />
      </div>

      <AddLocationModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        currentType={state.dataType}
        parents={parents}
        countries={state.countries}
        provinces={state.provinces}
        onSubmit={(raw) => state.create(state.dataType, raw)}
      />

      <EditLocationModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        currentType={state.dataType}
        parents={parents}
        countries={state.countries}
        provinces={state.provinces}
        item={editingItem}
        onSubmit={(raw) => state.edit(state.dataType, editingItem!.id, raw)}
      />
    </div>
  );
}
