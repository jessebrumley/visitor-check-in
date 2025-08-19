// === Imports ===
import { useState } from "react";
import { getMicrosoftGraphToken } from "../utils/getMicrosoftGraphToken";
import { syncEmployees } from "../utils/syncEmployees";

// === Component ===
export function EntraSyncButton() {
  // === State ===
  const [message, setMessage] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  // === Config - values are kept in .env or .env.local file ===
  const tenantId = import.meta.env.VITE_ENTRA_TENANT_ID;
  const clientId = import.meta.env.VITE_ENTRA_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_ENTRA_CLIENT_SECRET;

  // === Handlers ===
  const handleSync = async () => {
    setMessage("");
    setIsSyncing(true);

    try {
      const token = await getMicrosoftGraphToken({
        tenantId,
        clientId,
        clientSecret,
      });

      const res = await fetch(
        "https://graph.microsoft.com/v1.0/users?$select=id,displayName,mail,jobTitle",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { value: users } = await res.json();

      const employees = users.map((user: any) => ({
        id: user.id,
        name: user.displayName,
        email: user.mail,
        title: user.jobTitle,
      }));

      await syncEmployees(employees);
      setMessage("Successfully synced employees from Microsoft Entra ID.");
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
        Sync from Microsoft Entra ID
      </h3>

      <p className="text-sm text-gray-700 mb-4">
        This will sync employees from Microsoft Azure/Entra ID using the
        credentials from your <code>.env</code> file:
        <br />
      </p>

      <button
        onClick={handleSync}
        disabled={isSyncing}
        className="bg-blue-900 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 w-full"
      >
        {isSyncing ? "Syncing..." : "Sync from Entra ID"}
      </button>

      {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
