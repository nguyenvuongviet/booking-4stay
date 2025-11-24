"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocationSelector } from "../_hooks/useLocationSelector";

interface Props {
  value?: Partial<{
    countryId: any;
    provinceId: any;
    districtId: any;
    wardId: any;
  }>;
  onChange: (val: any) => void;
}

export function LocationSelector({ value, onChange }: Props) {
  const {
    value: loc,
    update,
    countries,
    provinces,
    districts,
    wards,
  } = useLocationSelector(value);

  const [openStates, setOpenStates] = useState({
    countryId: false,
    provinceId: false,
    districtId: false,
    wardId: false,
  });
  const [searchValue, setSearchValue] = useState("");
  useEffect(() => {
    if (value) {
      if (value.countryId && !value.provinceId) {
        setOpenStates((prev) => ({ ...prev, provinceId: true }));
      } else if (value.provinceId && !value.districtId) {
        setOpenStates((prev) => ({ ...prev, districtId: true }));
      } else if (value.districtId && !value.wardId) {
        setOpenStates((prev) => ({ ...prev, wardId: true }));
      }
    }
  }, [value]);

  const handleChange = (key: keyof typeof loc, v: any) => {
    update(key, v);
    const newLoc = {
      ...loc,
      [key]: v,
    };
    if (key === "countryId") {
      newLoc.provinceId = null;
      newLoc.districtId = null;
      newLoc.wardId = null;
    } else if (key === "provinceId") {
      newLoc.districtId = null;
      newLoc.wardId = null;
    } else if (key === "districtId") {
      newLoc.wardId = null;
    }
    onChange(newLoc);
  };

  const handleSelect = (key: keyof typeof loc, id: number) => {
    handleChange(key, id);
    setSearchValue("");
    setOpenStates((prev) => ({ ...prev, [key]: false }));
    if (key === "countryId") {
      setOpenStates((prev) => ({ ...prev, provinceId: true }));
    } else if (key === "provinceId") {
      setOpenStates((prev) => ({ ...prev, districtId: true }));
    } else if (key === "districtId") {
      setOpenStates((prev) => ({ ...prev, wardId: true }));
    }
  };

  const handleClear = (key: keyof typeof loc) => {
    handleChange(key, null);
    setSearchValue("");

    setOpenStates((prev) => ({ ...prev, [key]: false }));

    if (key === "countryId") {
      handleChange("provinceId", null);
      handleChange("districtId", null);
      handleChange("wardId", null);
    } else if (key === "provinceId") {
      handleChange("districtId", null);
      handleChange("wardId", null);
    } else if (key === "districtId") {
      handleChange("wardId", null);
    }
  };

  const buildCombo = (
    key: keyof typeof loc,
    label: string,
    items: any[],
    selected: any,
    isDisabled: boolean
  ) => {
    const selectedObj = items.find((i) => i.id === Number(selected));
    const currentOpen = openStates[key];

    const filteredItems = items.filter((item) =>
      item.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    return (
      <Popover
        open={currentOpen && !isDisabled}
        onOpenChange={(open) =>
          setOpenStates((prev) => ({ ...prev, [key]: open }))
        }
      >
        <div
          className={cn(
            "relative",
            isDisabled && "opacity-50 pointer-events-none"
          )}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={currentOpen}
              className={cn(
                "w-full justify-between h-10",
                isDisabled && "bg-muted"
              )}
              disabled={isDisabled}
              onClick={() => {
                setOpenStates((prev) => ({ ...prev, [key]: !currentOpen }));
                setSearchValue("");
              }}
            >
              {selectedObj ? selectedObj.name : label}
              <ChevronsUpDown className="w-4 h-4 shrink-0 opacity-50 ml-2" />
            </Button>
          </PopoverTrigger>

          {selectedObj && !isDisabled && (
            <button
              type="button"
              onClick={() => handleClear(key)}
              className="absolute right-9 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
              aria-label={`Xóa ${label}`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <PopoverContent className="w-full p-0 max-w-[calc(100vw-32px)] sm:max-w-md">
          <Command>
            <div className="p-1 border-b">
              <Input
                placeholder={`Tìm kiếm ${label.toLowerCase()}...`}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="border-none focus-visible:ring-0"
              />
            </div>

            <CommandList className="max-h-60 overflow-y-auto">
              {filteredItems.length === 0 ? (
                <CommandEmpty>Không tìm thấy.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredItems.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={String(item.id)}
                      onSelect={() => handleSelect(key, item.id)}
                    >
                      <Check
                        className={cn(
                          "w-4 h-4 mr-2",
                          selected === item.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {item.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {buildCombo(
        "countryId",
        "Chọn quốc gia",
        countries,
        loc.countryId,
        false
      )}
      {buildCombo(
        "provinceId",
        "Chọn tỉnh / thành",
        provinces,
        loc.provinceId,
        !loc.countryId
      )}
      {buildCombo(
        "districtId",
        "Chọn quận / huyện",
        districts,
        loc.districtId,
        !loc.provinceId
      )}
      {buildCombo(
        "wardId",
        "Chọn phường / xã",
        wards,
        loc.wardId,
        !loc.districtId
      )}
    </div>
  );
}
