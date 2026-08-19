import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CalendarClock,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Gauge,
  Mail,
  MessageCircle,
  MoreVertical,
  Plus,
  Rocket,
  Share2,
  Ticket,
  Trash2,
  Trophy,
  Upload,
  UserCircle2,
  Users,
  Wallet,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Forward,
  CornerUpLeft,
  Edit3,
  Award,
  ChevronRight,
  ArrowLeft,
  SquarePen,
  ImagePlus,
  Calculator,
  RefreshCw,
  Eye,
  X,
} from "lucide-react";
import { API_CONFIG, ROUTES } from "../../config";
import { SharedGiveawayCampaignPage } from "../../components/SharedGiveawayCampaignPage";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import GiveawayBuyers from "./GiveawayBuyers";
import httpMethods from "../../services/httpMethods";
import API_ENDPOINTS from "../../services/httpEndpoint";

const ICON_MAP = {
  Wallet,
  Ticket,
  Clock3,
  TrendingUp,
};

const TREND_TONE_CLASS = {
  positive: "text-[#08A045]",
  alert: "text-[#E11D48]",
};

const normalizeGiveawayOverview = (payload) => {
  const raw = payload?.data ?? payload;
  const data = raw?.data ?? raw;
  const upcomingDraws = Array.isArray(data?.upcomingDraws)
    ? data.upcomingDraws[0]
    : data?.upcomingDraws;

  return {
    totalRevenue: data?.totalRevenue ?? null,
    totalTicketsSold: data?.totalTicketsSold ?? null,
    daysRemaining: upcomingDraws?.daysRemaining ?? null,
  };
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

const formatCount = (value) => {
  if (value === null || value === undefined) return "0";
  if (typeof value === "string") return value;
  if (Number.isNaN(value)) return "0";

  return new Intl.NumberFormat("nl-NL").format(value);
};

const formatDaysRemaining = (value) => {
  if (value === null || value === undefined) return "0 day";
  if (typeof value === "string") return value;
  if (Number.isNaN(value)) return "0 day";

  return `${value} day`;
};

const formatDateShort = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "medium",
  }).format(date);
};

const normalizeActiveGiveaway = (payload) => {
  const raw = payload?.data ?? payload;
  const data = raw?.data ?? raw;
  const nestedList = data?.data ?? data?.results ?? data?.items ?? data?.list;
  const list = Array.isArray(data)
    ? data
    : Array.isArray(nestedList)
      ? nestedList
      : data?.giveaways || data?.rows || [];
  const first = Array.isArray(list) ? list[0] : data?.giveaway || data;

  return {
    id: first?.id ?? first?._id ?? first?.giveawayId ?? null,
    status: first?.status ?? null,
    title: first?.title ?? null,
    description: first?.description ?? null,
    bannerImage: first?.bannerImage ?? first?.banner ?? first?.image ?? null,
    updatedAt: first?.updatedAt ?? first?.createdAt ?? null,
    ticketsSold:
      first?.ticketsSold ??
      first?.soldTickets ??
      first?.tickets_sold ??
      null,
    totalTickets:
      first?.totalTickets ??
      first?.total_tickets ??
      first?.total ??
      null,
    stats: first?.stats ?? first?.analytics ?? null,
    recentPurchasers:
      first?.recentPurchasers ||
      first?.purchasers ||
      data?.recentPurchasers ||
      data?.purchasers ||
      [],
  };
};

const normalizeGiveawayList = (payload) => {
  const raw = payload?.data ?? payload;
  const data = raw?.data ?? raw;
  const nestedList = data?.data ?? data?.results ?? data?.items ?? data?.list;
  const list = Array.isArray(data)
    ? data
    : Array.isArray(nestedList)
      ? nestedList
      : data?.giveaways || data?.rows || [];

  return list.map((item, index) => ({
    id: item?.id ?? item?._id ?? item?.giveawayId ?? index,
    title: item?.title ?? item?.name ?? "—",
    bannerImage: item?.bannerImage ?? item?.banner ?? item?.image ?? null,
    status: item?.status ?? "—",
    createdAt: item?.createdAt ?? item?.created_at ?? item?.updatedAt ?? null,
    winnerFullName:
      item?.winner?.fullName ?? item?.winner?.name ?? item?.winnerFullName ?? "—",
    ticketsSold:
      item?.ticketsSold ?? item?.soldTickets ?? item?.tickets_sold ?? 0,
  }));
};

const getInitials = (name) => {
  if (!name) return "NA";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0].toUpperCase()).join("");
};

const resolveImageUrl = (url) => {
  if (!url) return null;

  const raw = String(url).trim();
  if (!raw) return null;

  const fixedProtocol = raw
    .replace(/^http:\/\//i, 'http://')
    .replace(/^https:\/\//i, 'https://');

  if (/^https?:\/\//i.test(fixedProtocol)) return fixedProtocol;

  const embeddedHttpIndex = fixedProtocol.search(/https?:\/\//i);
  if (embeddedHttpIndex > 0) {
    return fixedProtocol.slice(embeddedHttpIndex);
  }

  const baseUrl = API_CONFIG.BASE_URL || "";
  if (!baseUrl) return fixedProtocol;

  const trimmedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = fixedProtocol.startsWith("/")
    ? fixedProtocol
    : `/${fixedProtocol}`;

  return `${trimmedBase}${normalizedPath}`;
};

const StatCard = ({ item }) => {
  const Icon = ICON_MAP[item.icon] || Gauge;
  const TrendIcon = ICON_MAP[item.trendIcon];

  return (
    <article className="rounded-xl border border-[#F485251A] bg-white px-4 py-4.5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-base font-medium text-[#64748B]">{item.label}</p>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#FFF1E3] text-[#F48924]">
          <Icon size={22} aria-hidden="true" />
        </span>
      </div>

      <p className="mt-3 text-3xl leading-none font-bold tracking-[-0.02em] text-[#0F172A]">
        {item.value}
        {item.suffix ? (
          <span className="ml-1   text-[24px] font-semibold text-[#94A3B8]">
            {item.suffix}
          </span>
        ) : null}
      </p>

      {/* <p
        className={`mt-3 text-[14px] font-semibold flex items-center gap-1 ${
          TREND_TONE_CLASS[item.trendTone] || "text-[#08A045]"
        }`}
      >
        {TrendIcon ? <TrendIcon size={14} aria-hidden="true" /> : null}
        {item.trend}
      </p> */}
    </article>
  );
};

const CreateGiveawayPage = ({ onBack, giveawayId, onSuccess }) => {
  return (
    <SharedGiveawayCampaignPage
      translationKey="admin.createGiveaway"
      onBack={onBack}
      backLabel="Giveaway Management"
      giveawayId={giveawayId}
      onSuccess={onSuccess}
    />
  );
};

const Circle = ({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const ActionDropdown = ({ onDelete }) => {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const ref = useRef(null);
  const triggerRef = useRef(null);

  const updateMenuPosition = () => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 140;
    const menuHeight = 46;
    const spacing = 6;
    const canOpenDownward = window.innerHeight - rect.bottom >= menuHeight + spacing;

    const top = canOpenDownward
      ? rect.bottom + spacing
      : Math.max(spacing, rect.top - menuHeight - spacing);
    const left = Math.min(
      Math.max(spacing, rect.right - menuWidth),
      window.innerWidth - menuWidth - spacing
    );

    setOpenUpward(!canOpenDownward);
    setMenuPosition({ top, left });
  };

  useEffect(() => {
    if (!open) return;

    updateMenuPosition();

    const handleViewportChange = () => updateMenuPosition();
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [reloadKey]);

  return (
    <div className="relative" ref={ref}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center justify-center text-[#999] hover:text-[#0F172A] transition-colors cursor-pointer p-1"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div
          className={`fixed z-50 rounded-lg border border-[#E2E8F0] bg-white shadow-lg overflow-hidden min-w-[140px] ${
            openUpward ? "origin-bottom-right" : "origin-top-right"
          }`}
          style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
        >
          <button
            type="button"
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#DC2626] hover:bg-[#FEE2E2] transition-colors flex items-center gap-2"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};

const LaunchGiveawayPage = ({ onBack, giveawayId, campaign, stats, recentPurchasers = [] }) => {
  const { t } = useTranslation();
  const data = t("admin.launchGiveaway", { returnObjects: true });
    const campaignTitle = campaign?.title ?? "—";
    const campaignSubtitle = campaign?.description ?? "0";

    const resolvedLaunchStats = (data?.stats || []).map((stat) => {
      if (stat.id === "sold") {
        return {
          ...stat,
          value: formatCount(stats?.ticketsSold ?? 0),
        };
      }

      if (stat.id === "revenue") {
        return {
          ...stat,
          value: formatCurrency(stats?.totalRevenue ?? 0),
        };
      }

      return stat;
    });
  const [drawingState, setDrawingState] = useState("idle"); // idle, drawing, completed
  const [rollingNumber, setRollingNumber] = useState(".........");
  const [ticketNumber, setTicketNumber] = useState("#0582");
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [historyRows, setHistoryRows] = useState(data?.history?.rows || []);
  const [drawError, setDrawError] = useState("");
  const [isManualCodeOpen, setIsManualCodeOpen] = useState(false);
  const [manualCouponCode, setManualCouponCode] = useState("");
  const [isManualSaving, setIsManualSaving] = useState(false);
  const [winnerPayload, setWinnerPayload] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedBuyerTickets, setSelectedBuyerTickets] = useState(null);
  const winnerPayloadRef = useRef(null);
  const winnerFallbackRef = useRef(null);
  const winnerCardMeta = data.winner;
  const winnerUser = winnerPayload?.order?.user || winnerFallbackRef.current;
  const winnerName =
    winnerUser?.fullName || selectedWinner?.fullName || selectedWinner?.name || "—";
  const winnerEmail = winnerUser?.email || selectedWinner?.email || "";
  const winnerHandle =
    winnerUser?.instagramUsername ||
    winnerUser?.handle ||
    selectedWinner?.handle ||
    "";
  const winnerCouponCode = winnerPayload?.couponCode || selectedWinner?.couponCode;
  const displayTicketCode = winnerCouponCode || manualCouponCode || "—";
  const primaryAction = winnerCardMeta.buttons?.[0];
  const secondaryAction = winnerCardMeta.buttons?.[1];

  // Filter recent entries based on search query
  const filteredEntries =
    data?.recentEntries?.rows?.filter((row) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        row.number?.toLowerCase().includes(query) ||
        row.name?.toLowerCase().includes(query) ||
        row.date?.toLowerCase().includes(query) ||
        row.entries?.toLowerCase().includes(query) ||
        row.status?.toLowerCase().includes(query)
      );
    }) || [];

  const generateRollingCode = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let middle = "";
    for (let i = 0; i < 6; i += 1) {
      middle += letters[Math.floor(Math.random() * letters.length)];
    }
    const suffix = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
    return `GW-${middle}-${suffix}`;
  };

  const handleDrawWinner = () => {
    if (drawingState !== "idle") return;

    setDrawingState("drawing");
    setDrawError("");

    if (giveawayId) {
      console.log("[Giveaways] draw-winner giveawayId:", giveawayId);
      httpMethods
        .post(
          API_ENDPOINTS.ADMIN_GIVEAWAYS.DRAW_WINNER(giveawayId),
          null,
          { suppressToast: true }
        )
        .then(({ data: response, error }) => {
          console.log("[Giveaways] draw-winner response:", response);
          if (error) {
            const rawMessage = String(error.message || "");
            const friendlyMessage = rawMessage.includes(
              "No valid coupons available for this giveaway"
            )
              ? "No valid coupons available. Sell tickets before drawing a winner."
              : error.message || "Failed to draw winner";
            setDrawError("");
            toast.error(friendlyMessage);
            return;
          }
          const serverPayload = response || {};
          const payload =
            serverPayload?.data?.winnerCoupon ||
            serverPayload?.data?.giveaway?.winnerCoupon ||
            serverPayload?.winnerCoupon ||
            null;
          const resolvedPayload = payload;
          const fallbackWinner = serverPayload?.data?.winner || null;
          const resolvedWinnerUser = resolvedPayload?.order?.user || fallbackWinner;
          winnerPayloadRef.current = resolvedPayload;
          winnerFallbackRef.current = fallbackWinner;
          setWinnerPayload(resolvedPayload);

          if (resolvedWinnerUser || fallbackWinner) {
            setSelectedWinner({
              ...data.winner,
              fullName: resolvedWinnerUser?.fullName || data.winner.fullName,
              email: resolvedWinnerUser?.email || data.winner.email,
              handle:
                resolvedWinnerUser?.instagramUsername ||
                resolvedWinnerUser?.handle ||
                data.winner.handle,
              couponCode: resolvedPayload?.couponCode || fallbackWinner?.couponCode,
            });
          }
        });
    } else {
      setDrawError("");
      toast.error("Missing giveaway id");
    }

    // Rolling animation - 3 seconds with random numbers 1-9
    const duration = 3000; // 3 seconds
    const intervalTime = 100; // Update every 100ms
    const iterations = duration / intervalTime;
    let counter = 0;

    const interval = setInterval(() => {
      setRollingNumber(generateRollingCode());
      counter++;

      if (counter >= iterations) {
        clearInterval(interval);
        // Show winner after animation
        setRollingNumber(generateRollingCode());

        // Generate random ticket number
        const randomTicket = Math.floor(Math.random() * 9000) + 1000; // Random 1000-9999
        setTicketNumber(`#${randomTicket}`);

        setDrawingState("completed");
        const latestPayload = winnerPayloadRef.current;
        const latestFallback = winnerFallbackRef.current;
        if (latestPayload || latestFallback) {
          const winnerUser = latestPayload?.order?.user || latestFallback;
          setSelectedWinner({
            ...data.winner,
            fullName: winnerUser?.fullName || data.winner.fullName,
            email: winnerUser?.email || data.winner.email,
            handle:
              winnerUser?.instagramUsername ||
              winnerUser?.handle ||
              data.winner.handle,
            couponCode: latestPayload?.couponCode || latestFallback?.couponCode,
          });
        } else {
          setSelectedWinner(data.winner);
        }
      }
    }, intervalTime);
  };

  const handleDrawAgain = () => {
    setDrawingState("idle");
    setSelectedWinner(null);
    setWinnerPayload(null);
    winnerPayloadRef.current = null;
    setManualCouponCode("");
    setIsManualCodeOpen(false);
    setRollingNumber(".........");
    setTicketNumber("#0582");
  };

  const handleToggleManualCode = () => {
    setIsManualCodeOpen((prev) => !prev);
  };

  const handleApplyManualCode = async () => {
    const trimmed = manualCouponCode.trim();
    if (!trimmed) {
      toast.error("Enter a coupon code");
      return;
    }

    if (!giveawayId) {
      toast.error("Missing giveaway id");
      return;
    }

    if (isManualSaving) return;
    setIsManualSaving(true);

    const { data: response, error } = await httpMethods.post(
      API_ENDPOINTS.ADMIN_GIVEAWAYS.SELECT_WINNER(giveawayId),
      { couponCode: trimmed },
      { suppressToast: true }
    );

    if (error) {
      toast.error(error.message || "Failed to select winner");
      setIsManualSaving(false);
      return;
    }

    const serverPayload = response || {};
    const payload =
      serverPayload?.data?.winnerCoupon ||
      serverPayload?.data?.giveaway?.winnerCoupon ||
      serverPayload?.winnerCoupon ||
      null;
    const resolvedPayload = payload;
    const fallbackWinner = serverPayload?.data?.winner || null;
    const resolvedWinnerUser = resolvedPayload?.order?.user || fallbackWinner;
    winnerPayloadRef.current = resolvedPayload;
    winnerFallbackRef.current = fallbackWinner;
    setWinnerPayload(resolvedPayload);

    if (resolvedWinnerUser || fallbackWinner) {
      setSelectedWinner({
        ...data.winner,
        fullName: resolvedWinnerUser?.fullName || data.winner.fullName,
        email: resolvedWinnerUser?.email || data.winner.email,
        handle:
          resolvedWinnerUser?.instagramUsername ||
          resolvedWinnerUser?.handle ||
          data.winner.handle,
        couponCode: resolvedPayload?.couponCode || fallbackWinner?.couponCode,
      });
    }

    setManualCouponCode(trimmed);
    setSelectedWinner((prev) => ({
      ...data.winner,
      ...(prev || {}),
      couponCode: trimmed,
    }));
    setIsManualSaving(false);
  };

  const handleDeleteHistory = (id) => {
    setHistoryRows((prevRows) => prevRows.filter((row) => row.id !== id));
  };

  const handleViewTickets = (buyer) => {
    setSelectedBuyerTickets(buyer);
    setIsTicketModalOpen(true);
  };

  const handleCloseTicketModal = () => {
    setIsTicketModalOpen(false);
    setSelectedBuyerTickets(null);
  };

  // Format date for display
  const formatPurchaseDate = (date) => {
    if (!date) return "—";
    try {
      return new Intl.DateTimeFormat("nl-NL", {
        dateStyle: "medium",
      }).format(new Date(date));
    } catch (e) {
      return String(date);
    }
  };

  return (
    <section className="w-full">
      {/* Ticket Range Modal */}
      {isTicketModalOpen && selectedBuyerTickets && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div className="absolute inset-0 bg-black/40" onClick={handleCloseTicketModal} />
          <div className="relative z-10 w-full max-w-2xl rounded-lg bg-white shadow-xl flex max-h-[90vh] flex-col">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[#E5E7EB] bg-white p-4 md:p-6 rounded-t-lg">
              <div>
                <h3 className="text-xl font-semibold text-[#111827]">
                  Ticket Details
                </h3>
               
              </div>
              <button
                type="button"
                onClick={handleCloseTicketModal}
                className="rounded-full bg-[#F3F4F6] p-2 hover:bg-[#E5E7EB]"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="space-y-4">
           
                <div className=" pt-4">
                  <label className="text-xs font-semibold text-[#6B7280] uppercase">
                    Ticket Range
                  </label>
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Array.isArray(selectedBuyerTickets?.ticketRange) ? (
                      selectedBuyerTickets.ticketRange.map((range, idx) => (
                        <div
                          key={idx}
                          className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3"
                        >
                          <p className="text-sm font-semibold text-[#0F172A] truncate">
                            {range}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 col-span-2 md:col-span-3">
                        <p className="text-sm text-[#64748B]">
                          {selectedBuyerTickets?.ticketRange || "No ticket range"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

        
          </div>
        </div>
      )}
 

      {/* Header Section - Breadcrumb Style */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6 pb-4  mb-3">
        <div className="flex-1">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 mb-2 ">
            <button
              onClick={onBack}
              className="text-sm md:text-base text-[#64748B] hover:text-[#F48924] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span className="text-[#F48924]">
                <CornerUpLeft size={14} />
              </span>
              <span>{data?.header?.backButton}</span>
            </button>
            <span className="text-sm md:text-base text-[#F48924] font-bold">
              <ChevronRight size={14} />
            </span>
            <span className="text-sm text-[#F48924] ">
              {data?.header?.title}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-2xl md:text-4xl  font-black text-[#0F172A] mb-2  leading-tight">
            {campaignTitle}
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-[#64748B] font-medium max-w-[520px] truncate">
            {campaignSubtitle}
          </p>
        </div>

        {/* Stats Boxes */}
        <div className="flex gap-3 md:gap-4 flex-shrink-0">
          {resolvedLaunchStats.map((stat) => (
            <div
              key={stat.id}
              className="bg-white border border-[#F485251A] rounded-lg px-4 md:px-5 py-3 md:py-4  min-w-fit"
            >
              <p className="text-xs  font-bold text-[#F48924] uppercase ">
                {stat.label}
              </p>
              <p className="text-lg md:text-2xl lg:text-3xl font-bold text-[#0F172A] mt-1">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <section className="grid grid-cols-1 gap-6 md:gap-8">
        {/* Top: Randomizer and Winner Card */}

        <div className="flex flex-wrap gap-4 sm:gap-5 md:gap-6">
          {/* Left: Randomizer Engine */}
          <div className="flex-1 min-w-[280px] bg-[#0B0F1A] rounded-lg sm:rounded-xl border border-gray-800 p-4 md::p-8  flex flex-col items-center justify-center relative">
            {/* Title */}
            <h3 className="text-[#F48924] text-xs sm:text-sm md:text-base font-semibold tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-6 sm:mb-8">
              {data?.randomizer?.title || "RANDOMIZER ENGINE ACTIVE"}
            </h3>

            {/* Input/Rolling Area */}
            <div className="w-full max-w-md flex flex-col items-center">
              {!isManualCodeOpen ? (
                <>
                  {drawingState === "idle" ? (
                    <>
                      <div className="w-full border-t border-b border-[#F485254D] py-4 sm:py-6 mb-6 sm:mb-8 flex justify-center">
                        <p
                          className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold text-white"
                          style={{ letterSpacing: "0.2em" }}
                        >
                          {rollingNumber}
                        </p>
                      </div>
                    </>
                  ) : drawingState === "drawing" ? (
                    <div className="w-full border-t border-b border-[#F485254D] py-4  mb-6 sm:mb-8">
                      <p className="text-lg sm:text-2xl md:text-3xl font-bold text-white tracking-[0.3em] text-center">
                        {rollingNumber}
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-400 text-sm sm:text-base mb-3 sm:mb-4">
                        {data.randomizer.drawingText}
                      </p>
                      <div className="w-full border-t border-b border-[#F485254D] py-4 sm:py-6 mb-6 sm:mb-8 text-center">
                        <p className="text-lg sm:text-2xl md:text-3xl font-bold text-white tracking-[0.3em]">
                          {rollingNumber}
                        </p>
                      </div>
                    </>
                  )}

                  {/* Main Draw Button */}
                  <button
                    onClick={handleDrawWinner}
                    className="bg-[#F48924] hover:bg-[#e07b1f] text-white font-bold py-2 sm:py-3 px-3 sm:px-5 rounded-full text-base shadow-[0_0_20px_rgba(244,137,36,0.3)] transition-all uppercase  mb-3 sm:mb-4 cursor-pointer"
                  >
                    {drawingState === "completed"
                      ? data.randomizer.completedText
                      : data.randomizer.winnaarTrekken}
                  </button>

                </>
              ) : null}

              {/* Manual Coupon Code */}
              <button
                type="button"
                onClick={handleToggleManualCode}
                className="text-[#F48924] text-xs sm:text-base font-medium mb-4 sm:mb-5 cursor-pointer"
              >
                {data.randomizer.drawingText}
              </button>

              {isManualCodeOpen ? (
                <div className="w-full max-w-xs flex flex-col items-center gap-2 mb-6 sm:mb-8">
                  <input
                    type="text"
                    value={manualCouponCode}
                    onChange={(e) => setManualCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    disabled={isManualSaving}
                    className="w-full rounded-md bg-[#0F172A] border border-[#1E293B] px-3 py-2 text-sm text-white placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#F48924]/40"
                  />
                  <button
                    type="button"
                    onClick={handleApplyManualCode}
                    disabled={isManualSaving}
                    className="w-full rounded-md bg-[#F48924] text-white text-sm font-semibold py-2 hover:bg-[#e07b1f] transition-colors"
                  >
                    {isManualSaving ? "Saving..." : "Apply coupon code"}
                  </button>
                </div>
              ) : (
                <div className="mb-6 sm:mb-8" />
              )}

              {/* Bottom Disclaimer */}
              <p className="text-[#475569] text-sm  text-center px-2">
                {data.randomizer.disclaimer}
              </p>
            </div>
          </div>

          {/* Right: Winner Announcement Card */}
          <div className="w-full md:w-[320px] lg:w-[340px] flex flex-col gap-3 sm:gap-4">
            <div className="border-[3px] border-[#f48924] rounded-xl sm:rounded-2xl shadow-xl h-full">
              <div className="bg-white rounded-lg sm:rounded-[14px] overflow-hidden flex flex-col h-full">
                {/* Orange Header */}
                <div className="bg-[#F48924] py-2 sm:py-3 text-center">
                  <span className="text-white text-sm  md:text-base font-bold uppercase tracking-widest">
                    {winnerCardMeta.title}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center flex-1">
                  {/* Trophy Icon */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#FFF7ED] rounded-full flex items-center justify-center mb-3 sm:mb-4 md:mb-6">
                    <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-[#F48924]" />
                  </div>

                  {/* Winner Details */}
                  <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] mb-1">
                    {winnerName}
                  </h2>
                  {winnerEmail ? (
                    <p className="text-sm text-[#64748B] font-medium mb-2">
                      {winnerEmail}
                    </p>
                  ) : null}
                  <div className="flex items-center gap-2 text-[#F48924] font-bold text-sm mb-4 sm:mb-6">
                    <div className="w-4 h-3  rounded-sm flex items-center justify-center">
                      <Ticket />
                    </div>
                    {displayTicketCode}
                  </div>

                  {/* Handle Badge */}
                  <div className="bg-[#F1F5F9] px-4 sm:px-6 py-1.5 sm:py-2 rounded-full mb-6 sm:mb-8 max-w-full">
                    <span className="text-[#64748B] font-semibold text-sm block max-w-[220px] sm:max-w-[260px] truncate">
                      {winnerHandle}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full mt-auto">
                    <button className="bg-[#F48924] text-white rounded-lg py-2.5 sm:py-3 flex items-center justify-center gap-1.5 sm:gap-2 sm:font-bold text-sm hover:bg-[#e07b1f] transition-colors cursor-pointer">
                      <Mail size={14} className="sm:w-4 sm:h-4" />{" "}
                      <span className="hidden sm:inline">{primaryAction?.label}</span>
                      <span className="sm:hidden">{primaryAction?.shortLabel || primaryAction?.label}</span>
                    </button>
                    <a
                      href="https://wa.me/"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Chat on WhatsApp"
                      className="bg-[#25D366] text-white rounded-lg py-2.5 sm:py-3 flex items-center justify-center gap-1.5 sm:gap-2 sm:font-bold text-sm hover:bg-[#20BA58] transition-colors cursor-pointer"
                      title="Send WhatsApp notification"
                    >
                      <svg
                        viewBox="0 0 48 48"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 sm:w-5 h-4 sm:h-5"
                      >
                        <g fill="none" fillRule="evenodd">
                          <g transform="translate(-700.000000, -360.000000)" fill="currentColor">
                            <path d="M723.993033,360 C710.762252,360 700,370.765287 700,383.999801 C700,389.248451 701.692661,394.116025 704.570026,398.066947 L701.579605,406.983798 L710.804449,404.035539 C714.598605,406.546975 719.126434,408 724.006967,408 C737.237748,408 748,397.234315 748,384.000199 C748,370.765685 737.237748,360.000398 724.006967,360.000398 L723.993033,360.000398 L723.993033,360 Z M717.29285,372.190836 C716.827488,371.07628 716.474784,371.034071 715.769774,371.005401 C715.529728,370.991464 715.262214,370.977527 714.96564,370.977527 C714.04845,370.977527 713.089462,371.245514 712.511043,371.838033 C711.806033,372.557577 710.056843,374.23638 710.056843,377.679202 C710.056843,381.122023 712.567571,384.451756 712.905944,384.917648 C713.258648,385.382743 717.800808,392.55031 724.853297,395.471492 C730.368379,397.757149 732.00491,397.545307 733.260074,397.27732 C735.093658,396.882308 737.393002,395.527239 737.971421,393.891043 C738.54984,392.25405 738.54984,390.857171 738.380255,390.560912 C738.211068,390.264652 737.745308,390.095816 737.040298,389.742615 C736.335288,389.389811 732.90737,387.696673 732.25849,387.470894 C731.623543,387.231179 731.017259,387.315995 730.537963,387.99333 C729.860819,388.938653 729.198006,389.89831 728.661785,390.476494 C728.238619,390.928051 727.547144,390.984595 726.969123,390.744481 C726.193254,390.420348 724.021298,389.657798 721.340985,387.273388 C719.267356,385.42535 717.856938,383.125756 717.448104,382.434484 C717.038871,381.729275 717.405907,381.319529 717.729948,380.938852 C718.082653,380.501232 718.421026,380.191036 718.77373,379.781688 C719.126434,379.372738 719.323884,379.160897 719.549599,378.681068 C719.789645,378.215575 719.62006,377.735746 719.450874,377.382942 C719.281687,377.030139 717.871269,373.587317 717.29285,372.190836 Z" />
                          </g>
                        </g>
                      </svg>
                      <span className="hidden sm:inline">Informeer</span>
                      <span className="sm:hidden">Stuur</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Bottom Button */}
            <button
              onClick={handleDrawAgain}
              className="w-full bg-[#F8FAFC] border border-gray-200 py-2.5 sm:py-3 rounded-lg sm:rounded-xl flex items-center justify-center gap-2 text-gray-500 font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <RefreshCw size={14} className="sm:w-4 sm:h-4" />{" "}
              <span className="hidden sm:inline">{winnerCardMeta.noteBelow}</span>
              <span className="sm:hidden">{winnerCardMeta.noteBelowShort}</span>
            </button>
          </div>
        </div>

        {/* Middle: Full Width Recent Entries Table */}
        <div className="bg-[#ffffff] rounded-2xl border border-[#F485251A] overflow-hidden">
          <div className="px-4 md:px-6 py-5 border-b border-[#F485250D] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg md:text-xl font-black text-[#0F172A]">
              Recent Purchasers
            </h3>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F485250D] border-b border-[#F485250D]">
                  <th className="text-left font-semibold text-[#64748B] uppercase px-5 md:px-8 py-4 md:py-5 text-[10px] md:text-sm">
                    Full Name
                  </th>
                  <th className="text-left font-semibold text-[#64748B] uppercase px-5 md:px-8 py-4 md:py-5 text-[10px] md:text-sm">
                    Email
                  </th>
                  <th className="text-left font-semibold text-[#64748B] uppercase px-5 md:px-8 py-4 md:py-5 text-[10px] md:text-sm">
                    Purchase Date
                  </th>
                  <th className="text-center font-semibold text-[#64748B] uppercase px-5 md:px-8 py-4 md:py-5 text-[10px] md:text-sm">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F485250D]">
                {recentPurchasers?.map((buyer, index) => (
                  <tr
                    key={buyer?.id || `buyer-${index}`}
                    className="hover:bg-white/60 transition-colors"
                  >
                    <td className="px-5 md:px-6 py-4 font-semibold text-[#0F172A] text-sm md:text-base">
                      {buyer?.fullName || "—"}
                    </td>
                    <td className="px-5 md:px-6 py-4 text-[#475569] text-sm md:text-base">
                      {buyer?.email || "—"}
                    </td>
                    <td className="px-5 md:px-6 py-4 text-[#64748B] text-sm md:text-base">
                      {formatPurchaseDate(buyer?.createdAt || buyer?.purchaseDate)}
                    </td>
                    <td className="px-5 md:px-6 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleViewTickets(buyer)}
                        className="inline-flex items-center justify-center text-[#F48924] hover:text-[#e07b1f] transition-colors p-2 rounded-lg hover:bg-[#FFF1E3]"
                        title="View Tickets"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentPurchasers?.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-[#64748B] text-sm">No purchasers yet</p>
              </div>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3 p-4">
            {recentPurchasers?.map((buyer, index) => (
              <div
                key={buyer?.id || `buyer-${index}`}
                className="bg-white rounded-lg border border-[#F485250D] shadow-lg p-4 space-y-3"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <p className="text-xs text-[#64748B] uppercase font-bold mb-1">Full Name</p>
                    <p className="text-sm font-bold text-[#0F172A]">
                      {buyer?.fullName || "—"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleViewTickets(buyer)}
                    className="inline-flex items-center justify-center text-[#F48924] hover:text-[#e07b1f] transition-colors p-2 rounded-lg hover:bg-[#FFF1E3]"
                    title="View Tickets"
                  >
                    <Eye size={20} />
                  </button>
                </div>
                <div className="border-t border-[#F485250D] pt-3 space-y-2">
                  <div>
                    <p className="text-xs text-[#64748B] uppercase font-bold mb-1">Email</p>
                    <p className="text-sm text-[#475569]">
                      {buyer?.email || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B] uppercase font-bold mb-1">Purchase Date</p>
                    <p className="text-sm text-[#64748B]">
                      {formatPurchaseDate(buyer?.createdAt || buyer?.purchaseDate)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {recentPurchasers?.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-[#64748B] text-sm">No purchasers yet</p>
              </div>
            )}
          </div>
        </div>

      </section>

  
    </section>
  );
};

const Giveaways = ({ onNavigate }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState("main");
  const data = t("admin.giveaways", { returnObjects: true });
  const launchData = t("admin.launchGiveaway", { returnObjects: true });
  const [historyRows, setHistoryRows] = useState(launchData?.history?.rows || []);
  const [overviewStats, setOverviewStats] = useState({
    totalRevenue: null,
    totalTicketsSold: null,
    daysRemaining: null,
  });
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [recentPurchasers, setRecentPurchasers] = useState([]);
  const [completedGiveaways, setCompletedGiveaways] = useState([]);
  const [draftGiveaways, setDraftGiveaways] = useState([]);
  const [isCompletedLoading, setIsCompletedLoading] = useState(false);
  const [isDraftLoading, setIsDraftLoading] = useState(false);
  const [completedError, setCompletedError] = useState("");
  const [draftError, setDraftError] = useState("");
  const [completedDeleteTarget, setCompletedDeleteTarget] = useState(null);
  const [isCompletedDeleteOpen, setIsCompletedDeleteOpen] = useState(false);
  const [isDeletingCompleted, setIsDeletingCompleted] = useState(false);
  const [draftDeleteTarget, setDraftDeleteTarget] = useState(null);
  const [isDraftDeleteOpen, setIsDraftDeleteOpen] = useState(false);
  const [isDeletingDraft, setIsDeletingDraft] = useState(false);
  const [editingGiveawayId, setEditingGiveawayId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadOverviewStats = async () => {
      const { data: response, error } = await httpMethods.get(
        API_ENDPOINTS.ADMIN_GIVEAWAYS.STATS_OVERVIEW
      );

      if (!isMounted) return;
      if (error) return;

      setOverviewStats(normalizeGiveawayOverview(response));
    };

    loadOverviewStats();

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    let isMounted = true;

    const loadCompletedGiveaways = async () => {
      setIsCompletedLoading(true);
      setCompletedError("");

      const { data: response, error } = await httpMethods.get(
        API_ENDPOINTS.ADMIN_GIVEAWAYS.LIST,
        {
          suppressToast: true,
          params: {
            page: 1,
            limit: 10,
            status: "COMPLETED",
          },
        }
      );

      if (!isMounted) return;

      if (error) {
        setCompletedError("");
        setCompletedGiveaways([]);
        setIsCompletedLoading(false);
        toast.error(error.message || "Failed to load completed giveaways");
        return;
      }

      setCompletedGiveaways(normalizeGiveawayList(response));
      setIsCompletedLoading(false);
    };

    loadCompletedGiveaways();

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    let isMounted = true;

    const loadDraftGiveaways = async () => {
      setIsDraftLoading(true);
      setDraftError("");

      const { data: response, error } = await httpMethods.get(
        API_ENDPOINTS.ADMIN_GIVEAWAYS.LIST,
        {
          suppressToast: true,
          params: {
            page: 1,
            limit: 10,
            status: "DRAFT",
          },
        }
      );

      if (!isMounted) return;

      if (error) {
        setDraftError("");
        setDraftGiveaways([]);
        setIsDraftLoading(false);
        toast.error(error.message || "Failed to load draft giveaways");
        return;
      }

      setDraftGiveaways(normalizeGiveawayList(response));
      setIsDraftLoading(false);
    };

    loadDraftGiveaways();

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    let isMounted = true;

    const loadActiveGiveaway = async () => {
      console.log("[Giveaways] Fetching active giveaway...");
      const { data: response, error } = await httpMethods.get(
        API_ENDPOINTS.ADMIN_GIVEAWAYS.LIST,
        {
          params: {
            page: 1,
            limit: 10,
            status: "ACTIVE",
          },
        }
      );

      console.log("[Giveaways] active giveaway raw response:", response);
      if (!isMounted) return;
      if (error) return;

      const normalized = normalizeActiveGiveaway(response);
      console.log("[Giveaways] active giveaway normalized:", normalized);

      if (!normalized?.id) {
        setActiveCampaign(null);
        setRecentPurchasers([]);
        return;
      }

      setActiveCampaign(normalized);
      setRecentPurchasers(normalized.recentPurchasers || []);
    };

    loadActiveGiveaway();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const mode = location.state?.mode;

    if (mode === "launch") {
      setCurrentPage("launch");
      navigate(ROUTES.ADMIN_LEADS, { replace: true, state: {} });
      return;
    }

    if (mode === "create") {
      setCurrentPage("create");
      navigate(ROUTES.ADMIN_LEADS, { replace: true, state: {} });
      return;
    }

    if (mode === "buyers") {
      setCurrentPage("buyers");
      navigate(ROUTES.ADMIN_LEADS, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const handleRefreshGiveaways = () => {
    setReloadKey((prev) => prev + 1);
  };

  const handleDeleteHistory = (id) => {
    setHistoryRows((prevRows) => prevRows.filter((row) => row.id !== id));
  };

  const handleEditDraft = (draftId) => {
    if (!draftId) return;
    setEditingGiveawayId(draftId);
    setCurrentPage("create");
  };

  const openDraftDelete = (row) => {
    setDraftDeleteTarget(row);
    setIsDraftDeleteOpen(true);
  };

  const closeDraftDelete = () => {
    setIsDraftDeleteOpen(false);
    setDraftDeleteTarget(null);
  };

  const confirmDraftDelete = async () => {
    if (!draftDeleteTarget || isDeletingDraft) return;

    setIsDeletingDraft(true);
    const { error } = await httpMethods.delete(
      API_ENDPOINTS.ADMIN_GIVEAWAYS.BY_ID(draftDeleteTarget.id),
      { suppressToast: true }
    );

    if (error) {
      toast.error(error.message || "Failed to delete draft giveaway");
      setIsDeletingDraft(false);
      return;
    }

    setDraftGiveaways((prev) =>
      prev.filter((row) => row.id !== draftDeleteTarget.id)
    );
    setIsDeletingDraft(false);
    closeDraftDelete();
    toast.success("Draft giveaway deleted");
  };

  const openCompletedDelete = (row) => {
    setCompletedDeleteTarget(row);
    setIsCompletedDeleteOpen(true);
  };

  const closeCompletedDelete = () => {
    setIsCompletedDeleteOpen(false);
    setCompletedDeleteTarget(null);
  };

  const confirmCompletedDelete = async () => {
    if (!completedDeleteTarget || isDeletingCompleted) return;

    setIsDeletingCompleted(true);
    const { error } = await httpMethods.delete(
      API_ENDPOINTS.ADMIN_GIVEAWAYS.BY_ID(completedDeleteTarget.id),
      { suppressToast: true }
    );

    if (error) {
      toast.error(error.message || "Failed to delete giveaway");
      setIsDeletingCompleted(false);
      return;
    }

    setCompletedGiveaways((prev) =>
      prev.filter((row) => row.id !== completedDeleteTarget.id)
    );
    setIsDeletingCompleted(false);
    closeCompletedDelete();
    toast.success("Giveaway deleted");
  };

  const handleSetPage = (newPage) => {
    setCurrentPage(newPage);
  };

  const resolvedStats = (data?.stats || []).map((item) => {
    if (item.id === "revenue") {
      return {
        ...item,
        value: formatCurrency(overviewStats.totalRevenue),
        suffix: null,
      };
    }

    if (item.id === "sold") {
      return {
        ...item,
        value: formatCount(overviewStats.totalTicketsSold),
        suffix: null,
      };
    }

    if (item.id === "days") {
      return {
        ...item,
        value: formatDaysRemaining(overviewStats.daysRemaining),
        suffix: null,
      };
    }

    return item;
  });

  const resolvedCampaign = {
    badge: activeCampaign?.status ?? "—",
    title: activeCampaign?.title ?? "—",
    bannerImage: resolveImageUrl(activeCampaign?.bannerImage) || "/Waarde.jpg",
    updatedAt: activeCampaign?.updatedAt ?? "—",
    ticketsSold: activeCampaign?.ticketsSold ?? null,
    totalTickets: activeCampaign?.totalTickets ?? null,
  };

  const resolvedSoldMeta =
    resolvedCampaign.ticketsSold !== null &&
    resolvedCampaign.ticketsSold !== undefined &&
    resolvedCampaign.totalTickets !== null &&
    resolvedCampaign.totalTickets !== undefined
      ? `${resolvedCampaign.ticketsSold}/${resolvedCampaign.totalTickets}`
      : "0/0";

  const resolvedProgressPercent =
    resolvedCampaign.ticketsSold !== null &&
    resolvedCampaign.ticketsSold !== undefined &&
    resolvedCampaign.totalTickets !== null &&
    resolvedCampaign.totalTickets !== undefined &&
    Number(resolvedCampaign.totalTickets) > 0
      ? Math.min(
          100,
          Math.round(
            (Number(resolvedCampaign.ticketsSold) /
              Number(resolvedCampaign.totalTickets)) *
              100
          )
        )
      : 0;

  const resolvedProgressLabel = `${resolvedProgressPercent}%`;

  const fallbackTicketsLabel =
    data?.recentBuyers?.buyers?.[0]?.ticketsLabel || "Tickets";

  const resolvedRecentBuyers =
    Array.isArray(recentPurchasers) && recentPurchasers.length > 0
      ? recentPurchasers.map((buyer, index) => ({
          id: buyer?.id ?? `${buyer?.fullName || "buyer"}-${index}`,
          name: buyer?.fullName || "—",
          handle: buyer?.email || "—",
          ticketRange: Array.isArray(buyer?.ticketRange)
            ? buyer.ticketRange[0] || "—"
            : buyer?.ticketRange || "—",
          ticketsLabel: fallbackTicketsLabel,
          avatar: {
            initials: getInitials(buyer?.fullName),
            background: "#F4852533",
          },
        }))
      : [];

  const resolvedQuickStats = (data?.quickStats?.items || []).map((item) => {
    if (item.id === "daily") {
      return {
        ...item,
        value:
          activeCampaign?.stats?.dailyAverageSales ??
          activeCampaign?.stats?.dailyAverageRevenue ??
          "0",
      };
    }

    if (item.id === "conversion") {
      return {
        ...item,
        value: activeCampaign?.stats?.conversionRate ?? "0",
      };
    }

    return item;
  });

  if (currentPage === "create") {
    return (
      <CreateGiveawayPage
        onBack={() => {
          setEditingGiveawayId(null);
          handleSetPage("main");
        }}
        giveawayId={editingGiveawayId}
        onSuccess={() => {
          handleRefreshGiveaways();
        }}
      />
    );
  }

  if (currentPage === "launch") {
    return (
      <LaunchGiveawayPage
        onBack={() => handleSetPage("main")}
        giveawayId={activeCampaign?.id}
        campaign={activeCampaign}
        recentPurchasers={recentPurchasers}
        stats={{
          ticketsSold: activeCampaign?.ticketsSold ?? null,
          totalRevenue: overviewStats.totalRevenue ?? null,
        }}
      />
    );
  }

  if (currentPage === "buyers") {
    return (
      <GiveawayBuyers
        onBack={() => handleSetPage("main")}
        giveawayId={activeCampaign?.id}
      />
    );
  }
  //Beheer van weggeefacties
  return (
    <section className=" ">
     

      <div className=" flex flex-wrap items-start justify-between gap-4 border-b border-[#F485251A] pb-3">
        <div>
          <h1 className="text-2xl md:text-4xl  font-black text-[#0F172A]">
            {data.header.title}
          </h1>
          <p className="mt-1 text-base  text-[#708399]">
            {data.header.subtitle}
          </p>
        </div>

        <button
          onClick={() => {
            setEditingGiveawayId(null);
            handleSetPage("create");
          }}
          className="inline-flex h-12 items-center gap-2 rounded-lg border border-[#EF8226] bg-[#F48924] px-4 text-[16px] font-semibold text-white hover:bg-[#ea6c0a] transition-colors cursor-pointer"
        >
          <Plus size={20} aria-hidden="true" />
          <span className="text-white">{data.header.createButton}</span>
        </button>
      </div>

      <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {resolvedStats.map((item) => (
          <StatCard key={item.id} item={item} />
        ))}
      </section>

      <section className="mt-8 rounded-xl border border-[#F485251A] bg-white ">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-[#F485251A] px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="relative h-12 sm:h-16 w-12 sm:w-16 flex-shrink-0 overflow-hidden rounded-lg border border-[#D8E0EA] bg-[#F6F9FC]">
              <img
                src={resolvedCampaign.bannerImage}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                <span className="rounded-full bg-[#D1FAE5] px-2 py-0.5 text-xs sm:text-[10px] font-bold text-[#047857] flex-shrink-0">
                  {resolvedCampaign.badge}
                </span>
                <h2 className="text-lg md:text-xl leading-tight sm:leading-[1.05] font-semibold md:font-bold text-[#0F172A] break-words">
                  {resolvedCampaign.title}
                </h2>
              </div>
              <p className="mt-1 text-base  text-[#64748B]">
                <span className="font-semibold">
                  {data.campaign.valuePrefix}
                </span>{" "}
                {data.campaign.value}
              </p>
            </div>
          </div>

            <button
            onClick={() => handleSetPage("launch")}
            type="button"
            aria-label={data.aria.pickWinner}
            disabled={!activeCampaign?.id}
            className={`w-full sm:w-auto inline-flex h-10 sm:h-12 items-center justify-center sm:justify-start gap-2 rounded-lg border border-[#EF8226] px-4 sm:px-5 text-base font-semibold flex-shrink-0 transition-colors ${
              activeCampaign?.id
                ? "bg-[#F48525] text-white hover:bg-[#ea6c0a] cursor-pointer"
                : "bg-[#F8FAFC] text-[#94A3B8] cursor-not-allowed"
            }`}
          >
            <Trophy size={14} className="sm:w-4 sm:h-4" aria-hidden="true" />
              <span>{data.campaign.winnerCta}</span>
          </button>
            {!activeCampaign?.id ? (
              <p className="text-sm text-[#94A3B8]">
                No active giveaway found.
              </p>
            ) : null}
        </div>

        <div className="px-3 sm:px-4 md:px-5 py-3 sm:py-4 md:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <span className="text-lg  font-semibold text-[#1E293B]">
              {data.campaign.progressTitle}
            </span>
            <span className="text-base sm:text-lg md:text-[18px] text-[#F48924] font-bold">
              {resolvedProgressLabel}
            </span>
          </div>

          <div className="mt-2 h-3  rounded-full bg-[#E8EEF5]">
            <div
              className="h-3  rounded-full bg-[#F48924]"
              style={{ width: `${resolvedProgressPercent}%` }}
            />
          </div>

          <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-base text-[#94A3B8]">
            <span>{resolvedCampaign.updatedAt}</span>
            <span>{resolvedSoldMeta}</span>
          </div>

          <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-4 lg:gap-5 xl:grid-cols-[1fr_1fr]">
            <div className="rounded-lg sm:rounded-xl flex flex-col min-h-full">
              <h3 className="flex items-center gap-2 text-lg md:text-xl font-bold text-[#0F172A]">
                <Users
                  size={18}
                  className="sm:w-5 sm:h-5"
                  className="text-[#F48924]"
                  aria-hidden="true"
                />
                <span>{data.recentBuyers.title}</span>
              </h3>

              <div className="mt-3 sm:mt-4 space-y-4 sm:space-y-5 flex-1">
                {resolvedRecentBuyers.length === 0 ? (
                  <div className="rounded-lg border border-[#F485251A] bg-[#F8FAFC] px-3 py-4 text-sm font-semibold text-[#94A3B8]">
                    No user data
                  </div>
                ) : (
                  resolvedRecentBuyers.map((buyer) => (
                    <div
                      key={buyer.id}
                      className="flex items-center justify-between rounded-lg border border-[#F485251A] bg-[#F8FAFC] px-2 sm:px-3 py-2.5"
                    >
                      <div className="flex items-center gap-3 sm:gap-6 min-w-0">
                        <div className="flex h-9 sm:h-12 w-9 sm:w-12 items-center justify-center rounded-full text-sm sm:text-[11px] font-semibold md:font-bold text-[#9A3412] bg-[#F4852533] flex-shrink-0">
                          {buyer.avatar.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-base font-semibold md:font-bold md:leading-5 text-[#0F172A] truncate">
                            {buyer.name}
                          </p>
                          <p className="text-sm font-semibold text-[#F48924] truncate">
                            {buyer.handle}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-sm font-semibold text-[#94A3B8]">
                          {buyer.ticketsLabel}
                        </p>
                        <p className="text-base  font-semibold text-[#1E293B]">
                          {buyer.ticketRange}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                type="button"
                onClick={() => handleSetPage("buyers")}
                className="mt-auto inline-flex h-10 sm:h-12.5 w-full items-center justify-center rounded-lg border border-dotted border-[#F8D9BC] text-base font-semibold text-[#F48924] cursor-pointer"
              >
                {data.recentBuyers.viewAll}
              </button>
            </div>

            <div className="rounded-lg sm:rounded-xl border border-[#F485251A] bg-[#F485250D] p-3 sm:p-4">
              <h3 className="text-xl md:text-2xl font-semibold md:font-bold leading-8 text-[#0F172A]">
                {data.quickStats.title}
              </h3>

              <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 border-b border-[#F485251A] pb-3 sm:pb-4">
                {resolvedQuickStats.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 sm:gap-3"
                  >
                    <p className="text-base text-[#475569]">
                      {item.label}
                    </p>
                    <p
                      className={`text-base sm:text-lg md:text-xl font-bold ${
                        item.tone === "accent"
                          ? "text-[#F48924]"
                          : "text-[#0F172A]"
                      }`}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-3 sm:mt-4 md:mt-6 lg:mt-8 xl:mt-12 text-base  text-[#8191A6]">
                {data.quickStats.note}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8  bg-white rounded-lg border border-[#F485250D] overflow-hidden">
        <div className="px-5 md:px-6 py-4  border-b  border-[#F485250D]">
          <h3 className="text-lg md:text-xl font-black text-[#0F172A]">
            Geschiednis van de weggeefactie
          </h3>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#fef9f4] border-b border-[#F485251A] ">
                <th className="text-left font-semibold text-[#64748B] uppercase px-5 md:px-8 py-4 md:py-5 text-sm">
                  Campaign
                </th>
                <th className="text-left font-semibold text-[#64748B] uppercase px-5 md:px-8 py-4 md:py-5 text-sm">
                  Status
                </th>
                <th className="text-left font-semibold text-[#64748B] uppercase px-5 md:px-8 py-4 md:py-5 text-sm">
                  Winner
                </th>
                <th className="text-left font-semibold text-[#64748B] uppercase px-5 md:px-8 py-4 md:py-5 text-sm">
                  Tickets sold
                </th>
                <th className="text-center font-semibold text-[#64748B] uppercase px-5 md:px-8 py-4 md:py-5 text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y border-[#F485251A] bg-white">
              {isCompletedLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 md:px-6 py-6 text-sm text-[#64748B]"
                  >
                    Loading completed giveaways...
                  </td>
                </tr>
              ) : completedGiveaways.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 md:px-6 py-6 text-sm text-[#64748B]"
                  >
                    No completed giveaways found.
                  </td>
                </tr>
              ) : (
                completedGiveaways.map((row) => (
                  <tr
                    key={row.id}
                    className="transition-colors border border-[#F485251A]"
                  >
                    <td className="px-5 md:px-6 py-4 font-bold text-[#0F172A] text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#E8D5C4] flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {row.bannerImage ? (
                            <img
                              src={resolveImageUrl(row.bannerImage)}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-bold text-[#8B6F47]">
                              {getInitials(row.title)}
                            </span>
                          )}
                        </div>
                        <span>{row.title}</span>
                      </div>
                    </td>
                    <td className="px-5 md:px-6 py-4">
                      <span
                        className={`text-sm font-bold px-2.5 py-1 rounded inline-block ${
                          row.status === "COMPLETED"
                            ? "bg-[#D1FAE5] text-[#047857]"
                            : "bg-[#FEF08A] text-[#92400e]"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 md:px-6 py-4 text-[#0F172A] text-sm">
                      <div className="flex items-center gap-2">
                        <Trophy
                          size={14}
                          className="text-[#F48924] flex-shrink-0"
                        />
                        <span className="font-bold">{row.winnerFullName}</span>
                      </div>
                    </td>
                    <td className="px-5 md:px-6 py-4 font-bold text-[#0F172A] text-sm">
                      {formatCount(row.ticketsSold)}
                    </td>
                    <td className="px-5 md:px-6 py-4 text-center align-middle">
                      <button
                        type="button"
                        onClick={() => openCompletedDelete(row)}
                        className="inline-flex items-center justify-center rounded-md border border-[#FEE2E2] bg-[#FFF1F2] p-2 text-[#DC2626] hover:bg-[#FEE2E2]"
                        aria-label="Delete giveaway"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3 p-4">
          {isCompletedLoading ? (
            <div className="rounded-lg border border-[#F485250D] p-4 text-sm text-[#64748B]">
              Loading completed giveaways...
            </div>
          ) : completedGiveaways.length === 0 ? (
            <div className="rounded-lg border border-[#F485250D] p-4 text-sm text-[#64748B]">
              No completed giveaways found.
            </div>
          ) : (
            completedGiveaways.map((row) => (
              <div
                key={row.id}
                className="bg-white rounded-lg border border-[#F485250D] p-4 space-y-3 shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-[#E8D5C4] flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {row.bannerImage ? (
                          <img
                            src={resolveImageUrl(row.bannerImage)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-bold text-[#8B6F47]">
                            {getInitials(row.title)}
                          </span>
                        )}
                      </div>
                      <div>
                      <p className="text-sm font-bold text-[#0F172A]">
                        {row.title}
                      </p>
                      <p className="text-xs text-[#94A3B8]">{row.winnerFullName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-1.5 rounded inline-block ${
                        row.status === "COMPLETED"
                          ? "bg-[#D1FAE5] text-[#047857]"
                          : "bg-[#FEF08A] text-[#92400e]"
                      }`}
                    >
                      {row.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => openCompletedDelete(row)}
                      className="inline-flex items-center justify-center rounded-md border border-[#FEE2E2] bg-[#FFF1F2] p-2 text-[#DC2626] hover:bg-[#FEE2E2]"
                      aria-label="Delete giveaway"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="border-t border-[#F485250D] pt-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#64748B]">
                    Tickets sold
                  </p>
                  <p className="text-sm font-bold text-[#0F172A]">
                    {formatCount(row.ticketsSold)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="mt-8 bg-white rounded-lg border border-[#F485250D] overflow-hidden">
        <div className="px-5 md:px-6 py-4 border-b border-[#F485250D]">
          <h3 className="text-lg md:text-xl font-black text-[#0F172A]">
            Draft giveaways
          </h3>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#fef9f4] border-b border-[#F485251A]">
                <th className="text-left font-semibold text-[#64748B] uppercase px-5 md:px-8 py-4 md:py-5 text-sm">
                  Campaign
                </th>
                <th className="text-left font-semibold text-[#64748B] uppercase px-5 md:px-8 py-4 md:py-5 text-sm">
                  Status
                </th>
                <th className="text-left font-semibold text-[#64748B] uppercase px-5 md:px-8 py-4 md:py-5 text-sm">
                  Created
                </th>
                <th className="text-center font-semibold text-[#64748B] uppercase px-5 md:px-8 py-4 md:py-5 text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y border-[#F485251A] bg-white">
              {isDraftLoading ? (
                <tr>
                  <td colSpan={4} className="px-5 md:px-6 py-6 text-sm text-[#64748B]">
                    Loading draft giveaways...
                  </td>
                </tr>
              ) : draftGiveaways.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 md:px-6 py-6 text-sm text-[#64748B]">
                    No draft giveaways found.
                  </td>
                </tr>
              ) : (
                draftGiveaways.map((row) => (
                  <tr key={row.id} className="transition-colors border border-[#F485251A]">
                    <td className="px-5 md:px-6 py-4 font-bold text-[#0F172A] text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#E8D5C4] flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {row.bannerImage ? (
                            <img
                              src={resolveImageUrl(row.bannerImage)}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-bold text-[#8B6F47]">
                              {getInitials(row.title)}
                            </span>
                          )}
                        </div>
                        <span>{row.title}</span>
                      </div>
                    </td>
                    <td className="px-5 md:px-6 py-4">
                      <span className="text-sm font-bold px-2.5 py-1 rounded inline-block bg-[#FEF08A] text-[#92400e]">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 md:px-6 py-4 text-[#0F172A] text-sm font-semibold">
                      {formatDateShort(row.createdAt)}
                    </td>
                    <td className="px-5 md:px-6 py-4 text-center align-middle">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditDraft(row.id)}
                          className="inline-flex items-center justify-center rounded-md border border-[#E2E8F0] p-2 text-[#0F172A] hover:bg-[#F8FAFC]"
                          aria-label="Edit giveaway"
                        >
                          <SquarePen size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDraftDelete(row)}
                          className="inline-flex items-center justify-center rounded-md border border-[#FEE2E2] bg-[#FFF1F2] p-2 text-[#DC2626] hover:bg-[#FEE2E2]"
                          aria-label="Delete giveaway"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3 p-4">
          {isDraftLoading ? (
            <div className="rounded-lg border border-[#F485250D] p-4 text-sm text-[#64748B]">
              Loading draft giveaways...
            </div>
          ) : draftGiveaways.length === 0 ? (
            <div className="rounded-lg border border-[#F485250D] p-4 text-sm text-[#64748B]">
              No draft giveaways found.
            </div>
          ) : (
            draftGiveaways.map((row) => (
              <div
                key={row.id}
                className="bg-white rounded-lg border border-[#F485250D] p-4 space-y-3 shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-[#E8D5C4] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {row.bannerImage ? (
                        <img
                          src={resolveImageUrl(row.bannerImage)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-[#8B6F47]">
                          {getInitials(row.title)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0F172A]">
                        {row.title}
                      </p>
                      <p className="text-xs text-[#94A3B8]">
                        {formatDateShort(row.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1.5 rounded inline-block bg-[#FEF08A] text-[#92400e]">
                    {row.status}
                  </span>
                </div>

                <div className="border-t border-[#F485250D] pt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditDraft(row.id)}
                    className="inline-flex items-center gap-1 rounded-md border border-[#E2E8F0] px-2.5 py-1.5 text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC]"
                  >
                    <SquarePen size={14} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => openDraftDelete(row)}
                    className="inline-flex items-center gap-1 rounded-md border border-[#FEE2E2] bg-[#FFF1F2] px-2.5 py-1.5 text-xs font-semibold text-[#DC2626] hover:bg-[#FEE2E2]"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <DeleteConfirmModal
        isOpen={isCompletedDeleteOpen}
        onClose={closeCompletedDelete}
        onConfirm={confirmCompletedDelete}
        itemName={completedDeleteTarget?.title}
        isLoading={isDeletingCompleted}
      />
      <DeleteConfirmModal
        isOpen={isDraftDeleteOpen}
        onClose={closeDraftDelete}
        onConfirm={confirmDraftDelete}
        itemName={draftDeleteTarget?.title}
        isLoading={isDeletingDraft}
      />
    </section>
  );
};

export default Giveaways;
