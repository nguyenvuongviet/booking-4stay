"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Database, Filter, Search, Upload } from "lucide-react";

export function LocationFilters({
  dataType,
  setDataType,
  selectedParent,
  setSelectedParent,
  searchTerm,
  setSearchTerm,
  countries,
  provinces,
  districts,
}: any) {
  const parentOptions =
    dataType === "Province"
      ? countries
      : dataType === "District"
      ? provinces
      : dataType === "Ward"
      ? districts
      : [];

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2 w-full md:w-auto shrink-0 min-w-[200px]">
        <Database className="w-4 h-4" />
        <Select
          value={dataType}
          onValueChange={(v) => {
            setDataType(v);
            setSelectedParent(null);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chọn loại" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Country">Country</SelectItem>
            <SelectItem value="Province">Province</SelectItem>
            <SelectItem value="District">District</SelectItem>
            <SelectItem value="Ward">Ward</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {dataType !== "Country" && (
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 min-w-[200px]">
          <Filter className="w-4 h-4" />
          <Select
            value={selectedParent ?? ""}
            onValueChange={setSelectedParent}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn parent" />
            </SelectTrigger>
            <SelectContent>
              {parentOptions.map((p: any) => (
                <SelectItem key={p.id} value={p.name}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
        <Input
          placeholder={`Tìm kiếm ${dataType.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full"
        />
      </div>
    </div>
  );
}
