import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../services/httpEndpoint';
import httpMethods from '../../services/httpMethods';
import { API_CONFIG } from '../../config';

const normalizeActiveGiveaway = (payload) => {
  const raw = payload?.data ?? payload;
  const giveaway = raw?.data ?? raw?.giveaway ?? raw;

  const resolveBannerImage = (value) => {
    if (!value) return '';
    const text = String(value).trim();
    if (!text) return '';
    if (/^https?:\/\//i.test(text) || /^data:/i.test(text)) return text;
    if (!API_CONFIG.BASE_URL) return text;
    const base = API_CONFIG.BASE_URL.replace(/\/$/, '');
    const path = text.startsWith('/') ? text : `/${text}`;
    return `${base}${path}`;
  };

  return {
    id: giveaway?.id || giveaway?._id || giveaway?.slug || '',
    title: giveaway?.title || giveaway?.name || '',
    description: giveaway?.description || '',
    bannerImage: resolveBannerImage(
      giveaway?.bannerImage ||
        giveaway?.banner_image ||
        giveaway?.image ||
        giveaway?.imageUrl ||
        giveaway?.image_url ||
        giveaway?.banner?.url ||
        giveaway?.banner?.image
    ),
    ticketPrice:
      giveaway?.ticketPrice ?? giveaway?.price ?? giveaway?.ticket_price ?? 0,
    packages: Array.isArray(giveaway?.packages) ? giveaway.packages : [],
    totalTickets:
      giveaway?.totalTickets ?? giveaway?.total ?? giveaway?.total_tickets ?? 0,
    soldTickets:
      giveaway?.soldTickets ?? giveaway?.sold ?? giveaway?.sold_tickets ?? 0,
    drawDate: giveaway?.drawDate || giveaway?.draw_date || giveaway?.drawingDate,
    drawTime: giveaway?.drawTime || giveaway?.draw_time || giveaway?.drawingTime,
    couponCount:
      giveaway?.couponCount ??
      giveaway?.couponsPerTicket ??
      giveaway?.bundleCoupons ??
      giveaway?.coupon_count ??
      0,
  };
};

export const fetchActiveGiveaway = createAsyncThunk(
  'giveaway/fetchActiveGiveaway',
  async (_, { rejectWithValue }) => {
    const { data, error } = await httpMethods.get(
      API_ENDPOINTS.GIVEAWAY.ACTIVE,
    );

    if (error) {
      console.error('[fetchActiveGiveaway] Error:', error);
      return rejectWithValue(error.message || 'Failed to load giveaway');
    }

    try {
      const normalized = normalizeActiveGiveaway(data);
      console.debug('[fetchActiveGiveaway] Normalized:', normalized);
      return normalized;
    } catch (err) {
      console.error('[fetchActiveGiveaway] Normalization error:', err);
      return rejectWithValue('Failed to process giveaway');
    }
  },
);

const initialState = {
  active: null,
  status: 'idle',
  error: null,
};

const giveawaySlice = createSlice({
  name: 'giveaway',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveGiveaway.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchActiveGiveaway.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.active = action.payload;
      })
      .addCase(fetchActiveGiveaway.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message || 'Unknown error';
      });
  },
});

export default giveawaySlice.reducer;

export const selectActiveGiveaway = (state) => state.giveaway.active;
export const selectActiveGiveawayStatus = (state) => state.giveaway.status;
export const selectActiveGiveawayError = (state) => state.giveaway.error;
