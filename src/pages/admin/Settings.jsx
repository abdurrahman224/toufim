import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { VoucherCreationPage } from "../../components/VoucherCreationPage";
import { SharedGiveawayCampaignPage } from "../../components/SharedGiveawayCampaignPage";
import httpMethods from "../../services/httpMethods";
import API_ENDPOINTS from "../../services/httpEndpoint";
import { ROUTES } from "../../config";
import toast from "react-hot-toast";
import {
  Plus,
  Gift,
  Ticket,
  Pen,
  Trash2,
  Search,
  Info,
  Image as ImageIcon,
  ImagePlus,
  Eye,
  ArrowLeft,
  Save,
  Send,
  Calendar,
  CalendarClock,
  Clock,
  Link2,
  List,
  ArrowRight,
  Wallet,
  HousePlus,
  WalletCards,
  SquarePen,
  Shield,
  CheckCircle2,
  AlertCircle,
  CircleCheck,
  AlertTriangle,
  Circle,
  UserCheck,
  User,
  TrendingUp,
  ChevronRight,
  CornerUpLeft,
  RotateCw,
  Rocket,
  Calculator,
  AlarmClockMinus,
  X,
} from "lucide-react";

const buildServiceDraft = (service) => {
  const safeService = service || {};

  return {
    id: safeService.id || "",
    name: safeService.name || "",
    category: safeService.category || "",
    description: safeService.description || "",
    price: safeService.basePrice || safeService.price || "",
    status: safeService.status || "LIVE",
  };
};

const SERVICE_CATEGORIES = [
  "Loodgietersdiensten",
  "Dakdekkersdiensten",
  "Stukadoorsdienst",
  "Elektrische diensten",
  "Tegelservices",
  "Complete vloeroplossingen op één plek",
  "Schoonmaakdiensten",
  "Algemene service",
];

// --- Sub-Components ---

const StatCard = ({
  icon: Icon,
  title,
  desc,
  actionText,
  colorClass,
  bgColor,
  onClick,
}) => (
  <div
    className="bg-[#FFFFFF] p-4 rounded-lg border border-[#F485251A] shadow-sm relative overflow-hidden group cursor-pointer transition-all hover:shadow-md flex flex-col h-full"
    onClick={onClick}
  >
    <div
      className={`${bgColor} w-12 h-12 rounded-xl flex items-center justify-center mb-3`}
    >
      <Icon className={colorClass} size={24} />
    </div>
    <h3 className="text-lg md:text-xl font-bold mb-1 text-slate-800">
      {title}
    </h3>
    <p className="text-[#64748B] text-base mb-3 leading-relaxed flex-1">
      {desc}
    </p>
    <button
      className={`${colorClass}  flex items-center gap-2 text-sm md:text-base uppercase rounded-lg mt-auto w-full justify-start overflow-hidden text-ellipsis cursor-pointer`}
      style={{ minHeight: 40 }}
    >
      {actionText}
      <ArrowRight size={16} />
    </button>
    <div
      className={`absolute -top-10 -right-10 w-30 h-30 ${bgColor} rounded-full opacity-30 group-hover:scale-110 transition-transform`}
    />
  </div>
);

const ServiceRow = ({ name, id, cat, status, onEdit, onDelete }) => (
  <tr className="group bg-white  transition-colors">
    <td className="px-6 py-5">
      <div className="text-base font-semibold text-[#1E293B]">{name}</div>
      <div className="text-sm text-[#94A3B8] uppercase font-medium mt-0.5">
        ID : {id}
      </div>
    </td>
    <td className="px-6 py-5 text-base font-semibold text-[#64748B]">{cat}</td>
    <td className="px-6 py-5">
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          status === "LIVE"
            ? "bg-emerald-50 text-emerald-600"
            : "bg-orange-50 text-orange-600"
        }`}
      >
        {status}
      </span>
    </td>
    <td className="px-6 py-5">
      <div className="flex justify-end gap-3 text-gray-300">
        <button
          type="button"
          onClick={onEdit}
          className="text-[#94A3B8] cursor-pointer hover:text-slate-600 transition-colors"
          aria-label={`Edit ${name}`}
        >
          <Pen size={16} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="text-[#94A3B8] cursor-pointer hover:text-red-500 transition-colors"
          aria-label={`Delete ${name}`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </td>
  </tr>
);

// --- Main Pages ---

const Dashboard = ({ setPage, onOpenServices, services }) => {
  const { t } = useTranslation();
  const data = t("admin.settings.dashboard", { returnObjects: true });
  const common = t("admin.settings.common", { returnObjects: true });
  const serviceRows = Array.isArray(services) ? services.slice(0, 2) : [];

  return (
    <div className="">
      <div className="mb- border-b border-[#F485251A] pb-4">
        <h1 className="text-3xl md:text-4xl font-bold text-[#0D1B2A]">
          {data.header.title}
        </h1>
        <p className="text-gray-500 text-base  mt-2">{data.header.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-8 ">
        {data.actions.map((action, idx) => {
          const IconMap = {
            HousePlus,
            Gift,
            Wallet,
          };
          const IconComponent = IconMap[action.icon] || HousePlus;
          
          return (
            <StatCard
              key={idx}
              icon={IconComponent}
              title={action.title}
              colorClass={action.colorClass}
              bgColor={action.bgColor}
              desc={action.description}
              actionText={action.actionText}
              onClick={() => {
                if (action.id === "service") {
                  setPage("add-service");
                  return;
                }

                setPage(
                  action.id === "giveaway" ? "launch-giveaway" : "create-voucher",
                );
              }}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 md:bg-white rounded-xl md:border border-[#F485251A] md:shadow-sm overflow-hidden">
          <div className="p-6 flex justify-between items-center border-b border-gray-50 bg-white pb-4">
            <h2 className="text-lg md:text-2xl font-bold text-slate-800">
              {data.serviceOverview.title}
            </h2>
            <button
              type="button"
              onClick={onOpenServices}
              className="text-sm font-semibold text-[#F48525] hover:text-[#0D1B2A] transition-colors"
            >
              {data.serviceOverview.viewAll}
            </button>
          </div>
          <table className="w-full text-left hidden md:table">
            <thead>
              <tr className="text-base bg-[#f8f7f5] uppercase text-[#64748B] border-b border-[#F485251A] ">
                <th className="px-6 py-4">{data.serviceTable.columns[0]}</th>
                <th className="px-6 py-4">{data.serviceTable.columns[1]}</th>
                <th className="px-6 py-4">{data.serviceTable.columns[2]}</th>
                <th className="px-6 py-4 text-right">{data.serviceTable.columns[3]}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F485251A]">
              {serviceRows.map((row) => (
                <ServiceRow
                  key={row.id}
                  name={row.name}
                  id={row.id}
                  cat={row.category}
                  status={row.status}
                  onEdit={onOpenServices}
                  onDelete={onOpenServices}
                />
              ))}
            </tbody>
          </table>
          <div className="md:hidden">
            {serviceRows.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-xl border border-[#F485251A] shadow-sm p-4 mb-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="font-bold text-slate-700 text-base">
                    {service.name}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${service.status === "LIVE" ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"}`}
                  >
                    {service.status}
                  </span>
                </div>
                <div className="text-sm text-gray-400 font-medium uppercase mb-1">
                  {common.idLabel}: {service.id}
                </div>
                <div className="text-sm text-gray-500 mb-2">{service.category}</div>
                <div className="flex justify-end gap-3 text-gray-300">
                  <button
                    type="button"
                    onClick={onOpenServices}
                    className="text-[#94A3B8] cursor-pointer hover:text-slate-600 transition-colors"
                    aria-label={`Edit ${service.name}`}
                  >
                    <Pen size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={onOpenServices}
                    className="text-[#94A3B8] cursor-pointer hover:text-red-500 transition-colors"
                    aria-label={`Delete ${service.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#F973161A] shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">
              {data.activeVouchers.title}
            </h2>
            <button
              type="button"
              onClick={() => setPage("create-voucher")}
              className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 cursor-pointer"
              aria-label={data.activeVouchers.addButton}
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="space-y-4">
            {data.activeVouchers.items.slice(0, 2).map((v, i) => (
              <div
                key={i}
                className="bg-[#F8FAFC] p-4 rounded-xl flex items-center gap-4 border border-transparent hover:border-gray-100 transition-all"
              >
                <div className={`w-1.5 h-10 rounded-full ${v.color}`} />
                <div>
                  <div className="text-sm font-bold text-[#1E293B] tracking-widest">
                    {v.code}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPage("create-voucher")}
            className="w-full mt-6 py-3.5 bg-orange-50 text-orange-600 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-orange-100 transition-colors cursor-pointer"
          >
            {data.activeVouchers.batchManagement}
          </button>
        </div>
      </div>
    </div>
  );
};

export const AddServicePage = ({ setPage, initialService, onSave }) => {
  const { t } = useTranslation();
  const data = t("admin.settings.addService", { returnObjects: true });
  const galleryInputRefs = useRef([]);
  const bannerInputRef = useRef(null);
  const [portfolioPreviews, setPortfolioPreviews] = useState([null, null]);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([null, null]);
  const [bannerFile, setBannerFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [formValues, setFormValues] = useState(() => buildServiceDraft(initialService));
  const isEditMode = Boolean(initialService?.id);

  useEffect(() => {
    setFormValues(buildServiceDraft(initialService));
    setBannerFile(null);
    setGalleryFiles([null, null]);

    if (initialService?.bannerImage) {
      setBannerPreview({ url: initialService.bannerImage, name: "", isObjectUrl: false });
    } else {
      setBannerPreview(null);
    }

    const gallery = Array.isArray(initialService?.galleryImages)
      ? initialService.galleryImages
      : [];
    const nextPreviews = [null, null].map((_, index) => {
      const imageUrl = gallery[index];
      return imageUrl ? { url: imageUrl, name: "", isObjectUrl: false } : null;
    });
    setPortfolioPreviews(nextPreviews);
  }, [initialService]);

  useEffect(() => {
    return () => {
      for (const preview of portfolioPreviews) {
        if (preview?.isObjectUrl && preview?.url) {
          URL.revokeObjectURL(preview.url);
        }
      }
      if (bannerPreview?.isObjectUrl && bannerPreview?.url) {
        URL.revokeObjectURL(bannerPreview.url);
      }
    };
  }, [portfolioPreviews, bannerPreview]);

  const handlePickedFiles = (index, fileList) => {
    const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
    const file = Array.from(fileList || []).find(
      (item) => item && item.type && item.type.startsWith("image/")
    );

    if (!file || file.size > MAX_IMAGE_BYTES) {
      return;
    }

    setGalleryFiles((current) => {
      const next = [...current];
      next[index] = file;
      return next;
    });
    setPortfolioPreviews((current) => {
      const next = [...current];
      if (next[index]?.isObjectUrl && next[index]?.url) {
        URL.revokeObjectURL(next[index].url);
      }
      next[index] = { url: URL.createObjectURL(file), name: file.name, isObjectUrl: true };
      return next;
    });
  };

  const handlePickedBanner = (fileList) => {
    const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
    const file = Array.from(fileList || []).find(
      (item) => item && item.type && item.type.startsWith("image/")
    );

    if (!file || file.size > MAX_IMAGE_BYTES) {
      return;
    }

    if (bannerPreview?.isObjectUrl && bannerPreview?.url) {
      URL.revokeObjectURL(bannerPreview.url);
    }

    setBannerFile(file);
    setBannerPreview({ url: URL.createObjectURL(file), name: file.name, isObjectUrl: true });
  };

  const openGalleryPicker = (index) => {
    galleryInputRefs.current[index]?.click();
  };

  const openBannerPicker = () => {
    bannerInputRef.current?.click();
  };

  const gallerySlots = portfolioPreviews.map((preview, index) => ({
    preview,
    index,
  }));

  const handleChange = (field) => (event) => {
    setFormValues((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async () => {
    const trimmedName = formValues.name.trim();
    const trimmedCategory = formValues.category.trim();

    if (!trimmedName || !trimmedCategory) {
      return;
    }

    if (!SERVICE_CATEGORIES.includes(trimmedCategory)) {
      setSubmitError(
        "Ongeldige categorie. Moet een van de volgende zijn: " +
          SERVICE_CATEGORIES.join(", "),
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    const payload = new FormData();
    payload.append("name", trimmedName);
    payload.append("category", trimmedCategory);
    payload.append("description", formValues.description.trim());
    payload.append("basePrice", formValues.price.trim());

    if (bannerFile) {
      payload.append("bannerImage", bannerFile);
    }

    galleryFiles.forEach((file) => {
      if (file) {
        payload.append("galleryImages", file);
      }
    });

    const request = isEditMode
      ? httpMethods.put(API_ENDPOINTS.ADMIN_SERVICES.UPDATE(initialService.id), payload, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      : httpMethods.post(API_ENDPOINTS.ADMIN_SERVICES.CREATE, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });

    const { data: response, error } = await request;

    if (error) {
      setSubmitError(error.message || "Failed to save service.");
      toast.error(error.message || "Service opslaan mislukt");
      setIsSubmitting(false);
      return;
    }

    const payloadData = response?.data ?? response;
    const savedService = payloadData?.data ?? payloadData?.service ?? payloadData;

    onSave({
      ...formValues,
      ...savedService,
      name: trimmedName,
      category: trimmedCategory,
      description: formValues.description.trim(),
      price: formValues.price.trim(),
    });

    toast.success(isEditMode ? "Service bijgewerkt" : "Service aangemaakt");

    setIsSubmitting(false);
    setPage("dashboard");
  };

  return (
    <div className="animate-in slide-in-from-right-4 duration-500">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setPage('dashboard')}
          className="text-sm md:text-base text-[#64748B] hover:text-[#F48924] transition-colors flex items-center gap-2 cursor-pointer"
        >
          <span className="text-[#F48924]">
            {/* <ArrowLeft size={14} /> */}
            <CornerUpLeft size={14} />
          </span>
          <span>{data.breadcrumb.title}</span>
        </button>
        <span className="text-sm  text-[#F48924] font-bold">
          <ChevronRight size={14} />
        </span>
        <span className="text-base  text-[#F48924] ">
          {data.breadcrumb.title}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-9 border-b border-[#F485251A] pb-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#0D1B2A] mb-2">
            {data.header.title}
          </h1>
          <p className="text-[#64748B] text-base mt-1 ">
            {data.header.description}
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-2 py-2.5 bg-[#F48525] text-white rounded-lg text-sm font-bold shadow-lg shadow-orange-500/20 transition-colors flex items-center gap-2 justify-center cursor-pointer disabled:opacity-70"
          >
            <Rocket size={16} />
            {data.buttons.publish}
          </button>
        </div>
      </div>

      {submitError ? (
        <p className="text-sm font-semibold text-[#DC2626]">{submitError}</p>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-4 md:p-6 rounded-3xl border border-[#F485251A]">
            <div className="flex items-center gap-2 mb-4 text-lg font-bold text-slate-800">
              <Info className="text-[#F48525]" size={20} />{' '}
              {data.specification.title}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-[#64748B] uppercase mb-2">
                  {data.specification.serviceName}
                </label>
                <input
                  className="placeholder-gray-400 w-full bg-[#F8F7F5] border-[#F485251A] rounded-lg p-4 text-sm focus:ring-2 ring-[#F485251A] outline-none"
                  placeholder={data.specification.serviceNamePlaceholder}
                  value={formValues.name}
                  onChange={handleChange("name")}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#64748B] uppercase mb-2">
                  {data.specification.displayName}
                </label>
                <select
                  className="placeholder-gray-400 w-full bg-[#F8F7F5] border-[#F485251A] rounded-lg p-4 text-sm focus:ring-2 ring-[#F485251A] outline-none"
                  value={formValues.category}
                  onChange={handleChange("category")}
                >
                  <option value="" disabled>
                    {data.specification.displayNamePlaceholder}
                  </option>
                  {SERVICE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <label className="block text-sm font-semibold text-[#64748B] uppercase mb-2">
              {data.specification.description}
            </label>
            <textarea
              rows={5}
              className=" placeholder-gray-400 w-full bg-[#F8F7F5] border-[#F485251A] rounded-xl p-4 text-sm focus:ring-2 ring-[#F485251A] outline-none resize-none"
              placeholder={data.specification.descriptionPlaceholder}
              value={formValues.description}
              onChange={handleChange("description")}
            />
          </div>

          <div className="bg-white p-4 md:p-6 rounded-3xl border border-[#F485251A]">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-6">
              <div>
                <div className="flex items-center gap-2 font-bold text-lg text-slate-800 pb-1">
                  <ImageIcon className="text-orange-500" size={20} />
                  <h2>{data.portfolio.title}</h2>
                </div>
                <p className="text-base text-[#64748B]">
                  {data.portfolio.description}
                </p>
              </div>

              <span className="text-sm font-bold text-[orange-500] bg-[#FFEDD5] px-2 py-1 rounded">
                {data.portfolio.maxSize}
              </span>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#64748B] uppercase mb-2">
                Banner Image
              </label>
              <div
                className="border-2 border-dashed border-[#F485251A] rounded-lg flex flex-col items-center justify-center p-6 bg-gray-50/50 cursor-pointer hover:bg-gray-100/50 transition-colors"
                onClick={openBannerPicker}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openBannerPicker();
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handlePickedBanner(e.dataTransfer?.files);
                }}
                role="button"
                tabIndex={0}
              >
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    handlePickedBanner(e.target.files);
                    e.target.value = "";
                  }}
                />
                {bannerPreview ? (
                  <div className="w-full">
                    <img
                      src={bannerPreview.url}
                      className="w-full h-35 object-cover rounded-lg"
                      alt={bannerPreview.name || data.portfolio.imageAlt}
                    />
                    <p className="text-sm font-semibold text-[#64748B] text-center mt-3 break-all">
                      {bannerPreview.name}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                      <ImagePlus size={18} className="text-orange-400" />
                    </div>
                    <p className="text-sm font-semibold text-gray-500 text-center uppercase leading-tight">
                      Upload banner image
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gallerySlots.map(({ preview, index }) => (
                <div
                  key={index}
                  className="relative border-2 border-dashed border-[#F485251A] rounded-lg flex flex-col items-center justify-center p-6 bg-gray-50/50 cursor-pointer hover:bg-gray-100/50 transition-colors"
                  onClick={() => openGalleryPicker(index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openGalleryPicker(index);
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    handlePickedFiles(index, e.dataTransfer?.files);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <input
                    ref={(node) => {
                      galleryInputRefs.current[index] = node;
                    }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      handlePickedFiles(index, e.target.files);
                      e.target.value = "";
                    }}
                  />
                  {preview ? (
                    <div className="w-full">
                      <img
                        src={preview.url}
                        className="w-full h-35 object-cover rounded-lg"
                        alt={preview.name || data.portfolio.imageAlt}
                      />
                      <p className="text-sm font-semibold text-[#64748B] text-center mt-3 break-all">
                        {preview.name}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                        <ImageIcon size={18} className="text-orange-400" />
                      </div>
                      <p className="text-sm font-semibold text-gray-500 text-center uppercase leading-tight">
                        {data.portfolio.dropzoneText}
                      </p>
                      <p className="text-sm text-[#64748B] text-center uppercase leading-tight">
                        {data.portfolio.dropzoneFormat}
                      </p>
                    </>
                  )}
                  {preview ? (
                    <button
                      type="button"
                      className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white text-[#94A3B8] shadow flex items-center justify-center hover:text-slate-600"
                      onClick={(event) => {
                        event.stopPropagation();
                        setGalleryFiles((current) => {
                          const next = [...current];
                          next[index] = null;
                          return next;
                        });
                        setPortfolioPreviews((current) => {
                          const next = [...current];
                          if (next[index]?.isObjectUrl && next[index]?.url) {
                            URL.revokeObjectURL(next[index].url);
                          }
                          next[index] = null;
                          return next;
                        });
                      }}
                      aria-label="Remove image"
                    >
                      <X size={14} />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-4 md:p-6 rounded-3xl border border-[#F485251A]">
            <div className="flex items-center gap-2 font-bold text-lg  text-slate-800 mb-6 text-base">
              <span className="text-orange-500">
                <WalletCards />
              </span>{' '}
              {data.pricing.title}
            </div>
            <label className="block text-base font-semibold text-[#64748B] uppercase mb-2">
              {data.pricing.basePrice}
            </label>
            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                €
              </span>
              <input
                className="placeholder-gray-400 w-full bg-[#F8F7F5] border-none rounded-xl p-4 pl-8 text-sm outline-none"
                placeholder={data.pricing.pricePlaceholder}
                value={formValues.price}
                onChange={handleChange("price")}
              />
            </div>
            <div className="bg-[#FFEDD54D] p-4 rounded-xl flex gap-3 items-center">
              <Info size={20} className="text-[#7C2D12] shrink-0" />
              <p className="text-base text-[#7C2D12] leading-relaxed font-medium">
                {data.pricing.info}
              </p>
            </div>
          </div>

          {/* <div className="bg-[#0D1B2A] rounded-xl p-4 md:p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm font-semibold text-[#F48525] uppercase  mb-1">
                  {data.preview.label}
                </p>
                <h3 className="text-xl font-semibold">
                  {data.preview.serviceName}
                </h3>
              </div>
              <Eye size={50} className="opacity-20 " />
            </div>
            <p className="text-base text-[#94A3B8] mb-6  leading-relaxed">
              {data.preview.description}
            </p>
            <div className="flex justify-between items-center">
              <div className="text-xl font-bold">{formValues.price || data.preview.price}</div>
              <button className="text-xs font-semibold uppercase tracking-widest bg-[#FFFFFF1A] px-4 py-2 rounded-sm hover:bg-white/20 transition-colors cursor-pointer">
                {data.preview.startingFrom}
              </button>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};



const LaunchGiveawayPage = ({ setPage }) => {
  const { t } = useTranslation();
  const data = t("admin.settings.launchGiveaway", { returnObjects: true });

  return (
    <SharedGiveawayCampaignPage
      translationKey="admin.settings.launchGiveaway"
      onBack={() => setPage("dashboard")}
      backLabel={data?.breadcrumb?.title}
    />
  );
};

// --- Main App Controller ---

export default function Settings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dashboardData = t("admin.settings.dashboard", { returnObjects: true });
  const [page, setPage] = useState("dashboard");
  const [services, setServices] = useState(() =>
    dashboardData.serviceTable.rows.map((service) => buildServiceDraft(service)),
  );
  const [editingService, setEditingService] = useState(null);
  const [returnRoute, setReturnRoute] = useState(null);

  useEffect(() => {
    const mode = location.state?.mode;

    setReturnRoute(location.state?.returnTo || null);

    if (mode === "create") {
      setEditingService(null);
      setPage("add-service");
      return;
    }

    if (mode === "edit" && location.state?.service) {
      setEditingService(buildServiceDraft(location.state.service));
      setPage("add-service");
    }
  }, [location.state]);

  const handleSetPage = (newPage) => {
    if (newPage === "add-service") {
      navigate(ROUTES.ADMIN_SERVICES, {
        state: { mode: "create" },
      });
      return;
    }

    if (newPage === "create-voucher") {
      navigate(ROUTES.ADMIN_MARKETPLACE_ORDERS, {
        state: { mode: "create" },
      });
      return;
    }

    if (newPage === "launch-giveaway") {
      navigate(ROUTES.ADMIN_LEADS, {
        state: { mode: "create" },
      });
      return;
    }

    setPage(newPage);
    navigate(ROUTES.ADMIN_CASE_STUDIES, {
      replace: true,
      state: { ...location.state },
    });
  };

  const handleEditService = (service) => {
    setEditingService(buildServiceDraft(service));
    handleSetPage("add-service");
  };

  const handleDeleteService = async (serviceId) => {
    const { error } = await httpMethods.delete(
      API_ENDPOINTS.ADMIN_SERVICES.DELETE(serviceId),
    );

    if (error) {
      return;
    }

    setServices((current) => current.filter((service) => service.id !== serviceId));
  };

  const handleCreateService = () => {
    setEditingService(null);
    handleSetPage("add-service");
  };

  const handleSaveService = (serviceDraft) => {
    setServices((current) => {
      if (serviceDraft.id) {
        return current.map((service) =>
          service.id === serviceDraft.id ? { ...service, ...serviceDraft } : service,
        );
      }

      const nextId = serviceDraft.id || `SRV-${String(Date.now()).slice(-4)}`;
      return [...current, { ...serviceDraft, id: nextId }];
    });
    setEditingService(null);
    if (returnRoute) {
      navigate(returnRoute, { state: { refresh: true } });
      return;
    }
    setPage("dashboard");
  };

  return (
    <div className=" text-slate-900 font-sans selection:bg-orange-100 ">
      {/* Sidebar / Sidebar Navigation can be added here */}
      <main className="">
        {page === "dashboard" && (
          <Dashboard
            setPage={handleSetPage}
            onOpenServices={() => navigate(ROUTES.ADMIN_SERVICES)}
            services={services}
          />
        )}
        {page === "add-service" && (
          <AddServicePage
            setPage={handleSetPage}
            initialService={editingService}
            onSave={handleSaveService}
          />
        )}
        {page === "create-voucher" && (
          <VoucherCreationPage
            setPage={handleSetPage}
            translationKey="admin.settings.createVoucher"
          />
        )}
        {page === "launch-giveaway" && (
          <LaunchGiveawayPage setPage={handleSetPage} />
        )}
      </main>
    </div>
  );
}
