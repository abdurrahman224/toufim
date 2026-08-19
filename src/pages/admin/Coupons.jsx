import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Copy,
  ChevronDown,
  ListFilter,
  Mail,
  MoreVertical,
  Phone,
  Tag,
  Ticket,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { Pagination, usePagination } from "../../components/Pagination";
import httpMethods from "../../services/httpMethods";
import API_ENDPOINTS from "../../services/httpEndpoint";

const DUTCH_MONTH_MAP = {
  jan: 0,
  januari: 0,
  feb: 1,
  februari: 1,
  mrt: 2,
  maart: 2,
  apr: 3,
  april: 3,
  mei: 4,
  jun: 5,
  juni: 5,
  jul: 6,
  juli: 6,
  aug: 7,
  augustus: 7,
  sep: 8,
  sept: 8,
  september: 8,
  okt: 9,
  oktober: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

const ICON_MAP = {
  Ticket,
  Users,
  Wallet,
};

const STATUS_CLASS = {
  paid: "bg-[#DCFCE7] text-[#166534]",
  refunded: "bg-[#F1F5F9] text-[#1E293B]",
};

const normalizeLabel = (value = "") => String(value).trim().toLowerCase();

const parsePurchaseDate = (purchaseDate) => {
  const match = String(purchaseDate)
    .trim()
    .match(/^(\d{1,2})\s+([^.\s]+)\.?\s+(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/i);

  if (!match) {
    return null;
  }

  const [, day, monthToken, year, hours = "0", minutes = "0"] = match;
  const monthIndex = DUTCH_MONTH_MAP[normalizeLabel(monthToken)];

  if (monthIndex === undefined) {
    return null;
  }

  return new Date(
    Number(year),
    monthIndex,
    Number(day),
    Number(hours),
    Number(minutes)
  );
};

const getRowDateValue = (purchaseDate) => {
  const parsedDate = parsePurchaseDate(purchaseDate);

  if (!parsedDate) {
    return "";
  }

  return parsedDate.toISOString().slice(0, 10);
};

const getRowTimeValue = (purchaseDate) => {
  const parsedDate = parsePurchaseDate(purchaseDate);

  if (!parsedDate) {
    return "";
  }

  return `${String(parsedDate.getHours()).padStart(2, "0")}:${String(
    parsedDate.getMinutes()
  ).padStart(2, "0")}`;
};

const formatCount = (value) => {
  if (value === null || value === undefined) return "0";
  if (typeof value === "string") return value;
  if (Number.isNaN(value)) return "0";

  return new Intl.NumberFormat("nl-NL").format(value);
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "0";
  if (typeof value === "string") return value;
  if (Number.isNaN(value)) return "0";

  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercent = (value) => {
  if (value === null || value === undefined) return "0%";
  if (typeof value === "string") return value;
  if (Number.isNaN(value)) return "0%";

  return `${value}%`;
};

const formatShortDate = (purchaseDate) => {
  const parsed = parsePurchaseDate(purchaseDate);
  if (!parsed) return "";
  const day = parsed.getDate();
  const monthNames = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  return `${day} ${monthNames[parsed.getMonth()]}.`;
};

const formatShortDateISO = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  const day = parsed.getDate();
  const monthNames = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  return `${day} ${monthNames[parsed.getMonth()]}.`;
};

const truncateInstagram = (value = "", maxLength = 7) => {
  const text = String(value);
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

const dedupeRows = (items = []) => {
  const seen = new Set();
  return items.filter((row) => {
    const key = row?.id || row?.participant?.email || row?.couponNo;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const buildFilterItems = (filters) => {
  const statusLabel =
    filters?.find((item) => /status/i.test(String(item.label || "")))?.label ||
    "Status";
  const dateLabel =
    filters?.find((item) => item.type === "date")?.label || "Purchase date";

  return [
    { id: "status", label: statusLabel, type: "select" },
    { id: "purchaseDate", label: dateLabel, type: "date" },
  ];
};

const applyLocalFilters = (items, filters, filterItems) => {
  let filtered = [...items];
  const dateRange = filters.dateRange || {};

  const statusFilterItem = filterItems.find((item) =>
    /status/i.test(String(item.label || ""))
  );
  const statusKey = statusFilterItem ? String(statusFilterItem.id) : null;
  const statusValue = statusKey ? filters[statusKey] : null;

  if (statusFilterItem && statusValue && statusValue !== statusFilterItem.label) {
    filtered = filtered.filter((row) =>
      String(row.status || "")
        .toLowerCase()
        .includes(String(statusValue).toLowerCase())
    );
  }

  if (dateRange.startDate) {
    filtered = filtered.filter((row) => {
      const rowDateValue = getRowDateValue(row.purchaseDate);
      return rowDateValue && rowDateValue >= dateRange.startDate;
    });
  }

  if (dateRange.endDate) {
    filtered = filtered.filter((row) => {
      const rowTimeValue = getRowTimeValue(row.purchaseDate);
      return rowTimeValue && rowTimeValue >= dateRange.endDate;
    });
  }

  return filtered;
};

const generateCouponCodes = (couponNo, qty, purchaseDate) => {
  const raw = couponNo.replace("#", "");
  const match = raw.match(/^([A-Z]+-)(\d+)$/);
  const count = Math.min(Math.max(parseInt(qty, 10) || 1, 1), 4);
  const shortDate = formatShortDate(purchaseDate);

  if (!match) {
    return Array.from({ length: count }, () => ({ code: raw, date: shortDate }));
  }

  const prefix = match[1];
  const baseNum = parseInt(match[2], 10);

  return Array.from({ length: count }, (_, i) => ({
    code: `${prefix}${String(baseNum + i).padStart(4, "0")}`,
    date: shortDate,
  }));
};

const CouponDetailModal = ({ row, onClose }) => {
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const coupons = detailData?.orders?.length
    ? detailData.orders.flatMap((order) => {
        const createdAtValue = order.createdAt || order.purchaseDate;
        const createdAt = formatShortDateISO(createdAtValue);
        const orderCoupons = order.coupons || [];

        if (orderCoupons.length) {
          return orderCoupons.map((coupon) => ({
            code: coupon.couponCode || coupon.code || "",
            createdAt: formatShortDateISO(coupon.createdAt || createdAtValue),
          }));
        }

        const codes = order.couponCodes || order.couponCode || [];
        const normalizedCodes = Array.isArray(codes) ? codes : [codes];
        return normalizedCodes.length && normalizedCodes[0]
          ? normalizedCodes.map((code) => ({ code, createdAt }))
          : [{ code: "", createdAt }];
      })
    : detailData?.coupons?.length
      ? detailData.coupons.map((coupon) => ({
          code: coupon.couponCode || coupon.code || "",
          createdAt: formatShortDateISO(coupon.createdAt || coupon.purchaseDate),
        }))
      : detailData?.couponCodes?.length
        ? detailData.couponCodes.map((code) => ({ code, createdAt: "" }))
        : row?.couponCodes?.length
          ? row.couponCodes.map((code) => ({
              code,
              createdAt: formatShortDateISO(row.createdAt || row.purchaseDate),
            }))
          : generateCouponCodes(row.couponNo, row.qty, row.purchaseDate).map(
              (coupon) => ({ code: coupon.code, createdAt: coupon.date })
            );
  const [copiedCoupon, setCopiedCoupon] = useState("");
  const avatarSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    row.participant.name
  )}&background=DAE2FF&color=0040A2&size=128`;

  useEffect(() => {
    const fetchDetails = async () => {
      if (!row?.participant?.email) return;
      setDetailLoading(true);
      const { data: response, error } = await httpMethods.get(
        API_ENDPOINTS.ADMIN_COUPONS.BY_EMAIL(row.participant.email)
      );

      if (error) {
        setDetailLoading(false);
        return;
      }

      const payload = response?.data?.data ?? response?.data ?? response;
      const participantDetail = payload?.orders
        ? payload
        : payload?.participant ??
          (Array.isArray(payload?.participants) ? payload.participants[0] : null) ??
          payload?.data?.participant ??
          payload?.data ??
          payload;

      setDetailData(participantDetail || null);
      setDetailLoading(false);
    };

    fetchDetails();
  }, [row?.participant?.email]);

  const handleCopyCoupon = async (couponCode) => {
    const safeCode = String(couponCode || "").trim();
    if (!safeCode) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(safeCode);
      } else {
        const tempInput = document.createElement("textarea");
        tempInput.value = safeCode;
        tempInput.setAttribute("readonly", "");
        tempInput.style.position = "absolute";
        tempInput.style.left = "-9999px";
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
      }

      setCopiedCoupon(safeCode);
      setCopyMessage(`Copied ${safeCode}`);
      window.setTimeout(() => {
        setCopiedCoupon((prev) => (prev === safeCode ? "" : prev));
        setCopyMessage("");
      }, 1200);
    } catch (error) {
      setCopiedCoupon("");
      setCopyMessage("Copy failed");
      window.setTimeout(() => setCopyMessage(""), 1200);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Sluiten"
          className="absolute top-4 right-4 inline-flex h-8 w-8 items-center justify-center rounded-full  hover:bg-[#F1F5F9] text-[#0F172A] transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="p-4 ">
          <div className="flex items-center gap-4">
            <div className="h-18 w-18 shrink-0 overflow-hidden rounded-full border border-[#F485251A] bg-[#E2E8F0]">
              <img
                src={avatarSrc}
                alt={row.participant.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-[#0F172A]">
                  {detailData?.fullName || row.participant?.name || "-"}
                </h2>
                <span className="rounded-full bg-[#FFF2E5] px-2.5 py-0.5 text-xs font-semibold text-[#F48525]">
                  Nieuw
                </span>
              </div>
              <div className="mt-1 flex flex-col gap-0.5">
                <span className="inline-flex items-center gap-1.5 text-sm text-[#5C5F60]">
                  <Mail size={13} className="shrink-0" />
                  {detailData?.email || row.participant?.email || "-"}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-[#5C5F60]">
                  <Phone size={13} className="shrink-0" />
                  {detailData?.phone || "-"}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-[#5C5F60]">
                  <Users size={13} className="shrink-0" />
                  {detailData?.instagram || row.instagram || "-"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-[#F485251A] p-4 md:p-6">
            <div>
              <p className="text-lg leading-none font-semibold  text-[#0F172A]">
                couponCode
              </p>

              <div className="mt-6 grid max-h-80 grid-cols-2 gap-4 overflow-y-auto pr-2">
                {coupons.map((coupon, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-2xl border border-[#F485251A] bg-[#FCFDFE] px-3 md:px-5 py-5"
                  >
                    <div className="flex items-center gap-3">
                      <Tag size={22} className="text-[#98A5B5]" strokeWidth={1.8} />

                      <div>
                        <p className="text-sm  md:text-base leading-none font-semibold text-[#F4A460]">
                          {coupon.code || "-"}
                        </p>
                        <p className="mt-1 text-sm  md:text-base leading-none font-semibold uppercase text-[#BCC6D2]">
                          CREATED AT
                        </p>
                        <p className="mt-1 text-sm  md:text-base leading-none font-medium uppercase text-[#AEB8C5]">
                          {coupon.createdAt || "-"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label={`Kopieer ${coupon.code}`}
                      onClick={() => handleCopyCoupon(coupon.code)}
                      className={`inline-flex h-6 md:h-8 w-6 md:w-8 items-center justify-center transition-colors cursor-pointer ${
                        copiedCoupon === coupon.code
                          ? "text-[#F4A460]"
                          : "text-[#D4DCE5] hover:text-[#BFCAD8]"
                      }`}
                      disabled={!coupon.code}
                    >
                      <Copy size={22} strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {copyMessage ? (
              <p className="mt-4 text-sm font-semibold text-[#16A34A]">
                {copyMessage}
              </p>
            ) : null}

            {detailLoading ? (
              <p className="mt-4 text-sm text-[#94A3B8]">Loading details...</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ stat }) => {
  const Icon = ICON_MAP[stat.icon] || Ticket;

  return (
    <article className="rounded-xl border border-[#F485251A] bg-white px-5 py-5">
      <div className="flex items-center justify-between">
        <p className="text-base font-medium text-[#64748B]">{stat.label}</p>
        <span className="inline-flex h-7 md:h-10 w-7  md:w-10 items-center justify-center rounded-md bg-[#FFF2E5] text-[#F58626]">
          <Icon size={22} aria-hidden="true" />
        </span>
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <p className="text-2xl md:text-3xl leading-none font-bold text-[#0F172A]">
          {stat.value}
        </p>
        <span className="pt-1 text-[13px] font-bold text-[#16A34A]">
        
        </span>
      </div>

      {stat.progress ? (
        <div className="mt-4 h-2.5 rounded-full bg-[#EAF0F6]">
          <div
            className="h-2.5 rounded-full bg-[#F58626]"
            style={{ width: `${stat.progress}%` }}
          />
        </div>
      ) : null}

      {stat.avatars ? (
        <div className="mt-4 flex items-center gap-[-5.5]">
          {stat.avatars.map((color, index) => (
            <span
              key={`${color}-${index}`}
              className="h-4 w-4 rounded-full border border-[#F485251A]"
              style={{ backgroundColor: color }}
            />
          ))}
          <span className="rounded-full bg-[#FFE4CC] px-1.5 py-0.5 text-[10px] font-bold text-[#EA7A1C]">
            {"2k"}
          </span>
        </div>
      ) : null}

      {stat.meta ? (
        <p className="mt-4 text-sm text-[#94A3B8]">{stat.meta}</p>
      ) : null}
    </article>
  );
};

const FilterButton = ({ item, value, options = [], onValueChange, onDateChange, dateValue }) => {
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

  if (item.type === "date") {
    return (
      <div className="inline-flex items-center gap-2">
        <input
          type="date"
          value={dateValue?.startDate || ""}
          onChange={(e) =>
            onDateChange({ ...dateValue, startDate: e.target.value })
          }
          className="h-10 rounded-lg border border-[#F485251A] bg-[#F8FAFC] px-3 text-[14px] md:text-base text-[#0F172A]"
        />
        {/* <input
          type="time"
          value={dateValue?.endDate || ""}
          onChange={(e) =>
            onDateChange({ ...dateValue, endDate: e.target.value })
          }
          className="h-10 rounded-lg border border-[#F485251A] bg-[#F8FAFC] px-3 text-[14px] md:text-base text-[#0F172A]"
        /> */}
      </div>
    );
  }

  const selectedLabel = value === item.label ? item.label : value;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center justify-between gap-2 h-10 w-45 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-[14px] md:text-base font-medium text-[#0F172A]  hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <span>{selectedLabel}</span>
        <ChevronDown
          size={16}
          className={`text-[#64748B] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && options.length > 0 && (
        <div className="absolute left-0 top-full mt-1 z-50 min-w-full rounded-xl border border-[#E2E8F0] bg-white shadow-lg overflow-hidden">
          <button
            type="button"
            onClick={() => { onValueChange(item.id, item.label); setOpen(false); }}
            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[#FFF7ED] hover:text-[#F48525] ${value === item.label ? "text-[#F48525] bg-[#FFF7ED]" : "text-[#0F172A]"}`}
          >
            {item.label}
          </button>
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => { onValueChange(item.id, option); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[#FFF7ED] hover:text-[#F48525] ${value === option ? "text-[#F48525] bg-[#FFF7ED]" : "text-[#0F172A]"}`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Coupons = () => {
  const { t } = useTranslation();
  const data = t("admin.coupons", { returnObjects: true });
  const { mobileLabels } = data.table;
  const filterItems = buildFilterItems(data.filters.items);
  
  const [overviewStats, setOverviewStats] = useState({
    totalDiscountsApplied: 0,
    activeVouchers: 0,
    averageDiscountPerOrder: 0,
    ordersUsingVouchers: 0,
  });
  const [apiFilters, setApiFilters] = useState(null);
  const [hasApiPagination, setHasApiPagination] = useState(false);
  const [filterValues, setFilterValues] = useState(() =>
    Object.fromEntries(
      filterItems
        .filter((item) => item.type !== "date")
        .map((item) => [item.id, item.id === "status" ? "All" : item.label])
    )
  );
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [selectedRow, setSelectedRow] = useState(null);
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [paginationInfo, setPaginationInfo] = useState({
    totalPages: 1,
    currentPage: 1,
    totalItems: 0,
  });

  // Fetch coupon data with filters
  const loadCouponData = async (page = 1, filters = {}) => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams();
      
      // Add pagination
      params.append("page", page);
      params.append("limit", 6);

      const statusValue = filters.status;
      if (statusValue && statusValue !== "All") {
        params.append("status", statusValue);
      }

      if (filters.dateRange?.startDate) {
        params.append("purchaseDate", filters.dateRange.startDate);
      }

      const queryString = params.toString();
      const url = queryString 
        ? `${API_ENDPOINTS.ADMIN_COUPONS.LIST}?${queryString}`
        : API_ENDPOINTS.ADMIN_COUPONS.LIST;

      const { data: response, error } = await httpMethods.get(url);

      if (error) {
        console.warn("API Error:", error);
        // No fallback data - show empty state
        setRows([]);
        setPaginationInfo({
          totalPages: 1,
          currentPage: page,
          totalItems: 0,
        });
        return;
      }

      const payload = response?.data?.data ?? response?.data ?? response;
      const responseFilters = payload?.filters ?? null;
      const pagination =
        response?.pagination ?? response?.data?.pagination ?? payload?.pagination;
      const hasPagination = Boolean(
        pagination &&
          (pagination.totalPages || pagination.currentPage || pagination.totalItems)
      );

      // Transform API response to component structure
      let transformedCoupons = [];
      
      if (payload?.participants && Array.isArray(payload.participants)) {
        // Show one row per participant
        transformedCoupons = payload.participants.map((participant) => {
          const orders = Array.isArray(participant.orders)
            ? participant.orders
            : [];
          const couponCodes = orders.flatMap((order) => order.couponCodes || []);
          const primaryCode = couponCodes[0] || "-";
          const latestPurchase = orders
            .map((order) => order.purchaseDate)
            .filter(Boolean)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

          return {
            id: participant.email,
            couponNo: primaryCode === "-" ? "-" : `#${primaryCode}`,
            participant: {
              name: participant.fullName,
              initials: participant.initials,
              email: participant.email,
            },
            instagram: participant.instagram,
            purchaseDate: latestPurchase
              ? new Date(latestPurchase).toLocaleDateString("nl-NL", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A",
            qty: participant.totalCoupons ?? couponCodes.length ?? 0,
            total: `€${participant.totalSpent ?? 0}`,
            status: participant.status || "UNKNOWN",
            couponCodes,
            createdAt: latestPurchase || null,
            actionAria: "Actions for coupon",
          };
        });
      } else if (payload?.coupons && Array.isArray(payload.coupons)) {
        // Fallback if API returns direct coupons array
        transformedCoupons = payload.coupons;
      } else if (Array.isArray(payload)) {
        // Fallback if payload is directly an array
        transformedCoupons = payload;
      }

      setRows(dedupeRows(transformedCoupons));

      if (responseFilters && Object.keys(responseFilters).length > 0) {
        setApiFilters(responseFilters);
      } else {
        setApiFilters(null);
      }

      setHasApiPagination(hasPagination);

      // Handle pagination from API if provided
      if (hasPagination) {
        setPaginationInfo({
          totalPages: pagination.totalPages || 1,
          currentPage: pagination.currentPage || page,
          totalItems: pagination.totalItems || transformedCoupons.length || 0,
        });
      } else {
        // Calculate pagination based on transformed coupons
        setPaginationInfo({
          totalPages: Math.max(1, Math.ceil(transformedCoupons.length / 6)),
          currentPage: page,
          totalItems: transformedCoupons.length,
        });
      }
    } catch (err) {
      console.error("Error loading coupon data:", err);
      // No fallback data - show empty state
      setRows([]);
      setPaginationInfo({
        totalPages: 1,
        currentPage: page,
        totalItems: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load overview stats
  useEffect(() => {
    let isMounted = true;

    const loadOverview = async () => {
      const { data: response, error } = await httpMethods.get(
        API_ENDPOINTS.ADMIN_COUPONS.OVERVIEW
      );

      if (!isMounted) return;
      if (error) return;

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

  // Load coupon data on mount and when filters change
  useEffect(() => {
    loadCouponData(1, { ...filterValues, dateRange });
  }, []);

  useEffect(() => {
    if (!apiFilters) return;

    const statusItem = filterItems.find((item) => item.id === "status");
    const nextValues = { ...filterValues };
    let shouldUpdateFilters = false;

    if (statusItem && apiFilters.status) {
      if (nextValues[statusItem.id] !== apiFilters.status) {
        nextValues[statusItem.id] = apiFilters.status;
        shouldUpdateFilters = true;
      }
    }

    if (shouldUpdateFilters) {
      setFilterValues(nextValues);
    }

    const nextStartDate = apiFilters.purchaseDate || dateRange.startDate;

    if (nextStartDate !== dateRange.startDate) {
      setDateRange({ startDate: nextStartDate || "", endDate: "" });
    }
  }, [apiFilters, filterItems, filterValues, dateRange]);

  const resolvedStats = (data.stats || []).map((stat) => {
    if (stat.id === "totalDiscountsApplied") {
      return {
        ...stat,
        value: formatCurrency(overviewStats.totalDiscountsApplied),
      };
    }

    if (stat.id === "activeVouchers") {
      return {
        ...stat,
        value: formatCount(overviewStats.activeVouchers),
      };
    }

    if (stat.id === "averageDiscountPerOrder") {
      return {
        ...stat,
        value: formatCurrency(overviewStats.averageDiscountPerOrder),
      };
    }

    if (stat.id === "ordersUsingVouchers") {
      return {
        ...stat,
        value: formatCount(overviewStats.ordersUsingVouchers),
      };
    }

    return stat;
  });

  const activeFilterItems = filterItems;

  const filterOptions = Object.fromEntries(
    activeFilterItems
      .filter((item) => item.type !== "date")
      .map((item) => {
        if (item.id === "status") {
          return [
            item.id,
            ["All", ...new Set(rows.map((row) => row.status).filter(Boolean))],
          ];
        }

        return [item.id, []];
      })
  );

  // Use API pagination if available
  const pagination = usePagination(rows, 6);
  const currentPage = hasApiPagination
    ? paginationInfo.currentPage || 1
    : pagination.currentPage;
  const totalPages = hasApiPagination
    ? paginationInfo.totalPages || 1
    : pagination.totalPages;
  const visibleRows = hasApiPagination ? rows : pagination.paginatedData;
  
  const handlePageChange = async (newPage) => {
    if (hasApiPagination) {
      await loadCouponData(newPage, { ...filterValues, dateRange });
      return;
    }
    pagination.handlePageChange(newPage);
  };

  const handleDateChange = async (newDateRange) => {
    setDateRange(newDateRange);
    await loadCouponData(1, { ...filterValues, dateRange: newDateRange });
    if (!hasApiPagination) {
      pagination.handlePageChange(1);
    }
  };

  const handleFilterValueChange = async (filterId, nextValue) => {
    const newFilterValues = {
      ...filterValues,
      [filterId]: nextValue,
    };
    setFilterValues(newFilterValues);
    await loadCouponData(1, { ...newFilterValues, dateRange });
    if (!hasApiPagination) {
      pagination.handlePageChange(1);
    }
  };

  const handleClearFilters = async () => {
    const clearedValues = Object.fromEntries(
      activeFilterItems
        .filter((item) => item.type !== "date")
        .map((item) => [item.id, item.id === "status" ? "All" : item.label])
    );
    setFilterValues(clearedValues);
    setDateRange({ startDate: "", endDate: "" });
    await loadCouponData(1, { ...clearedValues, dateRange: { startDate: "", endDate: "" } });
    if (!hasApiPagination) {
      pagination.handlePageChange(1);
    }
  };

  return (
    <section className="w-full">
      <header className="border-b border-[#F485251A] pb-3">
        <h1 className="text-2xl md:text-4xl leading-none font-black text-[#0F172A]">
          {data.header.title}
        </h1>
        <p className="mt-2  text-base  md:text-lg leading-7 text-[#708399]">
          {data.header.subtitle}
        </p>
      </header>

      <section className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-4">
        {resolvedStats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </section>

      <section className="mt-5 rounded-xl border border-[#F485251A] bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* <div className="flex flex-wrap items-center gap-3">
            <p className="inline-flex items-center gap-2 text-base font-bold text-[#0F172A]">
              <ListFilter
                size={18}
                className="text-[#94A3B8]"
                aria-hidden="true"
              />
              <span>{data.filters.title}</span>
            </p>

                {activeFilterItems.map((item) => (
                <FilterButton
                  key={item.id}
                  item={item}
                  value={filterValues[item.id] || item.label}
                  options={filterOptions[item.id] || []}
                  onValueChange={handleFilterValueChange}
                  onDateChange={handleDateChange}
                  dateValue={dateRange}
                />
              ))}
          </div> */}

          {/* <button
            type="button"
            onClick={handleClearFilters}
            className="text-[14px] font-semibold leading-4 text-[#F48525] hover:underline cursor-pointer"
          >
            {data.filters.clear}
          </button> */}
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-xl border border-[#F485251A] bg-white">
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#F48525]"></div>
              <p className="mt-4 text-[#64748B] font-medium">Loading coupons...</p>
            </div>
          </div>
        )}

        {/* Desktop Table View */}
        {!isLoading && (
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-280 w-full">
            <thead>
              <tr className="border-b border-[#F485251A] bg-[#fef9f4]">
                {data.table.columns
                  .filter((col) => !/status/i.test(String(col)))
                  .map((column) => (
                    <th
                      key={column}
                      className={`px-4 py-4 text-base font-semibold text-[#667A92] ${
                        String(column).trim().toUpperCase() === "AANTAL"
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
              {visibleRows.length > 0 ? (
                visibleRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[#F485251A] last:border-b-0"
                  >
                    <td className="px-4 py-4">
                      <span className="text-[16px] font-bold text-[#F48525]">
                        {row.couponNo}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2.5 -3">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F1F5F9]  text-[10px] font-bold text-slate-700">
                          {row.participant?.initials || "N/A"}
                        </span>
                        <span className="text-[16px] font-semibold text-[#0F172A]">
                          {row.participant?.name || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[16px] text-[#475569]">
                      {truncateInstagram(row.instagram || "") || "N/A"}
                    </td>
                    <td className="px-4 py-4 text-[16px] text-[#475569]">
                      {row.purchaseDate || "N/A"}
                    </td>
                    <td className="px-4 py-4 text-[16px] font-semibold text-[#0F172A] text-center">
                      {row.qty || 0}
                    </td>
                    <td className="px-4 py-4 text-base font-semibold text-[#0F172A]">
                      {row.total || "€0"}
                    </td>
                    {/* Status column removed as requested */}
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        aria-label={row.actionAria || "View details"}
                        onClick={() => setSelectedRow(row)}
                        className="text-[#F48525]  font-semibold text-base hover:underline cursor-pointer"
                      >
                        {data.table.detailButton || "Details"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#94A3B8]">
                    No coupons found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}

        {/* Mobile view */}
        {!isLoading && (
        <div className="md:hidden space-y-3 p-3">
          {visibleRows.length > 0 ? (
            visibleRows.map((row) => (
              <div
                key={row.id}
                className="rounded-lg border border-[#F485251A] bg-[#FCFDFE] p-4 relative shadow-lg"
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E2E8F0] text-sm font-bold text-[#334155]">
                      {row.participant?.initials || "N/A"}
                    </span>
                    <div>
                      <p className="text-base font-semibold text-[#111827]">
                        {row.participant?.name || "Unknown"}
                      </p>
                      <p className="text-sm text-[#8191A6]">
                        {truncateInstagram(row.instagram || "") || "N/A"}
                      </p>
                    </div>
                  </div>

                  <button className="text-[#94A3B8] cursor-pointer">
                    <MoreVertical size={18} />
                  </button>
                </div>

                <div className="space-y-3 border-t border-[#F485251A] pt-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-[#6B7C93]">{mobileLabels?.couponNo || "Coupon No"}</p>
                    <p className="text-sm font-bold text-[#F58626]">
                      {row.couponNo || "N/A"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-[#6B7C93]">{mobileLabels?.purchaseDate || "Purchase Date"}</p>
                    <p className="text-sm font-semibold text-[#111827] text-right">
                      {row.purchaseDate || "N/A"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-[#6B7C93]">{mobileLabels?.qty || "Quantity"}</p>
                    <p className="text-sm font-semibold text-[#111827]">
                      {row.qty || 0}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-[#6B7C93]">{mobileLabels?.total || "Total"}</p>
                    <p className="text-base font-bold text-[#0F172A]">
                      {row.total || "€0"}
                    </p>
                  </div>

                  {/* Status block removed from mobile view as requested */}

                  <button
                    type="button"
                    aria-label={row.actionAria || "View details"}
                    onClick={() => setSelectedRow(row)}
                    className="mt-2 w-full rounded bg-[#F1F5F9] py-2 text-sm font-semibold text-[#F58626] cursor-pointer"
                  >
                    {data.table.detailButton || "Details"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-[#94A3B8]">
              No coupons found
            </div>
          )}
        </div>
        )}
        
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={hasApiPagination ? paginationInfo.totalItems : rows.length}
          itemsPerPage={6}
        />
      </section>

      {selectedRow && (
        <CouponDetailModal row={selectedRow} onClose={() => setSelectedRow(null)} />
      )}
    </section>
  );
};

export default Coupons;
