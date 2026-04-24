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
    dataType === "Province"
      ? countries
      : dataType === "Ward"
        ? provinces
        : [];

  const parentLabel =
    dataType === "Province"
      ? "Quốc gia"
      : "Tỉnh/Thành phố";

  const parentOptionsForCombobox = [
    { value: "all", label: `Tất cả ${parentLabel}` },
    ...parentOptions.map((p: any) => ({ value: String(p.id), label: p.name })),
  ];

  return (
    <div className="space-y-4">
      <div className="flex p-1.5 bg-muted/20 backdrop-blur-md rounded-2xl border border-white/10 w-full sm:w-fit overflow-x-auto no-scrollbar shadow-inner">
        {types.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setDataType(t.id);
              clearFilters();
            }}
            className={`
              relative px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-300
              flex items-center gap-2 z-10 whitespace-nowrap cursor-pointer
              ${dataType === t.id ? "text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"}
            `}
          >
            {dataType === t.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-primary rounded-xl -z-10 shadow-lg shadow-primary/20"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder={`Tìm kiếm tên ${
              types.find((t) => t.id === dataType)?.label.toLowerCase() ||
              "địa điểm"
            }...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 h-11 rounded-2xl bg-white/5 border-white/10 focus:ring-primary/20 hover:bg-white/10 transition-colors"
          />
        </div>

        {dataType !== "Country" && (
          <div className="flex-1 lg:max-w-[240px]">
            <Combobox
              options={parentOptionsForCombobox}
              value={
                selectedParent && selectedParent !== "all"
                  ? selectedParent
                  : "all"
              }
              onChange={(val) => setSelectedParent(val === "all" ? "all" : val)}
              placeholder={`Theo ${parentLabel}`}
              className="h-11 rounded-2xl bg-white/5 border-white/10 focus:ring-primary/20 hover:bg-white/10 transition-colors"
            />
          </div>
        )}

        {(searchTerm ||
          (selectedParent && selectedParent !== "all") ||
          filterProvinceId) && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="h-11 rounded-2xl px-6 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all font-bold cursor-pointer"
          >
            <X className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Xóa bộ lọc</span>
          </Button>
        )}
      </div>
    </div>
  );
}
