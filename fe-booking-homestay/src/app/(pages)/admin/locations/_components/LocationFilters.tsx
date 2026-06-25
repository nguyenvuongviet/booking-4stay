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
    { id: "Province", label: "Tỉnh/Thành phố", icon: MapPin },
    { id: "Ward", label: "Phường/Xã", icon: MapPin },
  ];

  const parentOptions =
    dataType === "Province" ? countries : dataType === "Ward" ? provinces : [];

  const parentLabel = dataType === "Province" ? "Quốc gia" : "Tỉnh/Thành phố";

  const parentOptionsForCombobox = [
    { value: "all", label: `Tất cả ${parentLabel}` },
    ...parentOptions.map((p: any) => ({ value: String(p.id), label: p.name })),
  ];

  return (
    <div className="space-y-4">
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl w-full sm:w-fit overflow-x-auto no-scrollbar border border-slate-200/50 dark:border-slate-700/50">
        {types.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setDataType(t.id);
              clearFilters();
            }}
            className={`
              relative px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300
              flex items-center gap-2 z-10 whitespace-nowrap cursor-pointer
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
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder={`Tìm kiếm tên ${
              types.find((t) => t.id === dataType)?.label.toLowerCase() ||
              "địa điểm"
            }...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 h-10 rounded-xl border border-slate-300 bg-white hover:border-slate-400 focus:border-primary focus:ring-1 focus:ring-primary shadow-xs transition-all placeholder:text-slate-400 dark:bg-slate-900 dark:border-slate-700"
          />
        </div>

        {dataType !== "Country" && (
          <div className="sm:w-60">
            <Combobox
              options={parentOptionsForCombobox}
              value={
                selectedParent && selectedParent !== "all"
                  ? selectedParent
                  : "all"
              }
              onChange={(val) => setSelectedParent(val === "all" ? "all" : val)}
              placeholder={`Theo ${parentLabel}`}
              className="h-10 rounded-xl border border-slate-300 bg-white hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-xs transition-all cursor-pointer dark:bg-slate-900 dark:border-slate-700"
            />
          </div>
        )}

        {(searchTerm ||
          (selectedParent && selectedParent !== "all") ||
          filterProvinceId) && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="h-10 rounded-xl px-6 text-red-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all font-semibold cursor-pointer"
          >
            <X className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Xóa bộ lọc</span>
          </Button>
        )}
      </div>
    </div>
  );
}
