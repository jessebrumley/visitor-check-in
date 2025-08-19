import React, { useState } from "react";
import { supabase } from "../lib/supabase";

interface CheckOutConfirmProps {
  open: boolean;
  badgeId: string | null;
  badgeNumber: string | null;
  onClose: () => void;
  onCheckedOut?: () => void;
}

const CheckOutConfirm: React.FC<CheckOutConfirmProps> = ({
  open,
  badgeId,
  badgeNumber,
  onClose,
  onCheckedOut,
}) => {
  const [loading, setLoading] = useState(false);

  if (!open || !badgeId || !badgeNumber) return null;

  async function handleConfirm() {
    setLoading(true);
    // Unassign badge
    await supabase
      .from("badges")
      .update({ assigned: false })
      .eq("id", badgeId);

    // Check out matching visitor
    await supabase
      .from("visitors")
      .update({
        status: "checked_out",
        checked_out_at: new Date().toISOString(),
      })
      .eq("badge_id", badgeId)
      .eq("status", "checked_in");

    setLoading(false);
    onClose();
    if (onCheckedOut) onCheckedOut();
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <div className="mb-4 text-center">
          <p className="text-lg font-semibold">
            Check Out Badge {badgeNumber}?
          </p>
        </div>
        <div className="flex justify-center space-x-2">
          <button
            className="px-8 py-4 bg-gray-300 rounded-xl hover:bg-gray-400"
            onClick={onClose}
            disabled={loading}
          >
            No
          </button>
          <button
            className="px-8 py-4 bg-rose-900 text-white rounded-xl hover:bg-rose-950"
            onClick={handleConfirm}
            disabled={loading}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckOutConfirm;