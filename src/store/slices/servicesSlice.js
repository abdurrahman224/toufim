import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../services/httpEndpoint';
import httpMethods from '../../services/httpMethods';

const normalizeServiceList = (payload) => {
  // Backend returns: { success, message, data: { totalServices, services: [...] } }
  const services = payload?.data?.services || payload?.services || [];
  
  return services.map((service) => ({
    id: service.id || service._id || service.slug,
    name: service.name || '',
    category: service.category || '',
    description: service.description || '',
    basePrice: service.basePrice || '0',
    bannerImage: service.bannerImage || '',
    galleryImages: service.galleryImages || [],
    slug: service.slug || '',
    status: service.status || '',
  }));
};

export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async (_, { rejectWithValue }) => {
    const { data, error } = await httpMethods.get(API_ENDPOINTS.SERVICES.LIST);

    if (error) {
      console.error('[fetchServices] Error:', error);
      return rejectWithValue(error.message || 'Failed to load services');
    }

    try {
      const normalized = normalizeServiceList(data);
      console.debug('[fetchServices] Normalized:', normalized);
      return normalized;
    } catch (err) {
      console.error('[fetchServices] Normalization error:', err);
      return rejectWithValue('Failed to process services');
    }
  },
);

export const fetchServiceById = createAsyncThunk(
  'services/fetchServiceById',
  async (serviceId, { rejectWithValue }) => {
    const { data, error } = await httpMethods.get(
      API_ENDPOINTS.SERVICES.BY_ID(serviceId),
    );

    if (error) {
      console.error('[fetchServiceById] Error:', error);
      return rejectWithValue(error.message || 'Failed to load service');
    }

    const service = data?.data || data?.service || data;

    return {
      id: service?.id || service?._id || service?.slug || serviceId,
      name: service?.name || '',
      category: service?.category || '',
      description: service?.description || '',
      basePrice: service?.basePrice || '0',
      bannerImage: service?.bannerImage || '',
      galleryImages: service?.galleryImages || [],
      slug: service?.slug || '',
      status: service?.status || '',
    };
  },
);

const initialState = {
  items: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  selected: null,
  selectedStatus: 'idle',
  selectedError: null,
};

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message || 'Unknown error';
      });
    builder
      .addCase(fetchServiceById.pending, (state) => {
        state.selectedStatus = 'loading';
        state.selectedError = null;
      })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.selectedStatus = 'succeeded';
        state.selected = action.payload;
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        state.selectedStatus = 'failed';
        state.selectedError =
          action.payload || action.error.message || 'Unknown error';
      });
  },
});

export default servicesSlice.reducer;

// Selectors
export const selectServices = (state) => state.services.items;
export const selectServicesStatus = (state) => state.services.status;
export const selectServicesError = (state) => state.services.error;
export const selectServiceDetail = (state) => state.services.selected;
export const selectServiceDetailStatus = (state) =>
  state.services.selectedStatus;
export const selectServiceDetailError = (state) =>
  state.services.selectedError;
