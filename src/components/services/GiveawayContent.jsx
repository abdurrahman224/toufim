import React, { memo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  Ticket,
  Users,
  CalendarDays,
  TicketX,
  Flame,
  BadgeCheck,
  ShoppingCart,
  Radio,
  Palette,
  RefreshCw,
} from "lucide-react";
import AnnouncementBar from "../home/AnnouncementBar";
import HomeNav from "../home/HomeNav";
import FooterSection from "../home/FooterSection";
import { ROUTES } from "../../config";
import {
  fetchActiveGiveaway,
  selectActiveGiveaway,
  selectActiveGiveawayError,
  selectActiveGiveawayStatus,
} from "../../store/slices/giveawaySlice";

const STAT_CARDS = [
  { Icon: Ticket, labelKey: "ticketPriceLabel", valueKey: "ticketPrice" },
  { Icon: Users, labelKey: "totalTicketsLabel", valueKey: "totalTickets" },
  { Icon: CalendarDays, labelKey: "drawDateLabel", valueKey: "drawDate" },
];

const STEPS = [
  {
    Icon: ShoppingCart,
    titleKey: "step1Title",
    descKey: "step1Desc",
  },
  {
    Icon: Radio,
    titleKey: "step2Title",
    descKey: "step2Desc",
  },
  {
    Icon: Palette,
    titleKey: "step3Title",
    descKey: "step3Desc",
  },
  {
    Icon: RefreshCw,
    titleKey: "step4Title",
    descKey: "step4Desc",
  },
];

const TERM_KEYS = ["term1", "term2", "term3", "term4"];

const formatPrice = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const numericValue = Number(value);

  if (Number.isFinite(numericValue)) {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(numericValue);
  }

  return String(value);
};

const formatDrawDateTime = (dateValue, timeValue) => {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  const datePart = date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
  });

  if (timeValue && /^\d{1,2}:\d{2}/.test(timeValue)) {
    return `${datePart} ${timeValue}`;
  }

  const timePart = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${datePart} ${timePart}`;
};

const GiveawayContent = memo(() => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const giveaway = useSelector(selectActiveGiveaway);
  const status = useSelector(selectActiveGiveawayStatus);
  const error = useSelector(selectActiveGiveawayError);
  const [selectedPackage, setSelectedPackage] = useState("single");

  useEffect(() => {
    if (status === "idle") {
      console.debug("[GiveawayContent] Fetching active giveaway...");
      dispatch(fetchActiveGiveaway());
    }
  }, [dispatch, status]);

  const totalTickets = Number(giveaway?.totalTickets || 0);
  const soldTickets = Number(giveaway?.soldTickets || 0);
  const packages = Array.isArray(giveaway?.packages) ? giveaway.packages : [];
  const singlePackage = packages[0];
  const bundlePackage = packages[1];
  const ticketPrice = singlePackage?.price ?? giveaway?.ticketPrice ?? "";
  const bundlePrice =
    bundlePackage?.price ?? Number(ticketPrice || 0) * 2;
  const progressPercent = totalTickets
    ? Math.min((soldTickets / totalTickets) * 100, 100)
    : 0;
  const soldCountText = totalTickets
    ? `${soldTickets}/${totalTickets}`
    : "";
  const couponCountValue =
    bundlePackage?.couponCount ??
    singlePackage?.couponCount ??
    giveaway?.couponCount;
  const couponCountText = couponCountValue ? `${couponCountValue}` : "";
  const checkoutPath = `${ROUTES.CHECKOUT}?package=${selectedPackage}`;

  return (
    <div className="bg-surface min-h-screen">
      <AnnouncementBar />
      <HomeNav />

      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 md:px-10 xl:px-20 pt-4 sm:pt-6 pb-0">
        <div className="container mx-auto">
          <div className="mb-6 sm:mb-8">
            <div
              className="overflow-hidden rounded-xl relative"
              style={{
                backgroundImage: giveaway?.bannerImage
                  ? `url(${giveaway.bannerImage})`
                  : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
<div className='absolute inset-0 bg-linear-to-r from-[rgba(0,0,0,0.8)] via-[rgba(0,0,0,0.5)] to-[rgba(0,0,0,0.55)]' />
              <div className="relative z-10 p-5 sm:p-8 md:p-10 min-h-64 sm:min-h-72 md:min-h-90 xl:min-h-115 flex flex-col justify-end gap-3">
                {/* Heading */}
                <h1 className="font-black text-2xl sm:text-3xl xl:text-4xl leading-tight text-white">
                  {giveaway?.title || ""}
                </h1>

                {/* Description */}
                <p
                  className="text-base leading-relaxed text-[rgba(255,255,255,0.85)] max-w-sm sm:max-w-lg xl:max-w-2xl"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {giveaway?.description || ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="px-4 sm:px-6 md:px-10 xl:px-20 pb-16 sm:pb-20">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* ── Left column (2/3) ────────────────────────────────────── */}
            <div className="flex-1 lg:w-0 min-w-0">
              {/* Stat cards row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
                {STAT_CARDS.map(({ Icon, labelKey, valueKey }) => (
                  <div
                    key={labelKey}
                    className="bg-white border border-[rgba(244,133,37,0.2)] rounded-xl p-5 sm:p-6 flex flex-col gap-3"
                  >
                    <div className="w-10 h-10 bg-[rgba(244,133,37,0.1)] rounded-lg flex items-center justify-center">
                      <Icon
                        className="w-5 h-5 text-primary"
                        strokeWidth={1.75}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                        {t(`giveaway.${labelKey}`)}
                      </p>
                      <p className="font-black text-2xl sm:text-3xl leading-none text-heading">
                        {valueKey === "ticketPrice"
                          ? formatPrice(ticketPrice)
                          : valueKey === "totalTickets"
                          ? totalTickets
                          : formatDrawDateTime(
                              giveaway?.drawDate,
                              giveaway?.drawTime,
                            )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {status === "loading" && (
                <div className="mb-6 sm:mb-8 text-sm text-muted">
                  {t("giveaway.loading") || "Loading giveaway..."}
                </div>
              )}

              {status === "failed" && (
                <div className="mb-6 sm:mb-8 text-sm text-red-600">
                  {error || "Failed to load giveaway."}
                </div>
              )}

              {/* Progress section */}
              <div className="bg-white border border-[rgba(244,133,37,0.2)] rounded-xl p-5 sm:p-6 mb-6 sm:mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-heading">
                    {t("giveaway.soldLabel")}
                  </span>
                  <span className="text-sm font-black text-primary">
                    {soldCountText || t("giveaway.soldCount")}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="bg-[rgba(244,133,37,0.1)] h-4 rounded-full overflow-hidden mb-3">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Urgency row */}
                <div className="flex items-center gap-2">
                  <div className="shrink-0">
                    {/* <img
                      src={IMG_GIVEAWAY_URGENCY_ICON}
                      alt=''
                      className='w-full h-full object-contain'
                    /> */}
                    <span className="text-muted">
                      <Flame />
                    </span>
                  </div>
                  <p className="text-sm text-muted">
                    {t("giveaway.urgencyText")}
                  </p>
                </div>
              </div>

              {/* How it works */}
              <div className="bg-white border border-[rgba(244,133,37,0.2)] rounded-xl p-5 sm:p-6">
                <h2 className="font-black text-xl md:text-2xl text-heading mb-4 sm:mb-5">
                  {t("giveaway.howWorksTitle")}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {STEPS.map(({ Icon, titleKey, descKey }) => (
                    <div
                      key={titleKey}
                      className="bg-[rgba(244,133,37,0.05)] border border-[rgba(244,133,37,0.08)] p-4 sm:p-5 rounded-lg flex gap-3"
                    >
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <Icon size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-base text-heading mb-1">
                          {t(`giveaway.${titleKey}`)}
                        </p>
                        <p className="text-base leading-relaxed text-body">
                          {t(`giveaway.${descKey}`)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right sidebar (1/3) ──────────────────────────────────── */}
            <div className="lg:w-80 xl:w-96 shrink-0">
              <div className="bg-white border-2 border-primary rounded-xl p-5 sm:p-6 lg:p-8 shadow-[0_8px_32px_rgba(244,133,37,0.12)] lg:sticky lg:top-24">
                <h2 className="font-black text-xl md:text-2xl text-heading mb-4 sm:mb-6">
                  {t("giveaway.sidebarTitle")}
                </h2>

                {/* Single entry option */}
                <button
                  type="button"
                  onClick={() => setSelectedPackage("single")}
                  aria-pressed={selectedPackage === "single"}
                  className={`w-full text-left rounded-lg p-3 sm:p-4 flex items-center justify-between mb-3 border transition-colors ${
                    selectedPackage === "single"
                      ? "border-primary bg-[rgba(244,133,37,0.08)]"
                      : "border-border bg-white"
                  }`}
                >
                  <span className="text-sm sm:text-base font-medium text-heading">
                    {t("giveaway.singleEntry")}
                  </span>
                  <span className="text-sm sm:text-base font-black text-heading">
                    {formatPrice(ticketPrice) || t("giveaway.singlePrice")}
                  </span>
                </button>

                {/* Bundle option */}
                <button
                  type="button"
                  onClick={() => setSelectedPackage("bundle")}
                  aria-pressed={selectedPackage === "bundle"}
                  className={`w-full rounded-lg p-3 sm:p-4 flex items-center justify-between mb-4 sm:mb-6 border-2 transition-colors ${
                    selectedPackage === "bundle"
                      ? "border-primary bg-[rgba(244,133,37,0.05)]"
                      : "border-border bg-white"
                  }`}
                >
                  <div>
                    <span className="text-sm sm:text-base font-bold text-heading">
                      {t("giveaway.bundleLabel")} {couponCountText}
                    </span>
                    <span className="ml-2 bg-primary text-white text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full">
                      {t("giveaway.bundleBadge")}
                    </span>
                  </div>
                  <span className="text-sm sm:text-base font-black text-primary">
                    {formatPrice(bundlePrice) || t("giveaway.bundlePrice")}
                  </span>
                </button>

                {/* CTA button */}
                <Link
                  to={checkoutPath}
                  className="btn w-full bg-primary hover:bg-primary-700 transition-colors rounded-lg py-4 flex items-center justify-center gap-2 sm:gap-3 mb-4"
                >
                  {/* <img src={IMG_GIVEAWAY_BUY_ICON} alt='' className='w-5 h-5' /> */}
                  <p className="text-white">
                    <TicketX />
                  </p>
                  <span className="font-black text-lg text-white tracking-[0.5px]">
                    {t("giveaway.ctaButton")}
                  </span>
                </Link>

                {/* Secure note */}
                <p className="text-xs text-muted text-center leading-relaxed mb-4 sm:mb-6">
                  {t("giveaway.ctaSecure")}
                </p>

                {/* Separator */}
                <div className="border-t border-[#f1f5f9] mb-5" />

                {/* Terms section */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 shrink-0 mt-0.5">
                    {/* <img
                      src={IMG_GIVEAWAY_TERMS_ICON}
                      alt=''
                      className='w-full h-full object-contain'
                    /> */}
                    <span className="text-[#F48525]">
                      {" "}
                      <BadgeCheck />
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-heading mb-2">
                      {t("giveaway.termsTitle")}
                    </p>
                    <ul className="pl-4 text-xs text-muted leading-loose list-disc">
                      {TERM_KEYS.map((key) => (
                        <li key={key}>{t(`giveaway.${key}`)}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* <section className="px-4 sm:px-6 md:px-10 xl:px-20 pb-16 sm:pb-20">
        <div className="container mx-auto">
       
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-black text-2xl md:text-3xl text-heading">
              {t("giveaway.galleryTitle")}
            </h2>
            <a
              href="#portfolio"
              className="text-sm font-semibold text-primary hover:underline"
            >
              {t("giveaway.galleryLink")}
            </a>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {GALLERY_IMGS.map((src, i) => (
              <div
                key={i}
                className="h-44 sm:h-52 md:h-56 rounded-lg bg-border overflow-hidden"
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section> */}

      <FooterSection />
    </div>
  );
});

GiveawayContent.displayName = "GiveawayContent";

export default GiveawayContent;
