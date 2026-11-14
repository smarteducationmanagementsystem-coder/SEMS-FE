export function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function printDocument(title: string, body: string) {
  const popup = window.open("", "_blank", "noopener,noreferrer,width=860,height=720");
  if (!popup) return;
  popup.document.write(`<!doctype html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Georgia, "Times New Roman", serif; color: #0e1b3d; margin: 32px; }
          h1 { font-size: 22px; margin: 0 0 4px; }
          p { margin: 0 0 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #d5deee; padding: 8px 10px; text-align: left; font-size: 13px; }
          th { background: #f3f7fd; }
          .muted { color: #5c6b8a; font-size: 12px; }
        </style>
      </head>
      <body>${body}</body>
    </html>`);
  popup.document.close();
  popup.focus();
  popup.print();
}
