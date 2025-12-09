export function exportCSV(filename: string, rows: any[]) {
  if (!rows.length) return;

  const separator = ",";
  const keys = Object.keys(rows[0]);

  const csvContent =
    keys.join(separator) +
    "\n" +
    rows
      .map((row) =>
        keys
          .map((k) => {
            let val = row[k] ?? "";
            if (typeof val === "string") {
              val = `"${val.replace(/"/g, '""')}"`;
            }
            return val;
          })
          .join(separator)
      )
      .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `${filename}.csv`);
  link.click();
}

export function exportJSON(filename: string, data: any) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `${filename}.json`);
  link.click();
}
