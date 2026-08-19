import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowRight,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  CirclePlus,
  Clock3,
  Download,
  EllipsisVertical,
  ExternalLink,
  Eye,
  Ticket,
  Trash2,
  TrendingUp,
  WalletCards,
} from 'lucide-react';
import {
  fetchDashboardStats,
  selectTotalLeads,
  selectRevenueThisMonth,
  selectActiveGiveaways,
  selectTotalTicketsSold,
  selectRecentLeads,
  selectDashboardStatus,
  selectDashboardError,
} from '../../store/slices/dashboardSlice';
import httpMethods from '../../services/httpMethods';
import API_ENDPOINTS from '../../services/httpEndpoint';
import ViewModal from '../../components/ViewModal';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import toast from 'react-hot-toast';
import { API_CONFIG } from '../../config';

const ICON_MAP = {
  ChartNoAxesColumnIncreasing,
  WalletCards,
  CalendarDays,
  Ticket,
  CirclePlus,
  Download,
  TrendingUp,
};

const STATUS_STYLES = {
  processing: {
    pill: 'bg-[#FFF2DC] text-[#D97706]',
    dot: 'bg-[#F59E0B]',
    bgColor: 'bg-[#FFF2DC]',
    textColor: 'text-[#D97706]',
  },
  active: {
    pill: 'bg-[#E7F0FF] text-[#3B82F6]',
    dot: 'bg-[#60A5FA]',
    bgColor: 'bg-[#E7F0FF]',
    textColor: 'text-[#3B82F6]',
  },
  contacted: {
    pill: 'bg-[#F1E8FF] text-[#8B5CF6]',
    dot: 'bg-[#A78BFA]',
    bgColor: 'bg-[#F1E8FF]',
    textColor: 'text-[#8B5CF6]',
  },
  quoted: {
    pill: 'bg-[#E8EDFF] text-[#4F46E5]',
    dot: 'bg-[#818CF8]',
    bgColor: 'bg-[#E8EDFF]',
    textColor: 'text-[#4F46E5]',
  },
  closed: {
    pill: 'bg-[#EEF2F7] text-[#64748B]',
    dot: 'bg-[#94A3B8]',
    bgColor: 'bg-[#EEF2F7]',
    textColor: 'text-[#64748B]',
  },
};

const ACTION_VARIANT_CLASS = {
  primary:
    'bg-[#F48525] text-white border-[#F58626] ',
  secondary:
    'bg-[#F485251A] text-[#F48525] border-[#FBD7AF] hover:bg-[#FFEFD9] active:bg-[#FFE4BF]',
  ghost:
    'bg-white text-[#374151] border-[#E6EAF0] hover:bg-gray-50 active:bg-gray-100',
};

const STATUS_HOVER_CLASS = {
  processing: 'hover:bg-[#FEF3C7]',
  active: 'hover:bg-[#DBEAFE]',
  contacted: 'hover:bg-[#F1E8FF]',
  quoted: 'hover:bg-[#E8EDFF]',
  closed: 'hover:bg-[#EEF2F7]',
};

const apiValueToStatusTone = {
  'in afwachting': 'processing',
  'gecontacteerd': 'contacted',
  'geoffreerd': 'quoted',
  'voltooid': 'closed',
  'gesloten': 'closed',
  behandeling: 'processing',
  uitvoering: 'processing',
};

const getStatusTone = (status) => {
  const value = (status || '').toLowerCase();
  if (
    value.includes('afwachting') ||
    value.includes('behandeling') ||
    value.includes('uitvoering') ||
    value.includes('pending')
  )
    return 'processing';
  if (value.includes('active') || value.includes('actief')) return 'active';
  if (value.includes('contact') || value.includes('gecontacteerd')) return 'contacted';
  if (
    value.includes('quote') ||
    value.includes('offerte') ||
    value.includes('geciteerd') ||
    value.includes('geoffreerd')
  )
    return 'quoted';
  if (
    value.includes('close') ||
    value.includes('afgerond') ||
    value.includes('completed') ||
    value.includes('gesloten') ||
    value.includes('voltooid')
  )
    return 'closed';
  return 'closed';
};

const resolveImageUrl = (url) => {
  if (!url) return '';

  const raw = String(url).trim();
  if (!raw) return '';

  const fixedProtocol = raw
    .replace(/^http:\/\//i, 'http://')
    .replace(/^https:\/\//i, 'https://');

  if (/^https?:\/\//i.test(fixedProtocol)) return fixedProtocol;

  const embeddedHttpIndex = fixedProtocol.search(/https?:\/\//i);
  if (embeddedHttpIndex > 0) {
    return fixedProtocol.slice(embeddedHttpIndex);
  }

  const baseUrl = API_CONFIG.BASE_URL || '';
  if (!baseUrl) return fixedProtocol;

  const trimmedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = fixedProtocol.startsWith('/')
    ? fixedProtocol
    : `/${fixedProtocol}`;

  if (normalizedPath.startsWith('/uploads') && /\/api$/i.test(trimmedBase)) {
    return `${trimmedBase.replace(/\/api$/i, '')}${normalizedPath}`;
  }

  return `${trimmedBase}${normalizedPath}`;
};

const resolveCampaignImage = (value) => {
  if (!value) return '';

  if (typeof value === 'string') {
    return resolveImageUrl(value);
  }

  if (typeof value === 'object') {
    const candidate = value.url || value.src || value.path || value.location;
    return resolveImageUrl(candidate);
  }

  return '';
};


const StatCard = ({ label, value, trend, icon, trendIcon }) => {
  const Icon = ICON_MAP[icon];
  const TrendIcon = ICON_MAP[trendIcon];

  return (
    <article className='rounded-sm border border-[#F485251A] bg-white px-4 py-4.5'>
      <div className='flex items-start justify-between gap-3'>
        <p className='text-base leading-4 md:font-medium text-[#64748B]'>{label}</p>
        <div className='flex h-8 w-8 items-center justify-center rounded-md bg-[#F485251A]'>
          {Icon ? <Icon size={22} className='text-[#F48525]' aria-hidden='true' /> : null}
        </div>
      </div>
      <p className='mt-3 text-3xl leading-none font-semibold md:font-bold tracking-[-0.02em] text-[#111827]'>
        {value}
      </p>
      {/* <p className={`mt-2.5 text-sm font-semibold flex items-center gap-1 ${TrendIcon ? 'text-[#22C55E]' : 'text-[#94A3B8]'}`}>
        {TrendIcon ? <TrendIcon size={14} aria-hidden='true' /> : null}
        {trend}
      </p> */}
    </article>
  );
};

const ActionButton = ({ label, icon, variant, onClick }) => {
  const Icon = ICON_MAP[icon];

  return (
    <button
      type='button'
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg border px-3.5 py-3 text-base font-semibold cursor-pointer ${
        ACTION_VARIANT_CLASS[variant] || ACTION_VARIANT_CLASS.ghost
      }`}
    >
      <span className=''>{label}</span>
      {Icon ? <Icon size={15} aria-hidden='true' /> : null}
    </button>
  );
};

const CampaignPanel = ({ campaign, onAnalyticsClick }) => (
  <section className='rounded-sm border border-[#F485251A] bg-white overflow-hidden'>
    <div className='grid grid-cols-1 lg:grid-cols-[300px_2fr]'>
      <div className='h-48 sm:h-56 md:h-75 w-full self-stretch relative overflow-hidden'>
        <img src={campaign.image?.src || ''} alt={campaign.image?.alt || ''} className='w-full h-full object-cover' />
      </div>

      <div className='px-4 py-4 sm:px-5'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h2 className=' text-xl md:text-2xl  font-bold text-[#111827]'>
              {campaign.title}
            </h2>
            <p className='mt-2 md:max-w-165 text-base text-[#6B7280]'>
              {campaign.description}
            </p>
          </div>
          <span className='rounded-full bg-[#F485251A] px-2.5 py-1 text-sm md:font-semibold tracking-[0.04em] text-[#F48525]'>
            {campaign.status}
          </span>
        </div>

        <div className='mt-8'>
          <div className='flex items-center justify-between text-base font-semibold text-[#374151]'>
            <span className=' text-[#0F172A]'>{campaign.soldLabel}</span>
            <span className='font-bold'>{campaign.soldPercent}</span>
          </div>
          <div className='mt-2 h-2 md:h-3 rounded-full bg-[#F3F4F6]'>
            <div
              className='h-2 md:h-3 rounded-full bg-[#F58626]'
              style={{ width: `${campaign.progress}%` }}
            />
          </div>
          <p className='mt-2 text-right text-sm md:text-base text-[#64748B]'>
            {campaign.soldMeta}
          </p>
        </div>

        <div className='mt-6 md:mt-8 flex items-center justify-between border-t border-[#F485251A] pt-3.5'>
          <div className='flex items-center gap-2 text-sm md:text-base text-[#475569]'>
            <Clock3 size={20} className='text-[#F48525]' aria-hidden='true' />
            <span>{campaign.daysLeft}</span>
          </div>
          <button
            type='button'
            onClick={onAnalyticsClick}
            className='inline-flex items-center justify-end gap-2 text-sm md:text-base  text-[#F58626] hover:text-[#e97814] hover:underline transition-colors cursor-pointer'
          >
            <span>{campaign.analyticsCta}</span>
            <ArrowRight size={18} aria-hidden='true' className='flex-shrink-0' />
          </button>
        </div>
      </div>
    </div>
  </section>
);

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
  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, left: 0 });

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

    timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside, false);
      document.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
    }, 0);

    if (buttonRect) {
      const menuWidth = 144;
      const menuHeight = 132;
      const gap = 8;

      const centeredLeft =
        buttonRect.left + buttonRect.width / 2 - menuWidth / 1;
      const boundedLeft = Math.min(
        Math.max(gap, centeredLeft),
        window.innerWidth - menuWidth - gap
      );

      const openUpward = buttonRect.bottom + menuHeight + gap > window.innerHeight;
      const top = openUpward
        ? Math.max(gap, buttonRect.top - menuHeight - gap)
        : Math.min(window.innerHeight - menuHeight - gap, buttonRect.bottom + gap);

      setDropdownStyle({ top, left: boundedLeft });
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside, false);
      document.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, onClose, buttonRect]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className='fixed w-36 rounded-lg border border-[#F485251A] bg-white shadow-2xl z-[9999] overflow-hidden'
    >
      {(options || []).map((option, index) => {
        const statusStyle = STATUS_STYLES[option.key] || STATUS_STYLES.closed;

        return (
        <button
          key={option.key}
          type='button'
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onStatusChange(rowId, option.key);
            onClose();
          }}
          disabled={isUpdating ? true : false}
          className={`w-full px-2 py-2 text-center flex items-center justify-center gap-2 cursor-pointer ${
            isUpdating
              ? 'opacity-50 cursor-not-allowed bg-gray-100'
              : STATUS_HOVER_CLASS[option.key] || STATUS_HOVER_CLASS.closed
          } ${
            index < options.length - 1 ? 'border-b border-[#E5E7EB]' : ''
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

const LeadsTable = ({
  leadsTable,
  statusOptions,
  isLoading = false,
  error = null,
  onStatusChange,
  onView,
  onDelete,
  isUpdatingStatusId,
}) => {
  const navigate = useNavigate();
  const [rows, setRows] = useState(leadsTable.rows);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [buttonRect, setButtonRect] = useState(null);
  const tableRef = useRef(null);

  useEffect(() => {
    setRows(leadsTable.rows || []);
  }, [leadsTable.rows]);

  const handleStatusChange = (rowId, newStatus) => {
    if (onStatusChange) {
      onStatusChange(rowId, newStatus);
      setOpenMenuId(null);
      return;
    }
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === rowId
          ? { ...row, status: newStatus, statusTone: getStatusTone(newStatus) }
          : row
      )
    );
  };

  const handleMenuClose = () => {
    setOpenMenuId(null);
  };

  const handleMenuClick = (e, rowId) => {
    setOpenMenuId(openMenuId === rowId ? null : rowId);
    if (openMenuId !== rowId) {
      setButtonRect(e.currentTarget.getBoundingClientRect());
    }
  };

  if (isLoading) {
    return (
      <section className='rounded-sm border border-[#F485251A] bg-white p-8'>
        <div className='text-center'>
          <p className='text-lg text-[#64748B]'>Loading leads...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className='rounded-sm border border-[#FCA5A5] bg-[#FEE2E2] p-8'>
        <div className='text-center'>
          <p className='text-lg text-[#DC2626]'>Error loading leads</p>
          <p className='mt-2 text-base text-[#991B1B]'>{error}</p>
        </div>
      </section>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <section className='rounded-sm border border-[#F485251A] bg-white p-8'>
        <div className='text-center'>
          <p className='text-lg text-[#64748B]'>No leads yet</p>
        </div>
      </section>
    );
  }

  return (
    <section className='rounded-sm border border-[#F485251A] bg-white ' ref={tableRef}>
      <div className='flex items-center justify-between px-4 py-4 border-b border-[#F485251A]'>
        <h2 className='text-lg md:text-2xl font-semibold  text-[#111827]'>
          {leadsTable.title}
        </h2>
        <button
          type='button'
          onClick={() => navigate('/admin/leads')}
          className='text-sm md:text-base font-semibold text-[#F58626] hover:text-[#e97814] hover:underline transition-colors cursor-pointer'
        >
          {leadsTable.viewAll}
        </button>
      </div>

      {/* Desktop leadsTable */}
      <div className='hidden md:block overflow-x-auto'>
        <table className='w-full min-w-[900px]'>
          <thead>
            <tr className='bg-[#fef9f4] border-b border-[#F485251A] '>
              {leadsTable.columns.map((column) => (
                <th
                  key={column}
                  className={`px-4 py-4 text-base font-medium text-[#64748B] whitespace-nowrap ${
                    column === leadsTable.columns[leadsTable.columns.length - 1]
                      ? 'text-center'
                      : 'text-left'
                  }`}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className='border-b border-[#F485250D] last:border-b-0 '>
                <td className='px-4 py-3.5'>
                  <div className='flex items-center gap-2 min-w-[150px]'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-[#FFEAD0] text-[10px] font-bold text-[#D97706] flex-shrink-0'>
                      {row.initials}
                    </div>
                    <span className='text-base font-semibold text-[#475569] truncate'>
                      {row.fullName}
                    </span>
                  </div>
                </td>
                <td className='px-4 py-3.5 text-base text-[#475569] min-w-[160px] truncate'>{row.serviceType}</td>
                <td className='px-4 py-3.5 text-base text-[#475569] min-w-[140px] whitespace-nowrap'>{row.createdAt}</td>
                <td className='px-4 py-3.5 min-w-[130px]'>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-base ${
                      (STATUS_STYLES[row.statusTone] || STATUS_STYLES.closed).pill
                    }`}
                  >
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-lg ${
                        (STATUS_STYLES[row.statusTone] || STATUS_STYLES.closed).dot
                      }`}
                      aria-hidden='true'
                    />
                    {row.status}
                  </span>
                </td>
                <td className='px-4 py-6 flex-shrink-0 relative flex justify-center items-center gap-2'>
                  <button
                    type='button'
                    onClick={() => onView && onView(row)}
                    className='text-[#64748B] hover:text-[#0F172A] transition-colors flex items-center justify-center cursor-pointer'
                    title='View'
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    type='button'
                    onClick={() => onDelete && onDelete(row)}
                    className='text-[#F43F5E] hover:text-[#DC2626] transition-colors flex items-center justify-center cursor-pointer'
                    title='Delete'
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    type='button'
                    className='text-[#94A3B8] hover:text-[#0F172A] transition-colors flex items-center justify-center cursor-pointer'
                    onClick={(e) => handleMenuClick(e, row.id)}
                  >
                    <EllipsisVertical size={18} aria-hidden='true' />
                  </button>
                  {openMenuId === row.id && (
                    <StatusDropdown
                      options={statusOptions}
                      rowId={row.id}
                      onStatusChange={handleStatusChange}
                      isOpen={true}
                      onClose={handleMenuClose}
                      buttonRect={buttonRect}
                      isUpdating={isUpdatingStatusId === row.id}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className='md:hidden space-y-3 p-4'>
        {rows.map((row) => (
          <div key={row.id} className='rounded-lg border border-[#F485251A] bg-[#FAFAFA] p-4 relative shadow-lg'>
            <div className='flex items-center justify-between gap-3 mb-3'>
              <div className='flex items-center gap-3'>
                <div className='flex h-9 w-9 items-center justify-center rounded-full bg-[#FFEAD0] text-sm font-bold text-[#D97706]'>
                  {row.initials}
                </div>
                <div>
                  <p className='text-base font-semibold text-[#111827]'>{row.fullName}</p>
                  <p className='text-sm text-[#6B7280]'>{row.serviceType}</p>
                </div>
              </div>
              <button
                type='button'
                className='text-[#94A3B8] hover:text-[#0F172A] transition-colors cursor-pointer'
                onClick={(e) => handleMenuClick(e, row.id)}
              >
                <EllipsisVertical size={18} aria-hidden='true' />
              </button>
              {openMenuId === row.id && (
                <StatusDropdown
                  options={statusOptions}
                  rowId={row.id}
                  onStatusChange={handleStatusChange}
                  isOpen={true}
                  onClose={handleMenuClose}
                  buttonRect={buttonRect}
                  isUpdating={isUpdatingStatusId === row.id}
                />
              )}
            </div>

            <div className='space-y-2 border-t border-[#F485251A] pt-3'>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-[#6B7280] text-sm'>{leadsTable.mobileLabels.date} : </span>
                <span className='font-semibold text-[#111827]'>{row.createdAt}</span>
              </div>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-[#6B7280]'>{leadsTable.mobileLabels.status} : </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    (STATUS_STYLES[row.statusTone] || STATUS_STYLES.closed).pill
                  }`}
                >
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${
                      (STATUS_STYLES[row.statusTone] || STATUS_STYLES.closed).dot
                    }`}
                    aria-hidden='true'
                  />
                  {row.status}
                </span>
              </div>
            </div>
            <div className='mt-2 flex gap-2'>
              <button
                type='button'
                onClick={() => onView && onView(row)}
                className='flex-1 rounded bg-[#F1F5F9] py-2 text-sm font-semibold text-form-label cursor-pointer'
              >
                View
              </button>
              <button
                type='button'
                onClick={() => onDelete && onDelete(row)}
                className='flex-1 rounded bg-[#FFF2F2] py-2 text-sm font-semibold text-[#DC2626] cursor-pointer'
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dashboardData = t('admin.dashboard', { returnObjects: true });
  const leadsConfig = t('admin.leads', { returnObjects: true });
  const resolveStatusLabel = (tone, fallback) => {
    const matched = leadsConfig?.statusOptions?.find((option) => option.key === tone);
    return matched?.label || fallback;
  };
  const resolveStatusTone = (value) => {
    const normalized = (value || '').toLowerCase();
    const direct = apiValueToStatusTone[normalized];

    if (direct) return direct;

    const byLabel = leadsConfig?.statusOptions?.find(
      (option) => option.label?.toLowerCase() === normalized
    )?.key;

    return byLabel || getStatusTone(value);
  };
  
  // Redux selectors for stats
  const totalLeads = useSelector(selectTotalLeads);
  const revenueThisMonth = useSelector(selectRevenueThisMonth);
  const activeGiveaways = useSelector(selectActiveGiveaways);
  const totalTicketsSold = useSelector(selectTotalTicketsSold);
  const recentLeads = useSelector(selectRecentLeads);
  const dashboardStatus = useSelector(selectDashboardStatus);
  const dashboardError = useSelector(selectDashboardError);
  
  const [leadsData, setLeadsData] = useState([]);
  const [leadDetail, setLeadDetail] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [deleteRow, setDeleteRow] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [campaignRemote, setCampaignRemote] = useState(null);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [campaignError, setCampaignError] = useState(null);

  // Fetch dashboard stats on component mount
  useEffect(() => {
    if (dashboardStatus === 'idle') {
      console.log('[Dashboard] Fetching dashboard stats...');
      dispatch(fetchDashboardStats());
    }
  }, [dispatch, dashboardStatus]);

  // Update leadsData when recentLeads changes
  useEffect(() => {
    console.log('[Dashboard] recentLeads:', recentLeads);
    console.log('[Dashboard] dashboardStatus:', dashboardStatus);
    console.log('[Dashboard] dashboardError:', dashboardError);
    
    if (Array.isArray(recentLeads) && recentLeads.length > 0) {
      console.log('[Dashboard] Transforming leads data...');
      // Transform API data to table format
      const transformedLeads = recentLeads.map((lead, index) => {
        const fullName = lead.fullName || lead.name || '';
        const initials = fullName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase();
        
        const tone = getStatusTone(lead.status);
        const transformedLead = {
          id: lead.id || lead._id || index,
          fullName,
          initials: initials || '?',
          email: lead.email || '',
          phone: lead.phone || '',
          serviceType: lead.serviceType || lead.service || '',
          address: lead.address || '',
          projectDetails: lead.projectDetails || lead.project_details || '',
          referenceImages: lead.referenceImages || lead.reference_images || [],
          createdAt: lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '',
          status: resolveStatusLabel(tone, lead.status || 'Pending'),
          statusTone: tone,
        };
        console.log('[Dashboard] Transformed lead:', transformedLead);
        return transformedLead;
      });
      console.log('[Dashboard] All transformed leads:', transformedLeads);
      setLeadsData(transformedLeads.slice(0, 5));
    } else {
      console.log('[Dashboard] No recent leads or not an array');
      setLeadsData([]);
    }
  }, [recentLeads, dashboardStatus]);
  const handleViewLead = async (row) => {
    setLeadDetail(row);
    setIsViewOpen(true);
    setIsDetailLoading(true);
    setDetailError(null);

    try {
      const { data, error } = await httpMethods.get(
        API_ENDPOINTS.ADMIN_LEADS.BY_ID(row.id)
      );

      if (error) {
        throw error;
      }

      const payload = data?.data ?? data;
      const detail = Array.isArray(payload)
        ? payload[0]
        : payload?.lead ?? payload?.data ?? payload;

      if (detail) {
        setLeadDetail(detail);
      }
    } catch (err) {
      setDetailError(err?.message || 'Failed to load lead details');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleDeleteLead = (row) => {
    setDeleteRow(row);
    setIsDeleteOpen(true);
  };

  const confirmDeleteLead = () => {
    if (!deleteRow || isDeleting) return;

    const runDelete = async () => {
      setIsDeleting(true);
      try {
        const { error } = await httpMethods.delete(
          API_ENDPOINTS.ADMIN_LEADS.DELETE(deleteRow.id)
        );

        if (error) {
          throw error;
        }

        setLeadsData((prev) => prev.filter((r) => r.id !== deleteRow.id));
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

  const cancelDeleteLead = () => {
    setIsDeleteOpen(false);
    setDeleteRow(null);
  };

  const handleStatusChange = async (rowId, newStatus) => {
    setUpdatingStatusId(rowId);

    try {
      const apiStatusValue =
        leadsConfig?.statusOptions?.find((option) => option.key === newStatus)
          ?.label || newStatus;

      if (!apiStatusValue) {
        throw new Error(`Invalid status key: ${newStatus}`);
      }

      const endpoint = API_ENDPOINTS.ADMIN_LEADS.UPDATE_STATUS(rowId);
      const payload = { status: apiStatusValue };

      const { error } = await httpMethods.patch(endpoint, payload);

      if (error) {
        throw error;
      }

      setLeadsData((prev) =>
        prev.map((row) => {
          if (row.id !== rowId) return row;

          const derivedTone = resolveStatusTone(apiStatusValue);

          return {
            ...row,
            status: resolveStatusLabel(derivedTone, apiStatusValue),
            statusTone: derivedTone,
          };
        })
      );

      toast.success('Status updated successfully');
    } catch (err) {
      toast.error(err?.message || 'Failed to update status');
    } finally {
      setUpdatingStatusId(null);
    }
  };


  // Fetch admin active giveaway for CampaignPanel
  useEffect(() => {
    let cancelled = false;
    const fetchActive = async () => {
      setCampaignLoading(true);
      setCampaignError(null);
      try {
        const { data, error } = await httpMethods.get(API_ENDPOINTS.ADMIN_DASHBOARD.ACTIVE_GIVEAWAY);
        if (error) {
          console.error('[Dashboard] active giveaway error', error);
          if (!cancelled) setCampaignError(error.message || 'Failed to load active giveaway');
          return;
        }

        const res = data?.data ?? data;
        console.log('[Dashboard] active giveaway response:', res);
        console.log('[Dashboard] response type:', typeof res, 'is array:', Array.isArray(res));

        const g = Array.isArray(res) ? res[0] : (res?.giveaway ?? res?.data ?? res);
        console.log('[Dashboard] extracted g object:', g);
        console.log('[Dashboard] g.title:', g?.title, 'g.description:', g?.description);
        
        if (!g) {
          if (!cancelled) setCampaignRemote(null);
          return;
        }

        // Extract ticket counts
        const totalTickets = g?.totalTickets ?? g?.total_tickets ?? g?.total ?? 0;
        const ticketsSold = g?.ticketsSold ?? g?.soldTickets ?? g?.sold ?? g?.tickets_sold ?? 0;

        // Compute progress percent
        const progress = totalTickets ? Math.min(100, Math.round((ticketsSold / totalTickets) * 100)) : (g?.progress ?? 0);

        // Calculate days left from drawDate
        const drawDateRaw = g?.drawDate ?? g?.draw_date ?? g?.endDate ?? g?.draw_at ?? null;
        let daysLeftLabel = '';
        if (drawDateRaw) {
          try {
            const diffMs = new Date(drawDateRaw) - new Date();
            const diffDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
            daysLeftLabel = diffDays === 0 ? 'Ends today' : `${diffDays} dagen resterend`;
          } catch (e) {
            daysLeftLabel = '';
          }
        }

        const imageSource = resolveCampaignImage(
          g?.bannerImage ??
            g?.banner ??
            g?.banner_image ??
            g?.bannerUrl ??
            g?.image?.url ??
            g?.image?.src ??
            g?.image
        );

        const mapped = {
          title: g?.title ?? g?.name ?? '',
          description: g?.description ?? '',
          status: g?.status ?? 'Active',
          image: {
            alt: g?.image?.alt ?? g?.imageAlt ?? g?.title ?? '',
            src: imageSource || '/Image.png',
          },
          soldLabel: 'Tickets sold',
          soldPercent: `${progress}%`,
          progress,
          soldMeta: `${ticketsSold} of ${totalTickets} tickets sold`,
          daysLeft: daysLeftLabel,
          analyticsCta: 'View analytics',
        };

        console.log('[Dashboard] mapped campaign:', mapped);
        if (!cancelled) setCampaignRemote(mapped);
      } catch (err) {
        console.error('[Dashboard] fetchActive giveaway exception', err);
        if (!cancelled) setCampaignError(err.message || 'Failed to load');
      } finally {
        if (!cancelled) setCampaignLoading(false);
      }
    };

    fetchActive();
    return () => { cancelled = true; };
  }, []);
//admin
  const handleAnalyticsClick = () => {
    navigate('/admin/giveaways');
  };

  const handleCreateGiveaway = () => {
    navigate('/admin/giveaways');
  };

  const handleCoupons = () => {
    navigate('/admin/coupons');
  };

  const handleExport = () => {
    // Prefer server-side CSV export endpoint, fallback to client CSV if it fails
    (async () => {
      try {
        const { data, error } = await httpMethods.get(API_ENDPOINTS.ADMIN_DASHBOARD.EXPORT, { responseType: 'blob' });

        if (error) throw error;

        // axios returns full response as `data` in our wrapper
        const res = data;
        const blob = res.data || res; // accommodate variations

        // Try to infer filename from Content-Disposition
        const contentDisposition = res.headers?.['content-disposition'] || res.headers?.['Content-Disposition'];
        let fileName = `${dashboardData.export.fileNamePrefix}-${new Date().toISOString().split('T')[0]}.csv`;
        if (contentDisposition) {
          const match = /filename\*=UTF-8''(.+)$/.exec(contentDisposition) || /filename=(?:"?)([^";]+)/.exec(contentDisposition);
          if (match && match[1]) fileName = decodeURIComponent(match[1]);
        }

        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
      } catch (err) {
        console.error('[handleExport] export endpoint failed, falling back to client CSV:', err);

        // Fallback: build CSV on client
        const csvHeaders = dashboardData.export.csvHeaders;
        const csvRows = leadsData.map(row => [
          row.name,
          row.email || '',
          row.service,
          row.date,
          row.status
        ]);

        const csvContent = [
          csvHeaders.join(","),
          ...csvRows.map(row => row.map(cell => `"${(cell||'').toString().replace(/"/g,'""')}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${dashboardData.export.fileNamePrefix}-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    })();
  };

  return (
    <div className='space-y-5 text-[#1F2937] '>
      <header className='border-b border-[#F485251A] pb-3' >
        <h1 className='text-2xl md:text-4xl  font-black text-[#0F172A]'>
          {dashboardData.header.title}
        </h1>
        <p className='mt-1 text-base  text-[#64748B]  pt-2'>
          {dashboardData.header.subtitle}
        </p>
      </header>

      <section className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6  pt-3'>
        <StatCard
          key='leads'
          label='Total Leads'
          value={dashboardStatus === 'loading' ? '...' : totalLeads}
          trend={'+'}
          icon='ChartNoAxesColumnIncreasing'
          trendIcon=''
        />
        <StatCard
          key='revenue'
          label='Revenue This Month'
          value={dashboardStatus === 'loading' ? '...' : typeof revenueThisMonth === 'number' ? `€${revenueThisMonth.toLocaleString()}` : revenueThisMonth}
          trend={'+'}
          icon='WalletCards'
          trendIcon=''
        />
        <StatCard
          key='giveaways'
          label='Active Giveaways'
          value={dashboardStatus === 'loading' ? '...' : activeGiveaways}
          trend={'+'}
          icon='CalendarDays'
          trendIcon=''
        />
        <StatCard
          key='tickets'
          label='Total Tickets Sold'
          value={dashboardStatus === 'loading' ? '...' : totalTicketsSold}
          trend={'+'}
          icon='Ticket'
          trendIcon=''
        />
      </section>

      <section className='grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_1fr] gap-6 items-start pt-3 pb-3'>
        {campaignLoading ? (
          <section className='rounded-sm border border-[#F485251A] bg-white p-8'>
            <div className='text-center'>
              <p className='text-lg text-[#64748B]'>Loading campaign...</p>
            </div>
          </section>
        ) : campaignRemote ? (
          <CampaignPanel campaign={campaignRemote} onAnalyticsClick={handleAnalyticsClick} />
        ) : (
          <section className='rounded-sm border border-[#F485251A] bg-white p-8'>
            <div className='text-center'>
              <p className='text-lg text-[#64748B]'>No active giveaway</p>
            </div>
          </section>
        )}

        <aside className='rounded-[10px] border border-[#F485251A] bg-white p-4 h-fit'>
          <h2 className='text-lg md:text-2xl leading-7 font-bold text-[#111827]'>
            {dashboardData.quickActions.title}
          </h2>
          <div className='mt-3.5 space-y-5 '>
            {dashboardData.quickActions.items.map((item) => (
              <ActionButton
                key={item.id}
                label={item.label}
                icon={item.icon}
                variant={item.variant}
                onClick={() => {
                  if (item.id === 'create') {
                    handleCreateGiveaway();
                  } else if (item.id === 'voucher') {
                    handleCoupons();
                  } else if (item.id === 'export') {
                    handleExport();
                  }
                }}
              />
            ))}
          </div>

          {/* <div className='mt-6  rounded-lg bg-[#F8F7F5] border border-[#F485251A] p-3.5'>
            <p className='text-sm  md:font-bold  text-[#94A3B8]'>
              {dashboardData.quickActions.tip.label}
            </p>
            <p className='mt-2 text-base  text-[#64748B]'>
              {dashboardData.quickActions.tip.text}
            </p>
          </div> */}
        </aside>
      </section>

      <LeadsTable
        leadsTable={{
          ...dashboardData.leadsTable,
          rows: leadsData,
        }}
        statusOptions={leadsConfig.statusOptions}
        isLoading={dashboardStatus === 'loading'}
        error={dashboardError}
        onStatusChange={handleStatusChange}
        onView={handleViewLead}
        onDelete={handleDeleteLead}
        isUpdatingStatusId={updatingStatusId}
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
        onClose={cancelDeleteLead}
        onConfirm={confirmDeleteLead}
        itemName={deleteRow?.fullName}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Dashboard;
