import React, { useEffect, useState } from "react";

interface CheckInConfirmProps {
  open: boolean;
  onClose: () => void;
}

const CheckInConfirm: React.FC<CheckInConfirmProps> = ({ open, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let fadeTimer: NodeJS.Timeout;
    let closeTimer: NodeJS.Timeout;

    if (open) {
      setVisible(true);
      fadeTimer = setTimeout(() => setVisible(false), 1700);
      closeTimer = setTimeout(() => onClose(), 2000);
    } else {
      setVisible(false);
    }

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(closeTimer);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div
        className={`bg-green-600 text-white rounded-lg shadow-lg px-6 py-4 text-lg font-semibold transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        Check-In Successful!
      </div>
    </div>
  );
};

export default CheckInConfirm;
