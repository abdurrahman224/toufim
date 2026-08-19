import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../services/httpEndpoint';
import httpMethods from '../../services/httpMethods';

const normalizeDashboardData = (payload) => {
  console.log('[normalizeDashboardData] Raw payload:', payload);
  
  const raw = payload?.data ?? payload;
  const data = raw?.data ?? raw;
  
  console.log('[normalizeDashboardData] Extracted data:', data);

  const normalized = {
    totalLeads: data?.totalLeads ?? data?.leads ?? 0,
    revenueThisMonth: data?.revenueThisMonth ?? data?.revenue ?? 0,
    activeGiveaways: data?.activeGiveaways ?? data?.giveaways ?? 0,
    totalTicketsSold: data?.totalTicketsSold ?? data?.tickets ?? 0,
    recentLeads: Array.isArray(data?.recentLeads) ? data.recentLeads : [],
  };

  console.log('[normalizeDashboardData] Normalized result:', normalized);
  return normalized;
};

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    const { data, error } = await httpMethods.get(
      API_ENDPOINTS.ADMIN_DASHBOARD.STATS,
    );

    if (error) {
      console.error('[fetchDashboardStats] Error:', error);
      return rejectWithValue(error.message || 'Failed to load dashboard stats');
    }

    try {
      const normalized = normalizeDashboardData(data);
      console.debug('[fetchDashboardStats] Normalized:', normalized);
      return normalized;
    } catch (err) {
      console.error('[fetchDashboardStats] Normalization error:', err);
      return rejectWithValue('Failed to process dashboard data');
    }
  },
);

const initialState = {
  stats: {
    totalLeads: 0,
    revenueThisMonth: 0,
    activeGiveaways: 0,
    totalTicketsSold: 0,
  },
  recentLeads: [],
  status: 'idle',
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.stats = {
          totalLeads: action.payload.totalLeads,
          revenueThisMonth: action.payload.revenueThisMonth,
          activeGiveaways: action.payload.activeGiveaways,
          totalTicketsSold: action.payload.totalTicketsSold,
        };
        state.recentLeads = action.payload.recentLeads;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message || 'Unknown error';
      });
  },
});

export default dashboardSlice.reducer;

export const selectTotalLeads = (state) => state.dashboard.stats.totalLeads;
export const selectRevenueThisMonth = (state) => state.dashboard.stats.revenueThisMonth;
export const selectActiveGiveaways = (state) => state.dashboard.stats.activeGiveaways;
export const selectTotalTicketsSold = (state) => state.dashboard.stats.totalTicketsSold;
export const selectRecentLeads = (state) => state.dashboard.recentLeads;
export const selectDashboardStatus = (state) => state.dashboard.status;
export const selectDashboardError = (state) => state.dashboard.error;
