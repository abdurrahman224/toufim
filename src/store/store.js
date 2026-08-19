import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import authReducer, {
  loginSuccess,
  logout,
  updateUser,
} from './slices/authSlice';
import themeReducer, {
  toggleTheme,
  setTheme,
  setPrimaryColor,
} from './slices/themeSlice';
import cartReducer from './slices/cartSlice';
import servicesReducer from './slices/servicesSlice';
import giveawayReducer from './slices/giveawaySlice';
import dashboardReducer from './slices/dashboardSlice';

const applyPrimaryColor = (color) => {
  document.documentElement.style.setProperty('--color-primary', color);
};

const listener = createListenerMiddleware();

// Auth persistence
listener.startListening({
  actionCreator: loginSuccess,
  effect: (action) => {
    localStorage.setItem('token', action.payload.token);
    localStorage.setItem('user', JSON.stringify(action.payload.user));
  },
});

listener.startListening({
  actionCreator: logout,
  effect: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
});

listener.startListening({
  actionCreator: updateUser,
  effect: (action, api) => {
    localStorage.setItem('user', JSON.stringify(api.getState().auth.user));
  },
});

// Theme persistence + DOM sync
listener.startListening({
  actionCreator: toggleTheme,
  effect: (action, api) => {
    const { mode } = api.getState().theme;
    localStorage.setItem('theme', mode);
    document.documentElement.classList.toggle('dark', mode === 'dark');
  },
});

listener.startListening({
  actionCreator: setTheme,
  effect: (action) => {
    const mode = action.payload;
    localStorage.setItem('theme', mode);
    document.documentElement.classList.toggle('dark', mode === 'dark');
  },
});

// Primary color CSS variable sync
listener.startListening({
  actionCreator: setPrimaryColor,
  effect: (action) => {
    applyPrimaryColor(action.payload);
  },
});

const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    cart: cartReducer,
    services: servicesReducer,
    giveaway: giveawayReducer,
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listener.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Apply initial primary color on store creation
applyPrimaryColor(store.getState().theme.primaryColor);

export default store;
