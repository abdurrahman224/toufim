import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Ticket,
  AlarmClockMinus,
  ChevronRight,
  CornerUpLeft,
  Rocket,
  User,
} from "lucide-react";
import httpMethods from "../services/httpMethods";
import API_ENDPOINTS from "../services/httpEndpoint";

export function VoucherCreationPage({
  setPage,
  onBack,
  translationKey = "admin.settings.createVoucher",
  editVoucher = null,
}) {
  const { t } = useTranslation();
  const data = t(translationKey, { returnObjects: true });

  const [code, setCode] = useState("");
  const [pct, setPct] = useState("20");
  const normalizeDiscountType = (value) => {
    const raw = String(value || "").trim().toLowerCase();
    if (raw === "flat" || raw === "fixed" || raw === "fixed amount" || raw === "fixedamount") {
      return "FLAT";
    }
    if (raw === "percentage" || raw === "%" || raw === "percent") {
      return "PERCENTAGE";
    }
    return "PERCENTAGE";
  };

  const [discountType, setDiscountType] = useState(
    normalizeDiscountType(data.voucherData.percentageOption || "PERCENTAGE"),
  );
  const [name, setName] = useState("");
  const [handle, setHandle] = useState(
    (data.influencer?.handlePlaceholder || data.defaults?.handle || "alex_builds").replace(/^@/, ""),
  );
  const [limit, setLimit] = useState(data.usageAndLimits?.usageLimitValue || data.defaults?.usageLimit || "02");
  const [expires, setExpires] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const isEditMode = Boolean(editVoucher?.rawId || editVoucher?.id);

  const normalizeDateInput = (value) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toISOString().slice(0, 10);
  };

  useEffect(() => {
    if (!isEditMode) return;

    setCode(String(editVoucher?.code ?? ""));
    setPct(String(editVoucher?.discountValue ?? ""));
    setDiscountType(
      normalizeDiscountType(
        editVoucher?.discountType || data.voucherData.percentageOption || "PERCENTAGE",
      ),
    );
    setLimit(String(editVoucher?.usageLimit ?? ""));
    setExpires(normalizeDateInput(editVoucher?.expirationDate));
  }, [
    data.voucherData.percentageOption,
    editVoucher?.code,
    editVoucher?.discountType,
    editVoucher?.discountValue,
    editVoucher?.expirationDate,
    editVoucher?.usageLimit,
    isEditMode,
  ]);

  const generateVoucherCode = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const pickLetter = () => letters[Math.floor(Math.random() * letters.length)];
    const words = ["FALL", "SALE", "WIN", "DEAL", "SAVE", "PROMO"];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const yearSuffix = new Date().getFullYear().toString().slice(-2);

    setCode(`${pickLetter()}${pickLetter()}${pickLetter()}-${randomWord}-${yearSuffix}`);
  };

  const hasCodeInput = code.trim().length > 0;
  const fallbackCode = data.voucherData.codePlaceholder || "AMBER-FALL-24";
  const cardCode = (hasCodeInput ? code.trim() : fallbackCode).toUpperCase();
  const [firstCodePart = "AMBER", ...restCodeParts] = cardCode.split("-");
  const secondCodePart = restCodeParts.length ? restCodeParts.join("-") : "FALL-24";

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (setPage) {
      setPage("dashboard");
    }
  };

  const breadcrumbLabel = data.breadcrumb?.title || data.breadcrumb?.dashboard || "Vouchers";

  const handleCreateVoucher = async () => {
    if (isSubmitting) return;

    const trimmedCode = code.trim();
    const trimmedDiscount = String(pct).trim();
    const trimmedLimit = String(limit).trim();
    const trimmedExpires = String(expires).trim();

    setSubmitError("");
    setSubmitSuccess("");

    if (!trimmedCode) {
      setSubmitError("Please enter a voucher code.");
      return;
    }

    const normalizedDiscountType = normalizeDiscountType(discountType);

    if (!normalizedDiscountType) {
      setSubmitError("Please select a discount type.");
      return;
    }

    if (!trimmedDiscount) {
      setSubmitError("Please enter a discount value.");
      return;
    }

    if (!trimmedLimit) {
      setSubmitError("Please enter a usage limit.");
      return;
    }

    if (!trimmedExpires) {
      setSubmitError("Please select an expiration date.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      code: trimmedCode,
      discountType: normalizedDiscountType,
      discountValue: trimmedDiscount,
      usageLimit: trimmedLimit,
      expirationDate: trimmedExpires,
    };

    const request = isEditMode
      ? httpMethods.put(
          API_ENDPOINTS.ADMIN_VOUCHERS.UPDATE(editVoucher?.rawId || editVoucher?.id),
          payload,
        )
      : httpMethods.post(
          API_ENDPOINTS.ADMIN_VOUCHERS.CREATE,
          payload,
        );

    const { error } = await request;

    if (error) {
      setSubmitError(
        error.message || (isEditMode ? "Failed to update voucher." : "Failed to create voucher."),
      );
    } else {
      setSubmitSuccess(
        isEditMode ? "Voucher updated successfully." : "Voucher created successfully.",
      );
    }

    setIsSubmitting(false);
  };

  return (
    <div className="animate-in slide-in-from-right-4 duration-500">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={handleBack}
          className="text-sm md:text-base text-[#64748B] hover:text-[#F48924] transition-colors flex items-center gap-2 cursor-pointer"
        >
          <span className="text-[#F48924]">
            <CornerUpLeft size={14} />
          </span>
          <span>{breadcrumbLabel}</span>
        </button>
        <span className="text-sm md:text-base text-[#F48924] font-bold">
          <ChevronRight size={14} />
        </span>
        <span className="text-sm  text-[#F48924]  ">
          {data.breadcrumb?.title}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-8 border-b border-[#F485251A] pb-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-[#0F172A] uppercase tracking-tight">
            {data.header?.title}
          </h1>
          <p className="text-[#64748B] text-sm md:text-base mt-1">
            {data.header?.description || data.header?.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
          <button
            type="button"
            onClick={handleCreateVoucher}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#F48525] text-white rounded-lg text-sm font-bold shadow-lg shadow-orange-500/20 transition-colors flex items-center gap-2 justify-center cursor-pointer disabled:opacity-70"
          >
            <Rocket size={16} />
            {isEditMode
              ? data.buttons?.update || data.header?.updateButton || "Update"
              : data.buttons?.create || data.header?.publishButton}
          </button>
        </div>
      </div>

      {submitError ? (
        <p className="text-sm font-semibold text-[#DC2626]">{submitError}</p>
      ) : null}
      {submitSuccess ? (
        <p className="text-sm font-semibold text-[#16A34A]">{submitSuccess}</p>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-5">
          <div className="bg-white p-4 md:p-6 rounded-xl border border-[#F485251A]">
            <h3 className="font-bold flex items-center text-lg gap-2 mb-5 text-[#0F172A]">
              <Ticket className="text-[#F48525]" size={22} /> {data.voucherData.title}
            </h3>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-[#64748B] uppercase mb-2 ">
                {data.voucherData.code}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  className="flex-1 bg-[#F8F7F5] border border-[#F485251A] rounded-xl p-3.5 text-base outline-none focus:ring-2 focus:ring-[#F485251A] placeholder-gray-400"
                  placeholder={data.voucherData.codePlaceholder}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <button
                  type="button"
                  onClick={generateVoucherCode}
                  className="bg-[#0F172A] text-white px-5 rounded-xl flex items-center justify-center gap-2 text-[11px] font-bold min-h-11.5 cursor-pointer"
                >
                  <AlarmClockMinus size={14} /> {data.voucherData.generateBtn}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#64748B] uppercase mb-2">
                  {data.voucherData.discountType}
                </label>
                <select
                  className="w-full bg-[#F8F7F5] border border-[#F485251A] rounded-xl p-3.5 text-sm outline-none"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                >
                  <option value="PERCENTAGE">PERCENTAGE</option>
                  <option value="FLAT">FLAT</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#64748B] uppercase mb-2">
                  {data.voucherData.discountValue}
                </label>
                <div className="relative">
                  <input
                    className="w-full bg-[#F8F7F5] border border-[#F485251A] rounded-xl p-3.5 pr-8 text-base outline-none placeholder-gray-400"
                    value={pct}
                    onChange={(e) => setPct(e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] font-bold text-sm">
                    {data.voucherData.percentageSymbol}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-xl border border-[#F485251A]">
            <h3 className="font-bold flex items-center gap-2 mb-5 text-slate-900 text-lg ">
              <AlarmClockMinus className="text-[#F48525]" size={22} /> {data.usageAndLimits.title}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#64748B] uppercase mb-2">
                  {data.usageAndLimits.usageLimit}
                </label>
                <input
                  className="placeholder-gray-400 w-full bg-[#F8F7F5] border border-[#F485251A] rounded-xl p-3.5 text-sm font-semibold outline-none"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#64748B] uppercase mb-2">
                  {data.usageAndLimits.expirationDate || data.usageAndLimits.expiryDate}
                </label>
                <input
                  type="date"
                  className=" placeholder-gray-400 w-full bg-[#F8F7F5] border border-[#F485251A] rounded-xl p-3.5 text-sm font-semibold outline-none"
                  value={expires}
                  onChange={(e) => setExpires(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="text-xs md:text-sm font-semibold  uppercase  text-[#64748B] px-1">
            {data.preview.title}
          </div>
          <div className="relative overflow-hidden rounded-[18px] bg-[#07173B] shadow-[0_20px_35px_rgba(7,23,59,0.25)]">
            <div className="pointer-events-none absolute -right-10 -top-14 h-50 w-50 rounded-full border-22 border-[#7D503D]/35" />

            <div className="relative z-10 px-9 pb-6 pt-6">
              <div className="mb-3 flex items-start justify-between">
                <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#7F90AD]">
                  {data.preview.badge}
                </span>
                <span className="rounded-md bg-[#273651] px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.06em] text-[#F3F7FF]">
                  {data.preview.status}
                </span>
              </div>

              <p className="mb-4 text-2xl font-bold uppercase italic leading-none text-[#F48525]">
                {name ? name.toUpperCase() : "AMBER SCHREEUW"}
              </p>

              <div className="text-center">
                <p className="text-5xl font-bold leading-none text-[#ECF3FF]">{pct || "20"}%</p>
                <p className="mx-auto mt-3 max-w-72.5 font-bold uppercase leading-[1.35] tracking-[0.30em] text-[#94A3B8]">
                  {data.preview.discountDescription}
                </p>
              </div>

              <div className="mt-9 rounded-2xl border border-[#304469] bg-[#1A2745] px-6 py-4 text-center">
                <p className="mb-5 text-xs font-semibold uppercase text-[#60708F]">
                  {data.preview.codeLabel}
                </p>
                <p className="text-2xl font-bold uppercase leading-tight tracking-[0.12em] text-[#EEF3FF]">
                  {firstCodePart} - {secondCodePart}
                </p>
              </div>
            </div>

            <div className="relative z-10 flex items-end justify-between border-t border-[#25395F] bg-[#1F2E4A] px-8 py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#324665] text-[#AAB8CF]">
                  <User size={18} strokeWidth={2.25} />
                </div>
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#7A8CA9]">
                    PARTNER
                  </p>
                  <p className="text-lg font-semibold mt-1 leading-none text-[#F1F6FF]">
                    @{handle || "alex_builds"}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#7A8CA9]">
                  GELDIG TOT
                </p>
                <p className="text-lg font-semibold leading-none text-[#F1F6FF] mt-1">
                  {data.preview.validThru}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
