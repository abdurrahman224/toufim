import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { ROUTES } from '../config';

const PaymentCancel = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const reason = useMemo(() => location?.state?.reason, [location?.state?.reason]);

  useEffect(() => {
    sessionStorage.removeItem('sessionId');
  }, []);

  const clearPaymentSession = () => {
    sessionStorage.removeItem('sessionId');
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-surface px-4'>
      <div className='max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center'>
        <XCircle className='w-16 h-16 text-orange-500 mx-auto mb-4' />
        <h1 className='text-2xl font-bold text-heading mb-2'>Payment Cancelled</h1>
        <p className='text-muted mb-6'>
          Your payment was cancelled. No charges were made.
        </p>
        {reason && (
          <p className='text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 mb-6'>
            {reason}
          </p>
        )}
        <div className='flex gap-4'>
          <button
            onClick={() => {
              clearPaymentSession();
              navigate(ROUTES.CHECKOUT);
            }}
            className='flex-1 bg-primary hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg'
          >
            Try Again
          </button>
          <button
            onClick={() => {
              clearPaymentSession();
              navigate(ROUTES.HOME);
            }}
            className='flex-1 bg-gray-200 hover:bg-gray-300 text-heading font-bold py-3 px-6 rounded-lg'
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
