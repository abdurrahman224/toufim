import React from "react";
import { X } from "lucide-react";

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemName, isLoading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-[#111827]">Bevestig verwijderen</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#F3F4F6] p-2 hover:bg-[#E5E7EB]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 text-sm text-[#374151]">
          <p>
            Weet je zeker dat je <span className="font-semibold">{itemName || 'deze lead'}</span> wilt verwijderen? Deze actie kan niet ongedaan gemaakt worden.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-[#F1F5F9] px-4 py-2 font-semibold text-[#111827] hover:bg-[#E6EEF9]"
          >
            Annuleren
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded bg-[#FEE2E2] px-4 py-2 font-semibold text-[#B91C1C] hover:bg-[#FECACA]"
          >
            {isLoading ? 'Verwijderen...' : 'Verwijderen'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
