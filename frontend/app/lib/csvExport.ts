import { CrmRecord } from "./types";

const CSV_COLUMNS: { key: keyof CrmRecord; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "country_code", label: "Country Code" },
  { key: "mobile_without_country_code", label: "Mobile" },
  { key: "company", label: "Company" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "country", label: "Country" },
  { key: "lead_owner", label: "Lead Owner" },
  { key: "crm_status", label: "CRM Status" },
  { key: "crm_note", label: "CRM Note" },
  { key: "data_source", label: "Data Source" },
  { key: "possession_time", label: "Possession Time" },
  { key: "description", label: "Description" },
  { key: "created_at", label: "Created At" },
];

function escapeCsvValue(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadCrmRecordsAsCsv(records: CrmRecord[], fileName: string): void {
  const header = CSV_COLUMNS.map((c) => escapeCsvValue(c.label)).join(",");
  const lines = records.map((record) =>
    CSV_COLUMNS.map((c) => escapeCsvValue(record[c.key] ?? "")).join(",")
  );
  const csvContent = [header, ...lines].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
