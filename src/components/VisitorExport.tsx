// === Imports ===
import React, { useMemo, useState, useEffect } from "react";
import Papa from "papaparse";
import { supabase } from "../lib/supabase";

// === Helper Functions ===
function isoNoMsRange(date: string, endOfDay = false) {
  const d = new Date(date);
  if (endOfDay) d.setHours(23, 59, 59, 0);
  else d.setHours(0, 0, 0, 0);
  return d.toISOString().split(".")[0] + "Z";
}

function isBadRequest(err: any) {
  const msg = (err?.message || "").toLowerCase();
  return err?.code === "400" || msg.includes("bad request") || msg.includes("invalid input syntax");
}

// === Component ===
const VisitorExport: React.FC = () => {
  // === State ===
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(today);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>("checkinvisitor534@gmail.com");

  // === Get signed-in admin email on component mount ===
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.email) setAdminEmail(data.user.email);
    })();
  }, []);


  // === Derived Values ===
  const validRange =
    startDate &&
    endDate &&
    new Date(`${startDate}T00:00:00`) <= new Date(`${endDate}T23:59:59`);

  // === Handlers ===
  const handleExport = async () => {
    setErrorMsg(null);
    if (!validRange) {
      setErrorMsg("Please choose a valid date range.");
      return;
    }

    //**if (!adminEmail) {
     // setErrorMsg("Cannot send email: Admin email not found.");
     // return;
    //}** //

    setIsExporting(true);
    try {
      const tsFrom = isoNoMsRange(startDate, false);
      const tsTo = isoNoMsRange(endDate, true);

      // Fetch visitor data from Supabase
      let { data, error } = await supabase
        .from("visitors")
        .select("*")
        .gte("checked_in_at", tsFrom)
        .lte("checked_in_at", tsTo);

      if (error && isBadRequest(error)) {
        // Retry for DATE column type
        const retry = await supabase
          .from("visitors")
          .select("*")
          .gte("checked_in_at", startDate)
          .lte("checked_in_at", endDate);
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        setErrorMsg(error.message || "Error fetching visitors.");
        return;
      }
      if (!data || data.length === 0) {
        setErrorMsg("No visitor data found in that range.");
        return;
      }

      // === Create CSV ===
      const csv = Papa.unparse(data, { header: true });

      // === Trigger download ===
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const sameDay = startDate === endDate;
      const filename = sameDay
        ? `visitors_${startDate}.csv`
        : `visitors_${startDate}_to_${endDate}.csv`;
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // === Send CSV via email automatically (Netlify Function + SendGrid) ===
      try {
        const response = await fetch("/.netlify/functions/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: adminEmail,                 // or hardcode 'checkinvisitor534@gmail.com'
            subject: "Visitor Log CSV",
            csvContent: csv,                // CSV string
          }),
        });

        if (!response.ok) {
          const msg = await response.text();
          throw new Error(msg);
        }

        const result = await response.json();
        console.log("Email send result:", result);
        alert("CSV exported and email sent to admin!");
      } catch (err) {
        console.error("Email sending failed:", err);
        alert("CSV exported but failed to send email.");
      }
    } finally {
      setIsExporting(false);
    }
  };

  // === Render ===
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Export Visitors
      </h3>

      <div className="grid grid-cols-1 gap-4">
        {/* === Date Pickers === */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Start date</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">End date</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        {/* === Error Message === */}
        {errorMsg && <div className="text-sm text-red-600">{errorMsg}</div>}

        {/* === Download + Email Button === */}
        <button
          onClick={handleExport}
          disabled={!validRange || isExporting}
          className="bg-blue-900 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-2xl px-4 py-3 font-medium"
        >
          {isExporting ? "Preparing CSV…" : "Download & Email CSV"}
        </button>
      </div>
    </div>
  );
};

export default VisitorExport;
