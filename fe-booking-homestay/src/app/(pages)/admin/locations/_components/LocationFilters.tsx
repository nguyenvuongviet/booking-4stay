"use client";

import { Button } from "@/_components/ui/button";
import { Combobox } from "@/_components/ui/combobox";
import { Input } from "@/_components/ui/input";
import { motion } from "framer-motion";
import { Database, MapPin, Search, X } from "lucide-react";

export function LocationFilters({
  dataType,
  setDataType,
  selectedParent,
  setSelectedParent,
  searchTerm,
  setSearchTerm,
  countries,
  provinces,
  filterProvinceId,
  setFilterProvinceId,
  clearFilters,
}: any) {
  const types = [
    { id: "Country", label: "Quốc gia", icon: Database },
    { id: "Province", label: "Tỉnh thành", icon: MapPin },
    { id: "Ward", label: "Phường xã", icon: MapPin },
  ];

  const parentOptions =
    dataType === "Province" ? countries : dataType === "Ward" ? provinces : [];

  const parentLabel = dataType === "Province" ? "Quốc gia" : "Tỉnh thành";

  const parentOptionsForCombobox = [
    { value: "all", label: `Tất cả ${parentLabel}` },
    ...parentOptions.map((p: any) => ({ value: String(p.id), label: p.name })),
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 sm:flex p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl w-full sm:w-fit border border-slate-200/50 dark:border-slate-700/50">
        {types.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setDataType(t.id);
              clearFilters();
            }}
            className={`
              relative px-1 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all duration-300
              flex items-center justify-center gap-1 sm:gap-2 z-10 cursor-pointer w-full sm:w-auto min-w-0 sm:min-w-fit sm:shrink-0
              ${dataType === t.id ? "text-white shadow-xs" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}
            `}
          >
            {dataType === t.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-primary rounded-lg -z-10 shadow-xs shadow-primary/10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <t.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate sm:overflow-visible sm:whitespace-nowrap">
              {t.label}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder={`Tìm kiếm tên ${
              types.find((t) => t.id === dataType)?.label.toLowerCase() ||
              "địa điểm"
            }...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9.5 sm:pl-11 h-9 sm:h-10 text-xs sm:text-sm rounded-lg sm:rounded-xl border border-slate-300 bg-white hover:border-slate-400 focus:border-primary focus:ring-1 focus:ring-primary shadow-xs transition-all placeholder:text-slate-450 dark:bg-slate-900 dark:border-slate-700"
          />
        </div>

        {dataType !== "Country" && (
          <div className="w-full sm:w-60">
            <Combobox
              options={parentOptionsForCombobox}
              value={
                selectedParent && selectedParent !== "all"
                  ? selectedParent
                  : "all"
              }
              onChange={(val) => setSelectedParent(val === "all" ? "all" : val)}
              placeholder={`Theo ${parentLabel}`}
              className="h-9 sm:h-10 text-xs sm:text-sm rounded-lg sm:rounded-xl border border-slate-300 bg-white hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-xs transition-all cursor-pointer dark:bg-slate-900 dark:border-slate-700"
            />
          </div>
        )}

        {(searchTerm ||
          (selectedParent && selectedParent !== "all") ||
          filterProvinceId) && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="h-9 sm:h-10 rounded-lg sm:rounded-xl px-4 sm:px-6 text-xs sm:text-sm text-red-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all font-semibold cursor-pointer"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
            <span className="hidden sm:inline">Xóa bộ lọc</span>
          </Button>
        )}
      </div>
    </div>
  );
}
