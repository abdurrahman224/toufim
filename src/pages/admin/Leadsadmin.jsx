import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  EllipsisVertical,
  Eye,
  Trash2,
  Upload,
} from "lucide-react";
import { Pagination, usePagination } from "../../components/Pagination";
import toast from "react-hot-toast";
import ViewModal from "../../components/ViewModal";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import { API_ENDPOINTS } from "../../services/httpEndpoint";
import { httpMethods } from "../../services/httpMethods";

const STATUS_STYLES = {
  processing: {
    pill: "bg-[#FFF2DC] text-[#D97706]",
    dot: "bg-[#F59E0B]",
    bgColor: "bg-[#FFF2DC]",
    textColor: "text-[#D97706]",
  },
  active: {
    pill: "bg-[#E7F0FF] text-[#3B82F6]",
    dot: "bg-[#60A5FA]",
    bgColor: "bg-[#E7F0FF]",
    textColor: "text-[#3B82F6]",
  },
  contacted: {
    pill: "bg-[#F1E8FF] text-[#8B5CF6]",
    dot: "bg-[#A78BFA]",
    bgColor: "bg-[#F1E8FF]",
    textColor: "text-[#8B5CF6]",
  },
  quoted: {
    pill: "bg-[#E8EDFF] text-[#4F46E5]",
    dot: "bg-[#818CF8]",
    bgColor: "bg-[#E8EDFF]",
    textColor: "text-[#4F46E5]",
  },
  closed: {
    pill: "bg-[#EEF2F7] text-[#64748B]",
    dot: "bg-[#94A3B8]",
    bgColor: "bg-[#EEF2F7]",
    textColor: "text-[#64748B]",
  },
};

const STATUS_HOVER_CLASS = {
  processing: "hover:bg-[#FEF3C7]",
  active: "hover:bg-[#DBEAFE]",
  contacted: "hover:bg-[#F1E8FF]",
  quoted: "hover:bg-[#E8EDFF]",
  closed: "hover:bg-[#EEF2F7]",
};

const StatusDropdown = ({
  options,
  rowId,
  onStatusChange,
  isOpen,
  onClose,
  buttonRect,
  isUpdating = false,
}) => {
  const dropdownRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, left: -100 });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let timeoutId;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && dropdownRef.current.contains(event.target)) {
        return;
      }
      onClose();
    };

    const handleScroll = () => {
      onClose();
    };

    const handleResize = () => {
      onClose();
    };

    // Delay listener registration to avoid catching the opening click
    timeoutId = setTimeout(() => {
      document.addEventListener("click", handleClickOutside, false);
      document.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleResize);
    }, 0);

    if (buttonRect) {
      const menuWidth = 144;
      const menuHeight = 132;
      const gap = 8;

      const centeredLeft =
        buttonRect.left + buttonRect.width / 2 - menuWidth / 1;
      const boundedLeft = Math.min(
        Math.max(gap, centeredLeft),
        window.innerWidth - menuWidth - gap,
      );

      const openUpward =
        buttonRect.bottom + menuHeight + gap > window.innerHeight;
      const top = openUpward
        ? Math.max(gap, buttonRect.top - menuHeight - gap)
        : Math.min(
            window.innerHeight - menuHeight - gap,
            buttonRect.bottom + gap,
          );

      setDropdownStyle({ top, left: boundedLeft });
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      document.removeEventListener("click", handleClickOutside, false);
      document.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, onClose, buttonRect]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="fixed w-36 rounded-lg border border-[#F485251A] bg-white shadow-2xl z-9999 overflow-hidden"
    >
      {options.map((option, index) => {
        const statusStyle = STATUS_STYLES[option.key] || STATUS_STYLES.closed;

        return (
          <button
            key={option.key}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onStatusChange(rowId, option.key);
            }}
            disabled={isUpdating ? true : false}
            className={`w-full px-2 py-2 text-center flex items-center justify-center gap-2 transition-colors active:bg-[#F48525]/10 ${
              isUpdating
                ? "opacity-50 cursor-not-allowed bg-gray-100"
                : `cursor-pointer ${STATUS_HOVER_CLASS[option.key] || STATUS_HOVER_CLASS.closed}`
            } ${
              index < options.length - 1 ? "border-b border-[#E5E7EB]" : ""
            }`}
          >
            {isUpdating ? (
              <div className='w-4 h-4 border-2 border-[#F48525]/30 border-t-[#F48525] rounded-full animate-spin' />
            ) : (
              <span className={`text-base font-semibold ${statusStyle.textColor}`}>
                {option.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

const formatCreatedAt = (createdAt) => {
  if (!createdAt) return "-";
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return createdAt;

  return new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getStatusTone = (status) => {
  const value = (status || "").toLowerCase();
  if (value.includes("afwachting") || value.includes("behandeling") || value.includes("uitvoering") || value.includes("pending")) return "processing";
  if (value.includes("active") || value.includes("actief")) return "active";
  if (value.includes("contact") || value.includes("gecontacteerd")) return "contacted";
  if (value.includes("quote") || value.includes("offerte") || value.includes("geciteerd") || value.includes("geoffreerd")) return "quoted";
  if (value.includes("close") || value.includes("afgerond") || value.includes("completed") || value.includes("gesloten") || value.includes("voltooid")) return "closed";
  return "closed";
};

const mapLeadRecord = (lead, index = 0) => {
  const fullName = lead?.fullName || lead?.name || "";
  const email = lead?.email || "";
  const referenceImages = Array.isArray(lead?.referenceImages)
    ? lead.referenceImages
    : Array.isArray(lead?.reference_images)
      ? lead.reference_images
      : [];

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((namePart) => namePart[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  return {
    id: lead?.id || lead?._id || index,
    fullName,
    email,
    phone: lead?.phone || "",
    serviceType: lead?.serviceType || lead?.service_type || "",
    address: lead?.address || "",
    projectDetails: lead?.projectDetails || lead?.project_details || "",
    referenceImages,
    status: lead?.status || "-",
    createdAt: lead?.createdAt || lead?.created_at || "",
    initials,
    avatar: { initials, background: "#EEF2F7" },
    statusTone: getStatusTone(lead?.status),
  };
};

const Leadsadmin = () => {
  const { t } = useTranslation();
  const data = t("admin.leads", { returnObjects: true });
  const { header, actions, table, statusOptions, mobileLabels, importModal } = data;
  
  const [rows, setRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);
  const [leadDetail, setLeadDetail] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [buttonRect, setButtonRect] = useState(null);
  const [isListLoading, setIsListLoading] = useState(false);
  const [listError, setListError] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

// Reverse mapping: API value -> tone (for consistency)
const apiValueToStatusTone = {
  "in afwachting": "processing",
  "gecontacteerd": "contacted",
  "geoffreerd": "quoted",
  "voltooid": "closed",
  "gesloten": "closed",
  "behandeling": "processing",
  "uitvoering": "processing",
};

  // Log only on first mount
  useEffect(() => {
    console.log("Leadsadmin mounted, statusOptions:", statusOptions);
  }, []);

  const loadLeads = useCallback(async () => {
    setIsListLoading(true);
    setListError(null);

    try {
      console.log("Loading leads...");
      const { data, error } = await httpMethods.get(API_ENDPOINTS.ADMIN_LEADS.LIST);

      if (error) {
        console.error("Error loading leads:", error);
        throw error;
      }

      const payload = data?.data ?? data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.leads)
            ? payload.leads
            : [];

      console.log("Leads loaded successfully:", list.length, "items");
      const mapped = list.map((lead, index) => mapLeadRecord(lead, index));
      setRows(mapped);
    } catch (err) {
      console.error("Failed to load leads:", err);
      setListError(err?.message || "Failed to load leads");
      setRows([]);
    } finally {
      setIsListLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchLeads = async () => {
      await loadLeads();
    };

    if (!cancelled) {
      fetchLeads();
    }

    return () => {
      cancelled = true;
    };
  }, [loadLeads]);

  const handleStatusChange = async (rowId, newStatusKey) => {
    setUpdatingStatusId(rowId);
    setOpenMenuId(null);
    setButtonRect(null);
    
    try {
      const apiStatusValue =
        statusOptions?.find((option) => option.key === newStatusKey)?.label ||
        newStatusKey;

      const endpoint = API_ENDPOINTS.ADMIN_LEADS.UPDATE_STATUS(rowId);
      const payload = { status: apiStatusValue };
      
      const { data, error } = await httpMethods.patch(endpoint, payload);

      if (error) {
        throw error;
      }

      // Update local state using reverse mapping for consistency
      setRows((prevRows) =>
        prevRows.map((row) => {
          if (row.id === rowId) {
            const normalized = apiStatusValue.toLowerCase();
            const derivedTone =
              apiValueToStatusTone[normalized] ||
              statusOptions?.find(
                (option) => option.label?.toLowerCase() === normalized
              )?.key ||
              getStatusTone(apiStatusValue);
            return {
              ...row,
              status: apiStatusValue,
              statusTone: derivedTone,
            };
          }
          return row;
        }),
      );

      toast.success("Status updated successfully");
    } catch (err) {
      toast.error(err?.message || "Failed to update status");
      await loadLeads();
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleMenuClick = (e, rowId) => {
    e.stopPropagation();
    setOpenMenuId((prevId) => (prevId === rowId ? null : rowId));
    setButtonRect(e.currentTarget.getBoundingClientRect());
  };

  const handleExport = () => {
    const filenameBase = `${data.exportFileNamePrefix}-${new Date().toISOString().split("T")[0]}`;
    const runExport = async () => {
      try {
        const { data: exportData, error } = await httpMethods.get(API_ENDPOINTS.ADMIN_LEADS.EXPORT, {
          responseType: "blob",
        });

        if (error) {
          throw error;
        }

        const blobData = exportData?.data ?? exportData;
        const blob = blobData instanceof Blob
          ? blobData
          : new Blob([blobData], { type: "text/csv;charset=utf-8;" });

        const disposition = exportData?.headers?.["content-disposition"];
        const matched = disposition?.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i);
        const serverFileName = matched?.[1]?.replace(/['"]/g, "");

        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", serverFileName || `${filenameBase}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        // Keep client-side fallback export behavior when server export is unavailable.
        const csvRows = rows.map((row) => [
          row.fullName,
          row.email,
          row.serviceType,
          formatCreatedAt(row.createdAt),
          row.status,
        ]);

        const csvContent = [
          ["fullName", "email", "serviceType", "createdAt", "status"].join(","),
          ...csvRows.map((r) => r.map((cell) => `"${cell}"`).join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${filenameBase}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.error(err?.message || "Server export failed. Downloaded local CSV instead.");
      }
    };

    runExport();
  };

  const handleImportClick = () => {
    setIsImportModalOpen(true);
  };

  const handleImportModalFileSelect = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      e.target.value = "";
      return;
    }

    uploadCSVFile(file);
  };

  const uploadCSVFile = async (file) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      console.log("Uploading CSV file:", file.name);

      const { data, error } = await httpMethods.post(
        API_ENDPOINTS.ADMIN_LEADS.UPLOAD_CSV,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (error) {
        console.error("Upload error:", error);
        throw error;
      }

      console.log("Upload response:", data);
      toast.success("CSV uploaded successfully");
      setIsImportModalOpen(false);
      
      // Add small delay before reloading to ensure backend has processed
      setTimeout(async () => {
        await loadLeads();
      }, 500);
    } catch (err) {
      console.error("CSV upload failed:", err);
      toast.error(err?.message || "Failed to upload CSV");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleView = async (row) => {
    setLeadDetail(row);
    setIsViewOpen(true);
    setIsDetailLoading(true);
    setDetailError(null);

    try {
      const { data, error } = await httpMethods.get(API_ENDPOINTS.ADMIN_LEADS.BY_ID(row.id));

      if (error) {
        throw error;
      }

      const payload = data?.data ?? data;
      const detail = Array.isArray(payload)
        ? payload[0]
        : payload?.lead ?? payload?.data ?? payload;

      if (detail) {
        setLeadDetail(mapLeadRecord(detail, row.id));
      }
    } catch (err) {
      setDetailError(err?.message || 'Failed to load lead details');
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Open delete confirmation modal for the selected row
  const [deleteRow, setDeleteRow] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleDelete = (row) => {
    setDeleteRow(row);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteRow || isDeleting) return;

    const runDelete = async () => {
      setIsDeleting(true);
      try {
        const { error } = await httpMethods.delete(API_ENDPOINTS.ADMIN_LEADS.DELETE(deleteRow.id));

        if (error) {
          throw error;
        }

        setRows((prev) => prev.filter((r) => r.id !== deleteRow.id));
        toast.success('Lead verwijderd');
        setIsDeleteOpen(false);
        setDeleteRow(null);
      } catch (err) {
        toast.error(err?.message || 'Failed to delete lead');
      } finally {
        setIsDeleting(false);
      }
    };

    runDelete();
  };

  const cancelDelete = () => {
    setIsDeleteOpen(false);
    setDeleteRow(null);
  };

  // Filter rows by search query
  const filteredRows = rows.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.fullName || '').toLowerCase().includes(q) ||
      (r.email || '').toLowerCase().includes(q) ||
      (r.serviceType || '').toLowerCase().includes(q) ||
      (r.status || '').toLowerCase().includes(q)
    );
  });

  // Use pagination on filtered rows
  const { currentPage, totalPages, paginatedData, handlePageChange } = usePagination(filteredRows, 6);

  return (
    <section className="w-full">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#F485251A] pb-4">
        <div>
          <h1 className="text-2xl md:text-4xl leading-[1.05] font-black text-[#111827]">
            {header.title}
          </h1>
          <p className="mt-3 text-base  text-[#64748B]">{header.subtitle}</p>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex h-8 w-full md:w-auto justify-center items-center gap-1 rounded-md border border-[#F485251A] bg-white px-2 text-sm font-semibold text-form-label md:h-10 md:gap-2 md:px-4 py-5 md:text-base cursor-pointer hover:bg-[#FCFDFE] transition-colors"
            >
              <Download size={18} className="md:w-5.5 md:h-5.5" />
              <span>{actions.export}</span>
            </button>

            <button
              type="button"
              onClick={handleImportClick}
              disabled={isUploading}
              className="inline-flex h-8 w-full md:w-auto justify-center items-center gap-1 rounded-md border border-[#F485251A] bg-white px-2 text-sm font-semibold text-form-label md:h-10 md:gap-2 md:px-4 py-5 md:text-base cursor-pointer hover:bg-[#FCFDFE] transition-colors disabled:opacity-50"
            >
              <Download size={18} className="md:w-5.5 md:h-5.5" />
              <span>Handmatige lead toevoegen</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-[#F485251A] bg-white shadow-[0_1px_0_0_rgba(15,23,42,0.02)]">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-y-auto overflow-x-auto">
          <table className="min-w-280 w-full">
            <thead>
              <tr className="bg-[#fef9f4] border-b border-[#F485251A]">
                {table.columns.map((column) => (
                  <th
                    key={column}
                    className={`px-6 py-4 text-base text-[#6B7C93] font-semibold ${
                      column === table.columns[table.columns.length - 1]
                        ? "text-center"
                        : "text-left"
                    }`}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {isListLoading ? (
                <tr>
                  <td colSpan={table.columns.length} className="px-6 py-10 text-center text-sm text-[#64748B]">
                    Loading leads...
                  </td>
                </tr>
              ) : listError ? (
                <tr>
                  <td colSpan={table.columns.length} className="px-6 py-10 text-center text-sm text-[#DC2626]">
                    {listError}
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={table.columns.length} className="px-6 py-10 text-center text-sm text-[#64748B]">
                    No leads yet
                  </td>
                </tr>
              ) : (
              paginatedData.map((row) => {
                const status =
                  STATUS_STYLES[row.statusTone] || STATUS_STYLES.closed;

                return (
                  <tr
                    key={row.id}
                    className="border-b border-[#F485251A] last:border-b-0 "
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-bold text-[#1F2937]"
                          style={{ backgroundColor: row.avatar.background }}
                        >
                          {row.initials}
                        </div>
                        <div>
                          <p className="text-base font-semibold  text-[#111827]">
                            {row.fullName}
                          </p>
                          <p className="text-sm  text-[#8191A6]">{row.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-3.5">
                      <span className="inline-flex rounded bg-[#EEF2F7] px-2.5 py-1 text-base  text-[#607086]">
                        {row.serviceType || '-'}
                      </span>
                    </td>

                    <td className="px-6 py-3.5">
                      <p className="text-base  text-body">
                        {formatCreatedAt(row.createdAt)}
                      </p>
                    </td>

                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-base  ${status.pill}`}
                      >
                        <span
                          className={`inline-block h-1.5 w-1.5 rounded-lg ${status.dot}`}
                          aria-hidden="true"
                        />
                        {row.status}
                      </span>
                    </td>

                    <td className="px-4 py-6 shrink-0 relative flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleView(row)}
                        className="text-[#64748B] hover:text-[#0F172A] transition-colors flex items-center justify-center cursor-pointer"
                        title="View"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        className="text-[#F43F5E] hover:text-[#DC2626] transition-colors flex items-center justify-center cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>

                      <button
                        type="button"
                        className="text-[#94A3B8] hover:text-[#0F172A] transition-colors flex items-center justify-center cursor-pointer"
                        onClick={(e) => handleMenuClick(e, row.id)}
                      >
                        <EllipsisVertical size={18} />
                      </button>
                      {openMenuId === row.id && (
                        <StatusDropdown
                          options={statusOptions}
                          rowId={row.id}
                          onStatusChange={handleStatusChange}
                          isOpen={true}
                          onClose={() => setOpenMenuId(null)}
                          buttonRect={buttonRect}
                          isUpdating={updatingStatusId === row.id}
                        />
                      )}
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3 p-4">
          {isListLoading ? (
            <div className="rounded-lg border border-[#F485251A] bg-white p-6 text-center text-sm text-[#64748B]">
              Loading leads...
            </div>
          ) : listError ? (
            <div className="rounded-lg border border-[#FEE2E2] bg-[#FFF1F2] p-6 text-center text-sm text-[#DC2626]">
              {listError}
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="rounded-lg border border-[#F485251A] bg-white p-6 text-center text-sm text-[#64748B]">
              No leads yet
            </div>
          ) : paginatedData.map((row) => {
            const status =
              STATUS_STYLES[row.statusTone] || STATUS_STYLES.closed;

            return (
              <div
                key={row.id}
                className="rounded-lg border border-[#F485251A] bg-[#FCFDFE] p-4 relative shadow-lg"
              >
                <div className="flex items-center justify-between gap-3 mb-3 ">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-[#1F2937] "
                      style={{ backgroundColor: row.avatar.background }}
                    >
                      {row.initials}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-[#111827]">
                        {row.fullName}
                      </p>
                      <p className="text-sm text-[#8191A6]">{row.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-[#94A3B8] hover:text-[#0F172A] transition-colors cursor-pointer"
                    onClick={(e) => handleMenuClick(e, row.id)}
                  >
                    <EllipsisVertical size={20} />
                  </button>
                  {openMenuId === row.id && (
                    <StatusDropdown
                      options={statusOptions}
                      rowId={row.id}
                      onStatusChange={handleStatusChange}
                      isOpen={true}
                      onClose={() => setOpenMenuId(null)}
                      buttonRect={buttonRect}
                      isUpdating={updatingStatusId === row.id}
                    />
                  )}
                </div>

                <div className="space-y-2.5 border-t border-[#F485251A] pt-3">
                  <div className="flex flex-row gap-2  justify-between items-center">
                    <p className="text-sm text-[#6B7C93]">{mobileLabels.serviceType}</p>
                    <span className="inline-flex rounded bg-[#EEF2F7] px-2.5 py-1 text-sm font-semibold text-[#607086] mt-1">
                      {row.serviceType || '-'}
                    </span>
                  </div>

                  <div className="">
                    <div className="flex flex-row gap-2  justify-between items-center">
                      <p className="text-sm text-[#6B7C93]">{mobileLabels.receivedDate}</p>
                      <div>
                        <p className="text-[14px] font-semibold text-[#111827] mt-1">
                          {formatCreatedAt(row.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-row gap-2  justify-between items-center pt-3">
                      <p className="text-sm text-[#6B7C93]">{mobileLabels.status}</p>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold mt-1 ${status.pill}`}
                      >
                        <span
                          className={`inline-block h-1.5 w-1.5 rounded-full ${status.dot}`}
                          aria-hidden="true"
                        />
                        {row.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleView(row)}
                      className="flex-1 rounded bg-[#F1F5F9] py-2 text-sm font-semibold text-form-label cursor-pointer"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(row)}
                      className="flex-1 rounded bg-[#FFF2F2] py-2 text-sm font-semibold text-[#DC2626] cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={rows.length}
          itemsPerPage={6}
        />
        <ViewModal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          lead={leadDetail}
          isLoading={isDetailLoading}
          error={detailError}
        />
        <DeleteConfirmModal
          isOpen={isDeleteOpen}
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          itemName={deleteRow?.fullName}
          isLoading={isDeleting}
        />

        {/* CSV Import Modal */}
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-50 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-[#E5E7EB] p-6">
                <h2 className="text-xl font-bold text-heading">{importModal.title}</h2>
                <button
                  type="button"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-[#94A3B8] hover:text-[#0F172A] transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="space-y-6 p-8">
                {/* Description */}
                <p className="text-sm text-[#64748B]">{importModal.description}</p>

                {/* Upload Zone */}
                <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-[#E5E7EB] bg-[#FAFBFC] py-12 cursor-pointer hover:border-[#F48525] hover:bg-[#FFF2DC] transition-colors" onClick={handleImportModalFileSelect}>
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="rounded-lg bg-[#FFF2DC] p-3">
                        <svg className="w-6 h-6 text-[#F48525]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-base font-semibold text-heading mb-1">
                      {importModal.uploadTitle}
                    </p>
                    <p className="text-sm text-[#64748B] mb-1">
                      {importModal.uploadHint}
                    </p>
                    <p className="text-xs text-[#94A3B8]">
                      {importModal.uploadLimit}
                    </p>
                  </div>
                </div>

                {/* Note Section */}
                <div className="rounded-lg border border-[#FEE2E2] bg-[#FFF1F2] p-4">
                  <p className="text-sm font-semibold text-[#DC2626] mb-2">
                    {importModal.noteTitle}
                  </p>
                  <p className="text-sm text-[#991B1B]">
                    {importModal.noteBody}
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 border-t border-[#E5E7EB] p-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  disabled={isUploading}
                  className="flex-1 px-4 py-3 rounded-lg border border-[#E5E7EB] bg-white text-heading font-semibold hover:bg-[#F9FAFB] transition-colors disabled:opacity-50"
                >
                  {importModal.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleImportModalFileSelect}
                  disabled={isUploading}
                  className="flex-1 px-4 py-3 rounded-lg bg-[#F48525] text-white font-semibold hover:bg-[#E67E22] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                      {importModal.uploading}
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      <span>{importModal.uploadFiles}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Leadsadmin;
