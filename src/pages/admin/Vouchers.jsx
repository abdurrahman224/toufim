import { AlarmClockMinus, ArrowLeft, ChevronDown, Forward, Plus, Rocket, Ticket, TrendingUp, UserCheck, ChevronRight, CornerUpLeft, Eye, Pencil, Trash2, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Pagination, usePagination } from "../../components/Pagination";
import { VoucherCreationPage } from "../../components/VoucherCreationPage";
import httpMethods from "../../services/httpMethods";
import API_ENDPOINTS from "../../services/httpEndpoint";
import { ROUTES } from "../../config";

const formatCount = (value) => {
  if (value === null || value === undefined) return "0";
  if (typeof value === "string") return value;
  if (Number.isNaN(value)) return "0";
  return new Intl.NumberFormat("nl-NL").format(value);
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "€ 0";
  if (typeof value === "string") return value;
  if (Number.isNaN(value)) return "€ 0";
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
};

function ProgressBar({ used, total }) {
  const safeTotal = Number(total) || 0;
  const safeUsed = Number(used) || 0;
  const pct = safeTotal > 0 ? Math.round((safeUsed / safeTotal) * 100) : 0;
  const color = pct >= 100 ? "#ef4444" : pct >= 50 ? "#f97316" : "#22c55e";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs text-gray-400">{safeUsed}/{safeTotal} {pct}%</span>
    </div>
  );
}

function StatusBadge({ status, statusText }) {
  const { t } = useTranslation();
  const badges = t("admin.vouchers.statusBadge", { returnObjects: true });
  
  if (status === (statusText?.active || badges.active)) return (
    <span className="inline-flex items-center gap-1 text-base px-2.5 py-1 rounded-full bg-green-50 text-green-700">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />{statusText?.active || badges.active}
    </span>
  );
  if (status === (statusText?.draft || badges.draft || "Draft")) return (
    <span className="inline-flex items-center gap-1 text-base px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />{statusText?.draft || badges.draft || "Draft"}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-700">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />{statusText?.expired || badges.expired}
    </span>
  );
}

const VoucherDropdown = ({ rowId, isOpen, onClose, buttonRect, onView, onDelete }) => {
  const dropdownRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, left: -100 });
  const { t } = useTranslation();
  const actions = t("admin.actions", { returnObjects: true });

  const handleView = () => {
    if (onView) {
      onView(rowId);
    }
    onClose();
  };

  const handleDelete = () => {
    console.log("Delete click (dropdown):", rowId);
    if (onDelete) {
      onDelete(rowId);
    }
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.closest("[data-voucher-menu-button='true']")) {
        return;
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleScroll = () => {
      onClose();
    };

    const handleResize = () => {
      onClose();
    };

    if (isOpen && buttonRect) {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleResize);

      const menuWidth = 144;
      const menuHeight = 104;
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
        : Math.min(window.innerHeight - menuHeight - gap, buttonRect.bottom + gap);

      setDropdownStyle({ top, left: boundedLeft });
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, onClose, buttonRect]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="fixed w-40 rounded-lg border border-[#F485251A] bg-white shadow-2xl z-9999 overflow-hidden"
    >
      <button
        type="button"
        onMouseDown={(e) => {
          e.stopPropagation();
          handleView();
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleView();
        }}
        className="w-full px-4 py-2 text-center flex items-center gap-2 justify-center hover:bg-[#F8F9FA] transition-colors border-b border-[#E5E7EB] cursor-pointer"
      >
        <Eye size={16} className="text-[#64748B]" />
        <span className="text-sm font-semibold text-[#111827]">{actions.view}</span>
      </button>

      <button
        type="button"
        onMouseDown={(e) => {
          e.stopPropagation();
          handleDelete();
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleDelete();
        }}
        className="w-full px-4 py-2 text-center flex items-center gap-2 justify-center hover:bg-[#FEF2F2] transition-colors cursor-pointer"
      >
        <Trash2 size={16} className="text-[#EF4444]" />
        <span className="text-sm font-semibold text-[#EF4444]">{actions.delete}</span>
      </button>
    </div>
  );
};


function VoucherDropdownSelect({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center justify-between gap-2 h-10 w-55 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-[14px] md:text-base font-medium text-[#0F172A] hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <span>{value}</span>
        <ChevronDown
          size={16}
          className={`text-[#64748B] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 min-w-full rounded-xl border border-[#E2E8F0] bg-white shadow-lg overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[#FFF7ED] hover:text-[#F48525] ${value === opt ? "text-[#F48525] bg-[#FFF7ED]" : "text-[#0F172A]"}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DashboardPage({ onNewVoucher, onEditVoucher }) {
  const { t } = useTranslation();
  const data = t("admin.vouchers.dashboardPage", { returnObjects: true });
  const mobileLabels = t("admin.vouchers.mobileLabels", { returnObjects: true });
  const statusText = t("admin.vouchers.statusBadge", { returnObjects: true });
  const actions = t("admin.actions", { returnObjects: true });
  const [overviewStats, setOverviewStats] = useState({
    totalDiscountsApplied: 0,
    activeVouchers: 0,
    averageDiscountPerOrder: 0,
    ordersUsingVouchers: 0,
  });
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [paginationInfo, setPaginationInfo] = useState({
    totalPages: 1,
    currentPage: 1,
    totalItems: 0,
  });
  
  const [statusFilter, setStatusFilter] = useState(data.table.statusOptions[0]);
  const [sort, setSort] = useState(data.table.sortOptions[0]);
  const [deleteCandidateId, setDeleteCandidateId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadOverview = async () => {
      const { data: response, error } = await httpMethods.get(
        API_ENDPOINTS.ADMIN_VOUCHERS.OVERVIEW
      );

      if (!isMounted || error) return;

      const payload = response?.data?.data ?? response?.data ?? response;

      setOverviewStats({
        totalDiscountsApplied: payload?.totalDiscountsApplied ?? 0,
        activeVouchers: payload?.activeVouchers ?? 0,
        averageDiscountPerOrder: payload?.averageDiscountPerOrder ?? 0,
        ordersUsingVouchers: payload?.ordersUsingVouchers ?? 0,
      });
    };

    loadOverview();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatExpirationDate = (value) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleDateString("nl-NL", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const normalizeStatus = (value) => {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return statusText?.active || "Actief";
    if (["active", "actief", "enabled", "open"].includes(raw)) {
      return statusText?.active || "Actief";
    }
    if (["draft", "concept", "pending"].includes(raw)) {
      return statusText?.draft || "Draft";
    }
    if (["expired", "verlopen", "inactive", "closed"].includes(raw)) {
      return statusText?.expired || "Verlopen";
    }
    return value;
  };

  const loadVouchers = async (page = 1) => {
    setIsLoading(true);

    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", 10);

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.ADMIN_VOUCHERS.LIST}?${queryString}`
      : API_ENDPOINTS.ADMIN_VOUCHERS.LIST;

    const { data: response, error } = await httpMethods.get(url);

    if (error) {
      setRows([]);
      setPaginationInfo({ totalPages: 1, currentPage: page, totalItems: 0 });
      setIsLoading(false);
      return;
    }

    const root = response?.data ?? response;
    const payload = root?.data ?? root;
    const pagination = root?.pagination ?? payload?.pagination;
    const listSource =
      payload?.vouchers ??
      payload?.data ??
      payload?.items ??
      payload?.results ??
      payload;
    const list = Array.isArray(listSource) ? listSource : [];

    const normalizedRows = Array.isArray(list)
      ? list.map((voucher) => {
          const used =
            voucher.usedCount ?? voucher.usageCount ?? voucher.used ?? voucher.usageUsed ?? 0;
          const total =
            voucher.usageLimit ?? voucher.total ?? voucher.maxUsage ?? 0;

          const discountType =
            voucher.discountType ?? voucher.type ?? voucher.discountTypeName ?? "";
          const discountValue =
            voucher.discountValue ?? voucher.discount ?? voucher.value ?? "";
          const usageLimit =
            voucher.usageLimit ?? voucher.total ?? voucher.maxUsage ?? "";
          const expirationDate =
            voucher.expirationDate ?? voucher.expiresAt ?? voucher.expires ?? "";

          const serverId =
            voucher.id ??
            voucher.voucherId ??
            voucher._id ??
            null;
          const resolvedId = serverId ?? voucher.code ?? `${page}-${Math.random()}`;

          return {
            id: resolvedId,
            rawId: serverId,
            code: voucher.code || "-",
            discount:
              voucher.discountValue ?? voucher.discount ?? voucher.value ?? "-",
            used,
            total,
            status: normalizeStatus(voucher.status),
            expires: formatExpirationDate(
              voucher.expirationDate ?? voucher.expiresAt ?? voucher.expires
            ),
            discountType,
            discountValue,
            usageLimit,
            expirationDate,
          };
        })
      : [];

    setRows(normalizedRows);

    if (pagination) {
      setPaginationInfo({
        totalPages: pagination.pages || 1,
        currentPage: pagination.page || page,
        totalItems: pagination.total || normalizedRows.length || 0,
      });
    } else {
      setPaginationInfo({
        totalPages: Math.max(1, Math.ceil(normalizedRows.length / 10)),
        currentPage: page,
        totalItems: normalizedRows.length,
      });
    }

    setIsLoading(false);
  };

  const handleViewVoucher = (voucherId) => {
    console.log("View clicked for voucher:", voucherId);
  };

  const handleEditVoucher = (voucher) => {
    if (onEditVoucher) {
      onEditVoucher(voucher);
      return;
    }
    console.log("Edit clicked for voucher:", voucher?.rawId || voucher?.id);
  };

  const handleDeleteVoucher = async (voucherId) => {
    const hasValidId =
      voucherId !== null &&
      voucherId !== undefined &&
      String(voucherId).trim() !== "";

    if (!hasValidId) {
      setDeleteErrorMessage("Missing voucher id. Please refresh and try again.");
      setIsDeleteModalOpen(true);
      return;
    }

    console.log("Delete voucher id:", voucherId);
    setDeleteErrorMessage("");
    setDeleteCandidateId(voucherId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidateId) {
      setIsDeleteModalOpen(false);
      return;
    }

    const { error } = await httpMethods.delete(
      API_ENDPOINTS.ADMIN_VOUCHERS.DELETE(deleteCandidateId)
    );

    if (error) {
      setDeleteErrorMessage(
        error.message || "Delete failed. Please try again."
      );
      return;
    }

    const nextPage = paginationInfo.currentPage || 1;
    await loadVouchers(nextPage);
    setIsDeleteModalOpen(false);
    setDeleteCandidateId(null);
    setDeleteErrorMessage("");
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteCandidateId(null);
    setDeleteErrorMessage("");
  };

  useEffect(() => {
    loadVouchers(1);
  }, []);

  const resolvedStats = (data.stats || []).map((stat) => {
    if (stat.id === "totalDiscountsApplied") {
      return { ...stat, value: formatCurrency(overviewStats.totalDiscountsApplied) };
    }
    if (stat.id === "activeVouchers") {
      return { ...stat, value: formatCount(overviewStats.activeVouchers) };
    }
    if (stat.id === "averageDiscountPerOrder") {
      return { ...stat, value: formatCurrency(overviewStats.averageDiscountPerOrder) };
    }
    if (stat.id === "ordersUsingVouchers") {
      return { ...stat, value: formatCount(overviewStats.ordersUsingVouchers) };
    }
    return stat;
  });

  const filtered = rows.filter((v) =>
    statusFilter === data.table.statusOptions[0] || v.status === statusFilter
  );

  const { currentPage, totalPages, paginatedData } = usePagination(filtered, 10);
  const resolvedCurrentPage = paginationInfo.currentPage || currentPage;
  const resolvedTotalPages = paginationInfo.totalPages || totalPages;

  return (
    <div className="min-h-screen">
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-[#0F172A]">
              Voucher verwijderen?
            </h3>
            <p className="mt-2 text-sm text-[#64748B]">
              Dit kan niet ongedaan worden gemaakt.
            </p>
            {deleteErrorMessage ? (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {deleteErrorMessage}
              </p>
            ) : null}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-[#F8FAFC]"
              >
                Annuleren
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-lg bg-[#EF4444] px-4 py-2 text-sm font-semibold text-white hover:bg-[#DC2626]"
              >
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="  flex flex-col md:flex-row md:items-center md:justify-between border-b border-[#F485251A] gap-4 mb-9">
        <div className="flex-1 md:mb-4 ">
          <div className="text-2xl lg:text-4xl font-bold text-gray-900">
            {data.header.title}
          </div>
          <div className="text-base text-[#64748B] mt-1 md:mt-2">
            {data.header.subtitle}
          </div>
        </div>
        <button
          onClick={onNewVoucher}
          className="flex items-center justify-center md:justify-start gap-1.5 text-base font-semibold text-white   rounded-lg whitespace-nowrap px-4 py-2 cursor-pointer"
          style={{ background: '#f97316' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#ea6c0a')}
          onMouseLeave={e => (e.currentTarget.style.background = '#f97316')}
        >
          <Plus size={16} className="md:size-7" /> {data.header.createButton}
        </button>
      </div>

      <div className="space-y-4 md:space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
          {resolvedStats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg border border-[#F485251A] p-3 md:p-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3 md:mb-4 ">
                <div className="flex-1">
                  <p className="text-xs md:text-sm font-semibold text-[#64748B] tracking-wide mb-0.5">
                    {stat.title}
                  </p>
                </div>
                {stat.trend && (
                  <span className="inline-flex items-center gap-1 md:gap-1.5 text-[9px] md:text-xs font-bold px-2  py-1 md:py-1 rounded-lg text-green-700 bg-green-50 ml-2 shrink-0">
                    <TrendingUp size={12} className="md:size-6" /> {stat.trend}
                  </span>
                )}
                {stat.trendLabel && !stat.trend && (
                  <span className="inline-flex items-center gap-1 md:gap-1.5 text-[9px] md:text-xs font-bold px-2 py-1 md:py-1 rounded-lg text-[#F48525] bg-[#F485251A] ml-2 shrink-0">
                    <Ticket size={12} className="md:size-6" /> {stat.trendLabel}
                  </span>
                )}
              </div>
              <div className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-[#F485251A] overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between px-5 md:px-8 py-4 md:py-5 border-b border-[#F485251A] gap-2 md:gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <VoucherDropdownSelect
                value={statusFilter}
                options={data.table.statusOptions}
                onChange={setStatusFilter}
              />
              <VoucherDropdownSelect
                value={sort}
                options={data.table.sortOptions}
                onChange={setSort}
              />
            </div>
      
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-y-auto overflow-x-auto">
            <table className="min-w-280 w-full">
              <thead>
                <tr className="bg-[#fef9f4] border-b border-[#F485251A]">
                  {data.table.columns.map((column) => (
                    <th
                      key={column}
                      className={`px-6 py-4 text-base text-[#6B7C93] font-semibold ${
                        ["ACTIE", "ACTIES", "ACTION", "ACTIONS"].includes(
                          String(column).trim().toUpperCase()
                        )
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
                {paginatedData.map((voucher) => (
                  <tr
                    key={voucher.id}
                    className="border-b border-[#F485251A] last:border-b-0"
                  >
                    <td className="px-6 py-3.5">
                      <span
                        className="inline-flex rounded bg-[#FFF7ED] px-2.5 py-1 text-base font-semibold text-[#C2410C]"
                      >
                        {voucher.code}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex rounded bg-[#FFF7ED] px-2.5 py-1 text-base font-semibold text-[#F58626]">
                        {voucher.discount}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <ProgressBar used={voucher.used} total={voucher.total} />
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={voucher.status} statusText={statusText} />
                    </td>
                    <td className="px-6 py-3.5 text-base text-body">
                      {voucher.expires}
                    </td>
                    <td className="px-4 py-6 shrink-0 relative flex justify-center items-center">
                      <div className="flex items-center justify-center gap-3">
                        {/* <button
                          type="button"
                          className="text-[#111827] hover:text-[#F58626] transition-colors flex items-center justify-center cursor-pointer"
                          onClick={() => handleViewVoucher(voucher.rawId || voucher.id)}
                          aria-label={actions.view}
                        >
                          <Eye size={18} />
                        </button> */}
                        <button
                          type="button"
                          className="text-[#111827] hover:text-[#F58626] transition-colors flex items-center justify-center cursor-pointer"
                          onClick={() => handleEditVoucher(voucher)}
                          aria-label={actions.edit || "Edit"}
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          type="button"
                          className="text-[#EF4444] hover:text-[#DC2626] transition-colors flex items-center justify-center cursor-pointer"
                          onClick={() => handleDeleteVoucher(voucher.rawId || voucher.id)}
                          aria-label={actions.delete}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3 p-3">
            {paginatedData.map((voucher) => (
              <div
                key={voucher.id}
                className="rounded-lg border border-[#F485251A] bg-[#FCFDFE] p-4 relative shadow-lg"
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-base font-semibold text-[#111827]">
                        {voucher.code}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="text-[#111827] hover:text-[#F58626] transition-colors cursor-pointer"
                      onClick={() => handleViewVoucher(voucher.rawId || voucher.id)}
                      aria-label={actions.view}
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      type="button"
                      className="text-[#111827] hover:text-[#F58626] transition-colors cursor-pointer"
                      onClick={() => handleEditVoucher(voucher)}
                      aria-label={actions.edit || "Edit"}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      type="button"
                      className="text-[#EF4444] hover:text-[#DC2626] transition-colors cursor-pointer"
                      onClick={() => handleDeleteVoucher(voucher.rawId || voucher.id)}
                      aria-label={actions.delete}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 border-t border-[#F485251A] pt-3">
                  <div className="flex flex-row gap-2 justify-between items-center">
                    <p className="text-sm text-[#6B7C93]">{mobileLabels.discount}</p>
                    <span className="inline-flex rounded bg-[#FFF7ED] px-2.5 py-1 text-sm font-semibold text-[#F58626]">
                      {voucher.discount}
                    </span>
                  </div>

                  <div>
                    <div className="flex flex-row gap-2 justify-between items-center">
                      <p className="text-sm text-[#6B7C93]">{mobileLabels.usageCount}</p>
                      <div className="max-w-40">
                        <ProgressBar used={voucher.used} total={voucher.total} />
                      </div>
                    </div>

                    <div className="flex flex-row gap-2 justify-between items-center pt-3">
                      <p className="text-sm text-[#6B7C93]">{mobileLabels.status}</p>
                      <StatusBadge status={voucher.status} statusText={statusText} />
                    </div>

                    <div className="flex flex-row gap-2 justify-between items-center pt-3">
                      <p className="text-sm text-[#6B7C93]">{mobileLabels.expiryDate}</p>
                      <p className="text-sm font-semibold text-[#111827] text-right">
                        {voucher.expires}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    {/* <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded bg-[#F1F5F9] px-3 py-2 text-sm font-semibold text-[#F58626] cursor-pointer"
                      onClick={() => handleViewVoucher(voucher.rawId || voucher.id)}
                    >
                      <Eye size={16} />
                      {actions.view}
                    </button> */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="text-[#111827] hover:text-[#F58626] transition-colors cursor-pointer"
                        onClick={() => handleEditVoucher(voucher)}
                        aria-label={actions.edit || "Edit"}
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        type="button"
                        className="text-[#EF4444] hover:text-[#DC2626] transition-colors cursor-pointer"
                        onClick={() => handleDeleteVoucher(voucher.rawId || voucher.id)}
                        aria-label={actions.delete}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

         

          <Pagination
            currentPage={resolvedCurrentPage}
            totalPages={resolvedTotalPages}
            onPageChange={loadVouchers}
            totalItems={paginationInfo.totalItems}
            itemsPerPage={10}
          />
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [activeVoucher, setActiveVoucher] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSetPage = (newPage) => {
    setPage(newPage);
  };

  useEffect(() => {
    const mode = location.state?.mode;

    if (mode === "create") {
      setActiveVoucher(null);
      setPage("new-voucher");
      navigate(ROUTES.ADMIN_MARKETPLACE_ORDERS, { replace: true, state: {} });
      return;
    }

    if (mode === "edit" && location.state?.voucher) {
      setActiveVoucher(location.state.voucher);
      setPage("edit-voucher");
      navigate(ROUTES.ADMIN_MARKETPLACE_ORDERS, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  if (page === "new-voucher") {
    return (
      <VoucherCreationPage
        onBack={() => handleSetPage("dashboard")}
        translationKey="admin.vouchers.newVoucherPage"
      />
    );
  }

  if (page === "edit-voucher") {
    return (
      <VoucherCreationPage
        onBack={() => handleSetPage("dashboard")}
        translationKey="admin.vouchers.newVoucherPage"
        editVoucher={activeVoucher}
      />
    );
  }

  return (
    <DashboardPage
      onNewVoucher={() => {
        setActiveVoucher(null);
        handleSetPage("new-voucher");
      }}
      onEditVoucher={(voucher) => {
        setActiveVoucher(voucher);
        handleSetPage("edit-voucher");
      }}
    />
  );
}