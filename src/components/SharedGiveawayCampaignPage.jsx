import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Circle,
  CornerUpLeft,
  ImagePlus,
  Rocket,
  SquarePen,
  Ticket,
  Calculator,
} from "lucide-react";
import toast from "react-hot-toast";
import httpMethods from "../services/httpMethods";
import API_ENDPOINTS from "../services/httpEndpoint";

export function SharedGiveawayCampaignPage({
  translationKey,
  onBack,
  backLabel,
  giveawayId,
  onSuccess,
}) {
  const { t } = useTranslation();
  const data = t(translationKey, { returnObjects: true });

  const [previewImage, setPreviewImage] = useState("");
  const [previewImageName, setPreviewImageName] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const previewInputRef = useRef(null);

  const [ticketRows, setTicketRows] = useState([{ id: 1, coupons: "", price: "" }]);
  const [title, setTitle] = useState("");
  const [drawDate, setDrawDate] = useState("");
  const [drawTime, setDrawTime] = useState("");
  const [description, setDescription] = useState("");
  const [totalTickets, setTotalTickets] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isLoadingGiveaway, setIsLoadingGiveaway] = useState(false);

  const addTicketRow = () => {
    setTicketRows((prev) => [...prev, { id: Date.now(), coupons: "", price: "" }]);
  };

  const updateTicketRow = (id, field, value) => {
    setTicketRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  useEffect(() => {
    return () => {
      if (previewImage?.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const handlePreviewUploadClick = () => {
    previewInputRef.current?.click();
  };
// handlePreviewImageChange
  const handlePreviewImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setPreviewFile(file);
    setPreviewImage((prevImage) => {
      if (prevImage?.startsWith("blob:")) {
        URL.revokeObjectURL(prevImage);
      }
      return imageUrl;
    });
    setPreviewImageName(file.name);
  };

  const normalizeNumberValue = (value) => {
    if (value === null || value === undefined) return null;
    const trimmed = String(value).trim();
    if (!trimmed) return null;
    const numeric = Number(trimmed);
    return Number.isNaN(numeric) ? trimmed : numeric;
  };

  const normalizeDateInput = (value) => {
    if (!value) return "";
    const raw = String(value);
    if (raw.includes("T")) {
      const [datePart] = raw.split("T");
      return datePart || "";
    }
    return raw;
  };

  const normalizeTimeInput = (value) => {
    if (!value) return "";
    const raw = String(value);
    if (raw.includes("T")) {
      const [, timePart] = raw.split("T");
      return timePart ? timePart.slice(0, 5) : "";
    }
    if (raw.length >= 5 && raw.includes(":")) {
      return raw.slice(0, 5);
    }
    return raw;
  };

  const normalizeTicketRows = (packages) => {
    if (!packages) return [{ id: 1, coupons: "", price: "" }];
    let list = [];
    if (Array.isArray(packages)) {
      list = packages;
    } else if (typeof packages === "string") {
      try {
        list = JSON.parse(packages);
      } catch (error) {
        list = [];
      }
    }

    if (!Array.isArray(list) || list.length === 0) {
      return [{ id: 1, coupons: "", price: "" }];
    }

    return list.map((item) => ({
      id: Date.now() + Math.random(),
      coupons: item?.couponCount ?? item?.coupons ?? "",
      price: item?.price ?? "",
    }));
  };

  const getErrorMessage = (error, fallback) => {
    if (!error) return fallback;
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      fallback
    );
  };

  useEffect(() => {
    if (!giveawayId) return;
    let isMounted = true;

    const loadGiveaway = async () => {
      setIsLoadingGiveaway(true);
      const { data: response, error } = await httpMethods.get(
        API_ENDPOINTS.ADMIN_GIVEAWAYS.BY_ID(giveawayId)
      );

      if (!isMounted) return;

      if (error) {
        setSubmitError(error.message || "Failed to load giveaway");
        setIsLoadingGiveaway(false);
        return;
      }

      const raw = response?.data ?? response;
      const data = raw?.data ?? raw?.giveaway ?? raw;

      setTitle(data?.title || "");
      setDrawDate(normalizeDateInput(data?.drawDate));
      setDrawTime(normalizeTimeInput(data?.drawTime));
      setDescription(data?.description || "");
      setTotalTickets(
        data?.totalTickets !== null && data?.totalTickets !== undefined
          ? String(data.totalTickets)
          : ""
      );
      setTicketRows(normalizeTicketRows(data?.packages));

      const bannerUrl = data?.bannerImage || data?.banner || data?.image || "";
      if (bannerUrl) {
        setPreviewImage(bannerUrl);
        setPreviewImageName("");
        setPreviewFile(null);
      }

      setIsLoadingGiveaway(false);
    };

    loadGiveaway();

    return () => {
      isMounted = false;
    };
  }, [giveawayId]);

  const buildTicketPackages = () =>
    ticketRows
      .map((row) => ({
        couponCount: normalizeNumberValue(row.coupons),
        price: normalizeNumberValue(row.price),
      }))
      .filter((row) => row.couponCount !== null || row.price !== null);

  const submitGiveaway = async (mode) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError("");

    const packages = buildTicketPackages();
    const serializedPackages = JSON.stringify(packages);
    const payload = {
      title,
      drawDate,
      drawTime,
      description,
      packages: serializedPackages,
      totalTickets: normalizeNumberValue(totalTickets),
      ...(mode === "draft" ? { status: "DRAFT" } : {}),
    };

    const hasFile = Boolean(previewFile);
    const requestBody = hasFile ? new FormData() : payload;

    if (hasFile) {
      requestBody.append("title", payload.title);
      requestBody.append("drawDate", payload.drawDate);
      requestBody.append("drawTime", payload.drawTime);
      requestBody.append("description", payload.description);
      requestBody.append("packages", serializedPackages);
      requestBody.append("totalTickets", String(payload.totalTickets ?? ""));
      if (payload.status) {
        requestBody.append("status", payload.status);
      }
      requestBody.append("bannerImage", previewFile);
    }

    const endpoint = giveawayId
      ? API_ENDPOINTS.ADMIN_GIVEAWAYS.BY_ID(giveawayId)
      : API_ENDPOINTS.ADMIN_GIVEAWAYS.CREATE;
    const request = giveawayId ? httpMethods.put : httpMethods.post;

    const { error } = await request(
      endpoint,
      requestBody,
      hasFile ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
    );

    if (error) {
      const fallbackMessage = giveawayId
        ? "Failed to update giveaway"
        : "Failed to create giveaway";
      const message = getErrorMessage(error, fallbackMessage);
      setSubmitError(message);
      toast.error(message);
    } else {
      setSubmitError("");
      const successMessage = giveawayId
        ? "Giveaway updated"
        : mode === "draft"
          ? "Draft saved"
          : "Giveaway published";
      toast.success(successMessage);
      if (onSuccess) {
        onSuccess({ mode, giveawayId });
      }
      if (onBack) {
        onBack();
      }
    }

    setIsSubmitting(false);
    return { error };
  };

  const handleSubmit = async () => {
    const { error } = await submitGiveaway("publish");
    if (!error) return;

    const message = String(error.message || "").toLowerCase();
    if (message.includes("active giveaway") && message.includes("already")) {
      await submitGiveaway("draft");
    }
  };

  const handleSubmitDraft = async () => {
    await submitGiveaway("draft");
  };

  const normalizedAuditItems =
    data?.preview?.audit?.items ||
    [
      {
        id: "audit-1",
        label: data?.auditRequirements?.requirement1,
        status: "completed",
      },
      {
        id: "audit-2",
        label: data?.auditRequirements?.requirement2,
        status: "warning",
      },
      {
        id: "audit-3",
        label: data?.auditRequirements?.requirement3,
        status: "pending",
      },
    ].filter((item) => item.label);

  const breadcrumbLabel =
    backLabel || data?.breadcrumb?.dashboard || data?.back || "Dashboard";

  const headerSubtitle = data?.header?.subtitle || data?.header?.description;

  const campaignTitleLabel =
    data?.campaignDetails?.titleLabel || data?.campaignDetails?.campaignTitle;

  const campaignDescriptionLabel =
    data?.campaignDetails?.descriptionLabel || data?.campaignDetails?.description;

  const ticketPriceLabel = data?.ticketSales?.priceLabel || data?.ticketSales?.price;

  const ticketTotalLabel =
    data?.ticketSales?.totalTicketsLabel || data?.ticketSales?.totalTickets;

  const drawDateLabel = data?.timeline?.drawDateLabel || data?.timeline?.drawDate;

  const drawTimeLabel = data?.timeline?.drawTimeLabel || data?.timeline?.drawTime;

  const mediaTitle = data?.preview?.title || data?.media?.title;

  const mediaUploadLabel = data?.preview?.uploadLabel || data?.media?.uploadText;

  const mediaUploadHint = data?.preview?.uploadHint || data?.media?.uploadHint;

  const forecastTitle = data?.preview?.forecast?.title || data?.revenueProjection?.title;

  const forecastMaxLabel =
    data?.preview?.forecast?.maxBruttowinst || data?.revenueProjection?.maxProfit;

  const forecastMaxValue =
    data?.preview?.forecast?.maxValue || data?.revenueProjection?.maxProfitValue;

  const forecastBreakEvenLabel =
    data?.preview?.forecast?.breakEvenLabel || data?.revenueProjection?.breakEven;

  const forecastBreakEvenValue =
    data?.preview?.forecast?.breakEvenValue || data?.revenueProjection?.breakEvenTickets;

  const forecastProgress = data?.preview?.forecast?.progress || 28;

  const forecastNote = data?.preview?.forecast?.note || data?.revenueProjection?.note;

  const auditTitle = data?.preview?.audit?.title || data?.auditRequirements?.title;

  const publishButtonLabel = data?.header?.publishButton || data?.buttons?.publish;
  const draftButtonLabel = data?.buttons?.draft || "Save draft";

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6 border-b border-[#F485251A] pb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <button
              onClick={onBack}
              className="text-sm md:text-base text-[#64748B] hover:text-[#F48924] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span className="text-[#F48924]">
                <CornerUpLeft size={16} />
              </span>
              <span>{breadcrumbLabel}</span>
            </button>
            <span className="text-sm md:text-base text-[#F48924] font-bold">
              <ChevronRight size={16} />
            </span>
            <span className="text-sm md:text-base text-[#F48924] ">
              {data?.header?.title}
            </span>
          </div>

          <span className="text-2xl md:text-4xl font-bold text-[#0F172A] ">
            {data?.header?.title}
          </span>
          <p className="text-[#64748B] text-base mt-3">{headerSubtitle}</p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
          <button
            type="button"
            onClick={handleSubmitDraft}
            disabled={isSubmitting || isLoadingGiveaway}
            className="w-full sm:w-auto px-5 py-2.5 bg-white text-[#F48525] border border-[#FBD7AF] rounded-xl text-base font-bold transition-colors flex items-center gap-2 justify-center cursor-pointer hover:bg-[#FFF7ED] disabled:opacity-70"
          >
            {draftButtonLabel}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || isLoadingGiveaway}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#F48525] text-white rounded-xl text-base font-bold shadow-lg shadow-orange-500/20 transition-colors flex items-center gap-2 justify-center cursor-pointer disabled:opacity-70"
          >
            <Rocket size={16} />
            {publishButtonLabel}
          </button>
        </div>
      </div>

      {submitError ? (
        <p className="text-sm font-semibold text-[#DC2626]">{submitError}</p>
      ) : null}

      <div className="space-y-6 mt-8">
        {/* Campaign Details — full width */}
        {/* Campaign Details — full width */}
        <div className="bg-white p-4 md:p-6 rounded-lg border border-[#F485251A]">
          <h3 className="font-semibold flex text-xl items-center gap-2 mb-5 text-slate-900">
            <span className="flex items-center justify-center w-fit">
              <SquarePen size={22} className="text-[#F48525]" />
            </span>
            {data?.campaignDetails?.title}
          </h3>

          {/* Title + Date + Time in one row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div>
              <label className="block text-sm font-semibold uppercase text-[#64748B] mb-2">
                {campaignTitleLabel}
              </label>
              <input
                className="w-full bg-[#F8F7F5] border border-[#F485251A] placeholder-[#64748B66] rounded-lg p-3.5 text-sm outline-none focus:ring-2 focus:ring-[#F48525]"
                placeholder={data?.campaignDetails?.titlePlaceholder || data?.campaignDetails?.campaignTitlePlaceholder}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold uppercase text-[#64748B] mb-2">
                {drawDateLabel}
              </label>
              <input
                type="date"
                className="w-full bg-[#F8F7F5] border border-[#F485251A] rounded-lg p-3.5 text-sm outline-none focus:ring-2 focus:ring-[#F48525]"
                value={drawDate}
                onChange={(e) => setDrawDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold uppercase text-[#64748B] mb-2">
                {drawTimeLabel}
              </label>
              <input
                type="time"
                className="w-full bg-[#F8F7F5] border border-[#F485251A] rounded-lg p-3.5 text-sm outline-none focus:ring-2 focus:ring-[#F48525]"
                value={drawTime}
                onChange={(e) => setDrawTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold uppercase text-[#64748B] mb-2">
              {campaignDescriptionLabel}
            </label>
            <div className="border border-[#F485251A] rounded-lg overflow-hidden bg-[#F8FAFC]">
              <textarea
                rows={6}
                className="w-full p-4 bg-[#F8F7F5] text-sm resize-none placeholder-[#64748B66] outline-none"
                placeholder={data?.campaignDetails?.descriptionPlaceholder}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Two cards in one row: Coupons | Media */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ticketing */}
          <div className="bg-white p-4 md:p-6 rounded-2xl border border-[#F485251A]">
            <h3 className="font-semibold flex text-xl items-center gap-2 mb-5 text-slate-900">
              <span className="flex items-center justify-center w-fit">
                <Ticket size={22} className="text-[#F48525]" />
              </span>
              {data?.ticketSales?.title}
            </h3>

            <div className="space-y-3">
              {ticketRows.map((row, index) => (
                <div key={row.id} className="grid grid-cols-2 gap-3">
                  <div>
                    {index === 0 && (
                      <label className="block text-xs font-semibold uppercase text-[#64748B] mb-2">
                        {data?.ticketSales?.couponsLabel || "Number of Coupons"}
                      </label>
                    )}
                    <input
                      className="w-full bg-[#F8F7F5] border border-[#E2E8F0] rounded-xl p-3.5 text-sm font-semibold text-[#0F172A] placeholder-[#64748B66] outline-none focus:ring-2 focus:ring-[#F48525]"
                      placeholder=""
                      value={row.coupons}
                      onChange={(e) => updateTicketRow(row.id, "coupons", e.target.value)}
                    />
                  </div>
                  <div>
                    {index === 0 && (
                      <label className="block text-xs font-semibold uppercase text-[#64748B] mb-2">
                        {ticketPriceLabel}
                      </label>
                    )}
                    <div className="flex items-center bg-[#F8F7F5] border border-[#E2E8F0] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#F48525]">
                      <span className="pl-3.5 text-sm font-semibold text-[#0F172A] select-none">€</span>
                      <input
                        className="flex-1 bg-transparent p-3.5 pl-1.5 text-sm font-semibold text-[#0F172A] placeholder-[#64748B66] outline-none"
                        placeholder={data?.ticketSales?.priceValue || ""}
                        value={row.price}
                        onChange={(e) => updateTicketRow(row.id, "price", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={addTicketRow}
                  className="text-sm font-semibold text-[#F48525] hover:text-[#d4711e] transition-colors cursor-pointer"
                >
                  +Add More
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#64748B] mb-2">
                  {ticketTotalLabel}
                </label>
                <input
                  className="w-full bg-[#F8F7F5] border border-[#E2E8F0] rounded-xl p-3.5 text-sm font-semibold text-[#0F172A] placeholder-[#64748B66] outline-none focus:ring-2 focus:ring-[#F48525]"
                  placeholder={data?.ticketSales?.totalTicketsValue || ""}
                  value={totalTickets}
                  onChange={(e) => setTotalTickets(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Timeline */}
          {/* Promotional Media */}
          <div className="bg-white p-4 md:p-6 rounded-2xl border border-[#F485251A]">
            <h3 className="text-base font-bold uppercase text-slate-800 mb-4">
              {mediaTitle}
            </h3>

            <button
              type="button"
              onClick={handlePreviewUploadClick}
              className={`w-full border border-dashed border-[#E2E8F0] rounded-lg bg-[#F8F7F5] flex flex-col items-center justify-center transition-colors cursor-pointer ${
                previewImage ? "p-2 md:p-3 min-h-60" : "p-4 md:p-6 hover:bg-[#f5f3f0] min-h-60"
              }`}
            >
              {previewImage ? (
                <>
                  <img
                    src={previewImage}
                    alt="Giveaway preview"
                    className="w-full max-h-80 rounded-lg object-contain bg-white"
                  />
                  <span className="mt-3 text-sm font-semibold text-form-label break-all">
                    {previewImageName}
                  </span>
                </>
              ) : (
                <>
                  <ImagePlus size={22} className="text-[#64748B] mb-2" />
                  <span className="text-base font-semibold text-slate-700">
                    {mediaUploadLabel}
                  </span>
                  <span className="text-sm text-[#64748B] mt-1">
                    {mediaUploadHint}
                  </span>
                </>
              )}
            </button>
            <input
              ref={previewInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePreviewImageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
