"use client";

import { Button } from "@/_components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/_components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/_components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocationSelector } from "../_hooks/useLocationSelector";

interface Props {
  value?: Partial<{
    countryId: any;
    provinceId: any;
    wardId: any;
  }>;
  onChange: (val: any) => void;
}

export function LocationSelector({
  value,
  onChange,
  autoFocus,
}: Props & { autoFocus?: boolean }) {
  const {
    value: loc,
    update,
    countries,
    provinces,
    wards,
  } = useLocationSelector(value);

  const [openStates, setOpenStates] = useState({
    countryId: false,
    provinceId: false,
    wardId: false,
  });
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    if (!autoFocus) return;
    if (value) {
      if (value.countryId && !value.provinceId) {
        setOpenStates((prev) => ({ ...prev, provinceId: true }));
      } else if (value.provinceId && !value.wardId) {
        setOpenStates((prev) => ({ ...prev, wardId: true }));
      }
    }
  }, [value, autoFocus]);

  const handleChange = (key: keyof typeof loc, v: any) => {
    update(key, v);
    const newLoc = {
      ...loc,
      [key]: v,
    };
    if (key === "countryId") {
      newLoc.provinceId = null;
      newLoc.wardId = null;
    } else if (key === "provinceId") {
      newLoc.wardId = null;
    }

    const selectedProv = provinces.find((p) => p.id === Number(newLoc.provinceId));
    const selectedWard = wards.find((w) => w.id === Number(newLoc.wardId));
    onChange({
      ...newLoc,
      _provinceName: selectedProv?.name || null,
      _wardName: selectedWard?.name || null,
    });
  };

  const handleSelect = (key: keyof typeof loc, id: number) => {
    handleChange(key, id);
    setSearchValue("");
    setOpenStates((prev) => ({ ...prev, [key]: false }));
    if (key === "countryId") {
      setOpenStates((prev) => ({ ...prev, provinceId: true }));
    } else if (key === "provinceId") {
      setOpenStates((prev) => ({ ...prev, wardId: true }));
    }
  };

  const handleClear = (key: keyof typeof loc) => {
    handleChange(key, null);
    setSearchValue("");
    setOpenStates((prev) => ({ ...prev, [key]: false }));

    if (key === "countryId") {
      handleChange("provinceId", null);
      handleChange("wardId", null);
    } else if (key === "provinceId") {
      handleChange("wardId", null);
    }
  };

  const buildCombo = (
    key: keyof typeof loc,
    label: string,
    items: any[],
    selected: any,
    isDisabled: boolean,
  ) => {
    const selectedObj = items.find((i) => i.id === Number(selected));
    const currentOpen = openStates[key];

    const filteredItems = items.filter((item) =>
      item.name.toLowerCase().includes(searchValue.toLowerCase()),
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
            isDisabled && "opacity-50 pointer-events-none",
          )}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={currentOpen}
              className={cn(
                "w-full justify-between h-10",
                isDisabled && "bg-muted",
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

        <PopoverContent className="w-[300px] p-0" align="start">
          <Command
            shouldFilter={false}
            className="w-full"
            onWheel={(e) => e.stopPropagation()}
          >
            <CommandInput
              placeholder={`Tìm kiếm ${label.toLowerCase()}...`}
              value={searchValue}
              onValueChange={setSearchValue}
            />

            <CommandList className="max-h-[300px] overflow-y-auto overflow-x-hidden">
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
                          selected === item.id ? "opacity-100" : "opacity-0",
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {buildCombo(
        "countryId",
        "Chọn quốc gia",
        countries,
        loc.countryId,
        false,
      )}
      {buildCombo(
        "provinceId",
        "Chọn tỉnh / thành",
        provinces,
        loc.provinceId,
        !loc.countryId,
      )}
      {buildCombo(
        "wardId",
        "Chọn phường / xã",
        wards,
        loc.wardId,
        !loc.provinceId,
      )}
    </div>
  );
}
