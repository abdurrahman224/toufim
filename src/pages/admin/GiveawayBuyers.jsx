import React, { useEffect, useState } from "react";
import { ChevronRight, Calendar, Trophy, HourglassIcon, Zap } from "lucide-react";
import httpMethods from "../../services/httpMethods";
import API_ENDPOINTS from "../../services/httpEndpoint";

const DEFAULT_BANNER_IMAGE = "/Luxury_Bathroom_Renovation.webp";

const normalizeGiveawayDetail = (payload) => {
  const raw = payload?.data ?? payload;
  const data = raw?.data ?? raw;

  return {
    id: data?.id ?? null,
    title: data?.title ?? null,
    description: data?.description ?? null,
    totalTickets: data?.totalTickets ?? null,
    ticketsSold: data?.ticketsSold ?? null,
    drawDate: data?.drawDate ?? null,
    bannerImage: data?.bannerImage ?? null,
    status: data?.status ?? null,
    stats: data?.stats ?? null,
    winnerCouponId: data?.winnerCouponId ?? null,
  };
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  if (Number.isNaN(value)) return "—";

  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDateLabel = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const GiveawayBuyers = ({ onBack, giveawayId }) => {
  const [giveaway, setGiveaway] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadGiveaway = async () => {
      if (!giveawayId) return;

      console.log("[GiveawayBuyers] Loading giveaway", giveawayId);

      const { data: response, error } = await httpMethods.get(
        API_ENDPOINTS.ADMIN_GIVEAWAYS.BY_ID(giveawayId)
      );

      if (!isMounted) return;
      if (error) return;

      const normalized = normalizeGiveawayDetail(response);
      // console.log("[GiveawayBuyers] Giveaway response", normalized);
      setGiveaway(normalized);
    };

    loadGiveaway();

    return () => {
      isMounted = false;
    };
  }, [giveawayId]);

  const totalTickets = giveaway?.totalTickets ?? 0;
  const soldTickets = giveaway?.ticketsSold ?? 0;
  const soldPercent =
    totalTickets > 0
      ? Math.round((soldTickets / totalTickets) * 100 * 10) / 10
      : 0;
  const remainingTickets = Math.max(0, totalTickets - soldTickets);
  const bannerImage = giveaway?.bannerImage || DEFAULT_BANNER_IMAGE;
  const drawDateLabel = formatDateLabel(giveaway?.drawDate);
  const giveawayTitle = giveaway?.title || "—";
  const giveawayStatus = giveaway?.status || "—";
  const giveawayDescription = giveaway?.description || "—";
  const totalRevenue = giveaway?.stats?.totalRevenue ?? null;
  const winnerNote = giveaway?.winnerCouponId
    ? ""
    : "Ekhono winner select kora hoy ni";

  return (
    <section className="min-h-[calc(100vh-2rem)] w-full space-y-8 pb-4">
     
      <nav className="flex items-center gap-1.5 text-sm font-semibold">
        <button
          onClick={onBack}
          className="cursor-pointer border-none bg-transparent p-0 text-[#F48924] transition-opacity hover:opacity-75"
        >
          Beheer van weggeefacties
        </button>
        <ChevronRight size={14} className="text-[#94A3B8]" />
        <span className="text-[#0F172A]">Details van de weggeefactie</span>
      </nav>

      {/* Title & Status */}
      <div>
        <h1 className="mb-3 text-4xl font-extrabold text-[#0F172A]">
          {giveawayTitle}
        </h1>
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFEDD5] px-3 py-1 text-xs font-extrabold uppercase text-[#7C2D12]">
            <Zap size={14} />
            {giveawayStatus}
          </span>
          <span className="flex items-center gap-1.5 text-sm font-medium text-[#64748B]">
            <Calendar size={14} />
            {drawDateLabel}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid w-full min-h-[calc(100vh-12rem)] grid-cols-1 gap-5 items-start lg:grid-cols-[minmax(0,1.6fr)_400px]">
        {/* LEFT */}
        <div className="flex flex-col">
          {/* Full-width Hero Image */}
          <div className="relative h-80 w-full overflow-hidden rounded-t-2xl bg-[#1a2535] md:h-105">
            <img
              src={bannerImage}
              alt="Giveaway"
              className="block h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[rgba(15,23,42,0.18)] to-transparent" />
          </div>

          {/* Campaign Overview */}
          <div className="flex flex-col rounded-b-2xl border border-[#E2E8F0] bg-white p-7 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#F48924]">
                <span className="text-[10px] font-black text-[#F48924]">i</span>
              </div>
              <h2 className="font-syne text-lg font-bold text-[#0F172A]">
                Campagneoverzicht
              </h2>
            </div>
            <p className="text-base leading-relaxed text-body">
              {giveawayDescription}
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-3 self-start">
          {/* Coupon Progress */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0F172A]">Couponvoortgang</h3>
              <span className="rounded-sm bg-[#F1F0EE] px-2.5 py-1 text-sm font-bold uppercase text-[#0F172A]">
                {soldPercent}% VERKOCHT
              </span>
            </div>

            <div className="mb-1 flex items-end justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black leading-none text-[#0F172A]">
                  {soldTickets}
                </span>
                <span className="text-[13px] font-bold text-[#64748B]">
                  / {totalTickets.toLocaleString("nl-NL")}
                </span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-[#F48924]">
                  {remainingTickets}
                </div>
                <div className="text-xs font-extrabold uppercase tracking-widest text-[#94A3B8]">
                  OVERIG
                </div>
              </div>
            </div>

            <p className="mb-2 text-sm font-bold uppercase text-[#94A3B8]">
              TOTAAL INSCHRIJVINGEN
            </p>

            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#F1F5F9]">
              <div
                className="h-full rounded-full bg-[#F48924] transition-all duration-700"
                style={{ width: `${soldPercent}%` }}
              />
            </div>

            <p className="mt-2 text-sm text-[#64748B]">
              Verkoopsnelheid: +45 tickets in de afgelopen 24 uur.
            </p>
          </div>

          {/* Winner Status (Dark) */}
          <div className="relative overflow-hidden rounded-2xl bg-[#0F172A] p-5 text-white shadow-sm">
            <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full " />

            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex shrink-0 items-center justify-center rounded-lg bg-white/10 p-2">
                <Trophy size={22} className="text-[#F59E0B]" />
              </div>
              <span className="truncate whitespace-nowrap text-sm font-extrabold uppercase tracking-[0.15em] text-white">
                Winnaarstatus
              </span>
            </div>

            <div className="py-1.5 text-center">
              <div className="mb-3 flex justify-center text-white/20">
                <HourglassIcon size={36} strokeWidth={1.5} className="text-form-label" />
              </div>
              <h4 className="mb-2 text-lg font-extrabold">
                Selectie in behandeling
              </h4>
              <p className="mx-auto max-w-50 text-[12.5px] leading-relaxed text-slate-400">
                {winnerNote}
              </p>
            </div>

            <div className="mt-5 flex items-end justify-between border-t border-white/10 pt-4">
              <div>
                <p className="mb-0.5 text-[8.5px] font-mono font-bold uppercase tracking-widest text-white/35">
                  METHODE
                </p>
                <p className="text-xs font-bold">Algoritmisch zaad</p>
              </div>
              <div className="text-right">
                <p className="mb-0.5 text-[8.5px] font-mono font-bold uppercase tracking-widest text-white/35">
                  AUDITOR
                </p>
                <p className="text-xs font-bold">ClearTrust Ltd.</p>
              </div>
            </div>
          </div>

          {/* Store Value */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
            <p className="mb-1.5 text-sm font-extrabold text-[#94A3B8]">
              WINKELWAARDE
            </p>
            <p className="text-3xl font-black text-[#0F172A]">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GiveawayBuyers;