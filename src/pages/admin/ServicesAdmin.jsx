import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { AddServicePage } from "./Settings";
import { Eye, Pencil, Plus, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import httpMethods from "../../services/httpMethods";
import API_ENDPOINTS from "../../services/httpEndpoint";
import { ROUTES } from "../../config";
import {
  fetchServices,
  selectServices,
  selectServicesError,
  
  selectServicesStatus,
} from "../../store/slices/servicesSlice";

const resolveImageSrc = (imagePath) => {
  if (!imagePath) {
    return "";
  }

  if (/^https?:\/\//i.test(imagePath) || imagePath.startsWith("data:")) {
    return imagePath;
  }

  const baseUrl = process.env.REACT_APP_API_BASE_URL || "";
  const normalized = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;

  return baseUrl ? `${baseUrl}${normalized}` : normalized;
};

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

const normalizeService = (service) => ({
  id: service?.id || service?._id || service?.slug || "",
  name: service?.name || "",
  category: service?.category || "",
  description: service?.description || "",
  basePrice: service?.basePrice || "",
  bannerImage: service?.bannerImage || "",
  galleryImages: service?.galleryImages || [],
  status: service?.status || "",
});

const ServiceViewModal = ({ isOpen, onClose, service }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const bannerImage = resolveImageSrc(service?.bannerImage);
  const galleryImages = (service?.galleryImages || []).filter(Boolean).map(resolveImageSrc);
  const priceText = formatPrice(service?.basePrice);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl rounded-lg bg-white shadow-xl flex max-h-[90vh] flex-col">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[#E5E7EB] bg-white p-4 md:p-6">
          <h3 className="text-xl font-semibold text-[#111827]">
            {t("admin.services.viewTitle")}
          </h3>
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
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="space-y-3">
              <div>
                <div className="text-xs text-[#6B7280]">{t("admin.services.form.name")}</div>
                <div className="text-base font-semibold text-[#111827]">{service?.name || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-[#6B7280]">{t("admin.services.form.category")}</div>
                <div className="text-base">{service?.category || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-[#6B7280]">{t("admin.services.form.description")}</div>
                <div className="text-base whitespace-pre-wrap">{service?.description || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-[#6B7280]">{t("admin.services.form.price")}</div>
                <div className="text-base">{priceText || "-"}</div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden bg-[#F8FAFC] border border-[#E2E8F0]">
                {bannerImage ? (
                  <img src={bannerImage} alt="" className="h-44 w-full object-cover" />
                ) : (
                  <div className="h-44 flex items-center justify-center text-sm text-[#94A3B8]">
                    {t("admin.services.form.banner")}
                  </div>
                )}
              </div>
              {galleryImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {galleryImages.map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="h-28 overflow-hidden rounded-lg border border-[#E2E8F0]"
                    >
                      <img src={image} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-[#94A3B8]">{t("admin.services.form.gallery")}</div>
              )}
            </div>
          </div>
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

const AdminServiceCard = ({ service, onView, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const imageSrc = resolveImageSrc(service.bannerImage);
  const priceText = formatPrice(service.basePrice);

  return (
    <div className="bg-white border border-[#f1f5f9] rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-hidden p-px flex flex-col h-full transition-all duration-200 hover:shadow-[0px_4px_12px_0px_rgba(244,133,37,0.2)] hover:border-[rgba(244,133,37,0.3)]">
      <div className="aspect-video w-full overflow-hidden relative bg-[linear-gradient(135deg,rgba(15,23,42,0.9),rgba(244,133,37,0.35))]">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={service.name || "Service"}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : null}
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <p className="font-['Work_Sans',sans-serif] font-semibold text-sm uppercase tracking-wide text-body">
          {service.category || "Service"}
        </p>
        <h2 className="font-['Work_Sans',sans-serif] font-bold text-xl text-heading leading-7">
          {service.name || "Service"}
        </h2>
        <p className="font-['Work_Sans',sans-serif] font-normal text-body text-base leading-[22.75px] flex-1">
          {service.description || ""}
        </p>
        <div className="pt-4 flex items-center justify-between gap-3 flex-wrap">
          {priceText && (
            <span className="font-['Work_Sans',sans-serif] font-bold text-primary text-base leading-5">
              {priceText}
            </span>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onView}
              className="inline-flex items-center justify-center text-[#64748B] hover:text-[#0F172A]"
              aria-label={t("admin.actions.view")}
              title={t("admin.actions.view")}
            >
              <Eye size={18} />
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center justify-center text-[#64748B] hover:text-[#0F172A]"
              aria-label={t("admin.actions.edit")}
              title={t("admin.actions.edit")}
            >
              <Pencil size={18} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center justify-center text-[#EF4444] hover:text-[#B91C1C]"
              aria-label={t("admin.actions.delete")}
              title={t("admin.actions.delete")}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ServicesAdmin = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const services = useSelector(selectServices);
  const status = useSelector(selectServicesStatus);
  const error = useSelector(selectServicesError);

  const [viewService, setViewService] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState("list");
  const [editingService, setEditingService] = useState(null);

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  useEffect(() => {
    const mode = location.state?.mode;

    if (mode === "create") {
      setEditingService(null);
      setPage("form");
      navigate(ROUTES.ADMIN_SERVICES, { replace: true, state: {} });
      return;
    }

    if (mode === "edit" && location.state?.service) {
      setEditingService(location.state.service);
      setPage("form");
      navigate(ROUTES.ADMIN_SERVICES, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (location.state?.refresh) {
      dispatch(fetchServices());
    }
  }, [dispatch, location.state]);

  const handleOpenCreate = () => {
    setEditingService(null);
    setPage("form");
  };

  const handleOpenEdit = (service) => {
    setEditingService(service);
    setPage("form");
  };

  const handleSetPage = (next) => {
    setPage(next === "dashboard" ? "list" : next);
  };

  const handleSaveService = () => {
    setEditingService(null);
    setPage("list");
    dispatch(fetchServices());
  };

  const handleDelete = async () => {
    if (!deleteCandidate?.id) {
      setDeleteCandidate(null);
      return;
    }

    setIsDeleting(true);
    const { error: deleteError } = await httpMethods.delete(
      API_ENDPOINTS.ADMIN_SERVICES.DELETE(deleteCandidate.id),
    );

    setIsDeleting(false);
    setDeleteCandidate(null);

    if (!deleteError) {
      toast.success("Service verwijderd");
      dispatch(fetchServices());
      return;
    }

    toast.error(deleteError?.message || "Verwijderen mislukt");
  };

  const normalizedServices = useMemo(
    () => services.map((service) => normalizeService(service)),
    [services],
  );

  if (page === "form") {
    return (
      <AddServicePage
        setPage={handleSetPage}
        initialService={editingService}
        onSave={handleSaveService}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0D1B2A]">
            {t("admin.services.title")}
          </h1>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-[#F48525] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:bg-[#e07418]"
        >
          <Plus size={16} />
          {t("admin.services.createButton")}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {status === "loading" && (
          <div className="col-span-full text-center text-sm text-[#64748B]">
            {t("admin.services.loading")}
          </div>
        )}

        {status === "failed" && (
          <div className="col-span-full text-center text-sm text-red-600">
            {error || t("admin.services.error")}
          </div>
        )}

        {status === "succeeded" && normalizedServices.length === 0 && (
          <div className="col-span-full text-center text-sm text-[#64748B]">
            {t("admin.services.empty")}
          </div>
        )}

        {normalizedServices.map((service) => (
          <AdminServiceCard
            key={service.id}
            service={service}
            onView={() => setViewService(service)}
            onEdit={() => handleOpenEdit(service)}
            onDelete={() => setDeleteCandidate(service)}
          />
        ))}
      </div>

      <ServiceViewModal
        isOpen={Boolean(viewService)}
        onClose={() => setViewService(null)}
        service={viewService}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deleteCandidate)}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={handleDelete}
        itemName={deleteCandidate?.name}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ServicesAdmin;
