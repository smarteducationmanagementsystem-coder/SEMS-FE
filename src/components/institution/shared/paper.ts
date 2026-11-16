export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    if (char === "&") return "&amp;";
    if (char === "<") return "&lt;";
    if (char === ">") return "&gt;";
    if (char === '"') return "&quot;";
    return "&#39;";
  });
}

export function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** Opens the browser print sheet on portrait A4 so the file can be saved as a PDF. */
export function downloadA4Portrait(title: string, bodyHtml: string, extraCss = "") {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  if (!doc || !win) {
    iframe.remove();
    return;
  }
  doc.open();
  doc.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: A4 portrait; margin: 8mm; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #111; font-family: Arial, Helvetica, sans-serif; }
    .page { height: 281mm; display: flex; flex-direction: column; page-break-after: always; }
    .page:last-child { page-break-after: auto; }
    .slip { flex: 0 0 70.25mm; height: 70.25mm; min-height: 0; display: grid; grid-template-columns: 1fr 14px 1fr; border-bottom: 1px dashed #9ca3af; overflow: hidden; }
    .slip:last-child { border-bottom: 0; }
    .copy { display: flex; flex-direction: column; height: 100%; padding: 2.5mm 3mm 2mm; overflow: hidden; }
    .cut { position: relative; background-image: repeating-linear-gradient(to bottom, transparent, transparent 4px, #111 4px, #111 6px); }
    .cut span { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(90deg); background: #fff; font-size: 13px; line-height: 1; padding: 3px 0; }
    .head { display: flex; align-items: center; gap: 2mm; }
    .logo { width: 9mm; height: 9mm; object-fit: cover; border-radius: 50%; flex: 0 0 auto; }
    .title { flex: 1; min-width: 0; }
    .academy { margin: 0; text-align: center; font-size: 11px; font-weight: 800; letter-spacing: 0.01em; text-transform: uppercase; line-height: 1.15; }
    .branch { margin: 1px 0 0; text-align: center; font-size: 7px; line-height: 1.2; color: #333; }
    .tag { margin: 1px 0 0; text-align: center; font-size: 7px; letter-spacing: 0.08em; text-transform: uppercase; color: #444; }
    .fields { flex: 1; display: flex; flex-direction: column; justify-content: space-evenly; min-height: 0; margin-top: 1.5mm; }
    .row { display: flex; align-items: flex-end; gap: 4px; font-size: 11px; line-height: 1.25; }
    .label { font-weight: 700; white-space: nowrap; }
    .line { flex: 1; min-width: 0; border-bottom: 1px solid #111; min-height: 16px; padding: 0 2px 1px; font-weight: 600; }
    ${extraCss}
  </style>
</head>
<body>${bodyHtml}</body>
</html>`);
  doc.close();
  win.focus();
  win.print();
  window.setTimeout(() => iframe.remove(), 1000);
}

/** Opens the browser print sheet on horizontal A4 so the file can be saved as a PDF. */
export function downloadA4Landscape(title: string, bodyHtml: string, extraCss = "", pageMargin = "10mm") {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  if (!doc || !win) {
    iframe.remove();
    return;
  }
  doc.open();
  doc.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: A4 landscape; margin: ${pageMargin}; }
    body { margin: 0; color: #111827; font-family: Arial, Helvetica, sans-serif; }
    h1 { margin: 0 0 4px; font-size: 16px; }
    p { margin: 0 0 10px; font-size: 11px; color: #4b5563; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #d1d5db; padding: 4px 6px; font-size: 10px; vertical-align: top; text-align: left; }
    th { background: #f3f4f6; }
    ${extraCss}
  </style>
</head>
<body>${bodyHtml}</body>
</html>`);
  doc.close();
  win.focus();
  win.print();
  window.setTimeout(() => iframe.remove(), 1000);
}
