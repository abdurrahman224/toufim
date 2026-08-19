import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import router from './router/router';
import store from './store/store';
import { TOAST_CONFIG } from './config';

function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <RouterProvider router={router} />
        <Toaster
          position={TOAST_CONFIG.POSITION}
          toastOptions={{ duration: TOAST_CONFIG.DURATION }}
        />
      </ErrorBoundary>
    </Provider>
  );
}

export default App;
