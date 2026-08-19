import React from "react";
import { X } from "lucide-react";

const ViewModal = ({ isOpen, onClose, lead, isLoading = false, error = null }) => {
  if (!isOpen) return null;

  const referenceImages = Array.isArray(lead?.referenceImages) ? lead.referenceImages : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-black/40 " onClick={onClose}  />

      <div className="relative z-10 w-full max-w-2xl rounded-lg  bg-white shadow-xl flex max-h-[90vh] flex-col">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[#E5E7EB] bg-white p-4 md:p-6">
          <h3 className="text-xl font-semibold text-[#111827]">Lead details</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#F3F4F6] p-2 hover:bg-[#E5E7EB]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {isLoading ? (
            <div className="text-center text-sm text-[#64748B]">Loading lead details...</div>
          ) : error ? (
            <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : (
            <div className="space-y-3 text-sm text-[#374151]">
              <div className="text-base font-medium text-[#111827]">Name : {lead?.fullName || '...'}</div>
              <div className="text-base">Email : {lead?.email || '-'}</div>
              <div className="text-base">Phone : {lead?.phone || '-'}</div>
              <div className="text-base">Service Type : {lead?.serviceType || '-'}</div>
              <div className="text-base whitespace-pre-wrap">Address : {lead?.address || '-'}</div>
              <div className="text-base whitespace-pre-wrap">Project Details : {lead?.projectDetails || '-'}</div>
              <div className="text-base">Created At : {lead?.createdAt || '-'}</div>
              <div className="text-base">Status : {lead?.status || '-'}</div>

              <div>
                <div className="text-base">
                  Reference Images : {referenceImages.length > 0 ? '' : '-'}
                </div>
                {referenceImages.length > 0 ? (
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {referenceImages.map((image, index) => (
                      <a
                        key={`${image}-${index}`}
                        href={image}
                        target="_blank"
                        rel="noreferrer"
                        className="overflow-hidden rounded border border-[#E5E7EB] bg-[#F8FAFC]"
                      >
                        <img src={image} alt={`Reference ${index + 1}`} className="h-32 w-full object-cover" />
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-[#E5E7EB] p-4 md:p-6">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded bg-[#F1F5F9] px-4 py-2 font-semibold text-[#111827] hover:bg-[#E6EEF9]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewModal;
