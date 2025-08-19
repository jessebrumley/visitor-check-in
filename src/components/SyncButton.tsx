// === Imports ===
import { syncEmployees } from "../utils/syncEmployees";
import { useState } from "react";
import Papa from "papaparse";

// === Component ===
export function SyncButton() {
  // === State ===
  const [message, setMessage] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // === Handlers ===
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  // === Main Sync Logic ===
  const handleSync = async () => {
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    setMessage("");
    setIsSyncing(true);

    try {
      const content = await file.text();
      let data;

      // === JSON File Handling ===
      if (file.name.endsWith(".json")) {
        const raw = JSON.parse(content);
        data = raw.map((row: any) => ({
          id: crypto.randomUUID(),
          display_name: row.name,
          email: row.email,
          job_title: row.title,
        }));
      }

      // === CSV File Handling ===
      else if (file.name.endsWith(".csv")) {
        const parsed = Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
        });

        console.log("Raw CSV content:", content);
        console.log("Parsed result:", parsed);
        console.error("PapaParse errors:", parsed.errors);

        if (parsed.errors.length) {
          console.error("PapaParse first error:", parsed.errors[0]);
          throw new Error("CSV parsing failed");
        }

        data = parsed.data.map((row: any) => ({
          id: crypto.randomUUID(),
          display_name: row.name,
          email: row.email,
          job_title: row.title,
        }));
      }

      // === Unsupported File Type ===
      else {
        throw new Error("Unsupported file format");
      }

      // === Upload to Supabase ===
      console.log("Final employee data:", data);
      await syncEmployees(data);
      setMessage("Employee data synced successfully.");
    } catch (err) {
      console.error(err);
      setMessage("Sync failed. Check console for details.");
    } finally {
      setIsSyncing(false);
    }
  };

  // === Render ===
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Sync Employee Directory
      </h3>
      <p className="mb-4">Upload a CSV or JSON file with employee data.</p>

      <input
        type="file"
        accept=".json,.csv"
        onChange={handleFileChange}
        className="mb-4 w-full"
      />

      <button
        onClick={handleSync}
        disabled={isSyncing || !file}
        className="bg-blue-900 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 w-full"
      >
        {isSyncing ? "Syncing..." : "Sync Now"}
      </button>

      {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
