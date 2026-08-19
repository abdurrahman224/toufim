import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { ROUTES } from '../config';
import httpMethods from '../services/httpMethods';
import API_ENDPOINTS from '../services/httpEndpoint';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const queryOrderId = useMemo(
    () => searchParams.get('orderId') || searchParams.get('order_id'),
    [searchParams],
  );
  const querySessionId = useMemo(
    () => searchParams.get('session_id') || searchParams.get('sessionId'),
    [searchParams],
  );

  const [orderId, setOrderId] = useState(
    () => queryOrderId || sessionStorage.getItem('orderId'),
  );
  const [sessionId, setSessionId] = useState(
    () => querySessionId || sessionStorage.getItem('sessionId'),
  );

  const [status, setStatus] = useState('loading'); // loading | success | error
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const confirmAttemptedForOrderRef = useRef(null);

  const getErrorMessage = useCallback((err, fallback) => {
    return (
      err?.data?.message ||
      err?.data?.error ||
      err?.message ||
      fallback ||
      'Something went wrong'
    );
  }, []);

  const formattedTotalAmount = useMemo(() => {
    const rawAmount =
      order?.totalAmount ??
      order?.total_amount ??
      order?.total ??
      order?.amount ??
      null;

    const numericAmount = Number(rawAmount);
    if (!Number.isFinite(numericAmount)) return '';
    return numericAmount.toLocaleString('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [order]);

  const clearPaymentSession = useCallback(() => {
    sessionStorage.removeItem('sessionId');
    setSessionId(null);
  }, []);

  const confirmAndFetchOrder = useCallback(async (effectiveOrderId, effectiveSessionId) => {
    try {
      setStatus('loading');
      setError('');

      if (!effectiveSessionId) {
        throw new Error('Missing session ID');
      }

      const { data: confirmData, error: confirmError } = await httpMethods.post(
        API_ENDPOINTS.ORDERS.CONFIRM,
        {
          sessionId: effectiveSessionId,
        },
      );

      const confirmMessage =
        (typeof confirmData?.message === 'string' && confirmData.message) ||
        (typeof confirmError?.data?.message === 'string' && confirmError.data.message) ||
        getErrorMessage(confirmError, '');

      const alreadyCompleted =
        typeof confirmMessage === 'string' &&
        confirmMessage.toLowerCase().includes('already completed');

      if (confirmError && !alreadyCompleted) {
        throw new Error(getErrorMessage(confirmError, 'Failed to confirm order'));
      }

      if (!confirmError && !confirmData?.success && !alreadyCompleted) {
        throw new Error(confirmData?.message || 'Payment not successful');
      }

      // Confirm succeeded (or is idempotently already completed) — sessionId must be cleared now.
      setSessionId(null);
      sessionStorage.removeItem('sessionId');

      const { data: orderData, error: orderError } = await httpMethods.get(
        API_ENDPOINTS.ORDERS.BY_ID(effectiveOrderId),
      );

      if (orderError) {
        throw new Error(getErrorMessage(orderError, 'Failed to fetch order'));
      }

      const resolvedOrder = orderData?.data?.order ?? orderData?.data ?? orderData?.order ?? null;
      setOrder(resolvedOrder);
      setStatus('success');
    } catch (err) {
      console.error('Payment confirmation error:', err);

      sessionStorage.removeItem('sessionId');

      setSessionId(null);

      navigate(ROUTES.PAYMENT_CANCEL, {
        replace: true,
        state: { reason: err?.message || 'Payment confirmation failed' },
      });
    }
  }, [getErrorMessage, navigate]);

  useEffect(() => {
    // Sync latest query values into state (Stripe redirects)
    if (queryOrderId && queryOrderId !== orderId) {
      setOrderId(queryOrderId);
      sessionStorage.setItem('orderId', queryOrderId);
    }

    if (querySessionId && querySessionId !== sessionId) {
      setSessionId(querySessionId);
      sessionStorage.setItem('sessionId', querySessionId);
    }

    const effectiveOrderId = queryOrderId || orderId || sessionStorage.getItem('orderId');
    const effectiveSessionId =
      querySessionId || sessionId || sessionStorage.getItem('sessionId');

    if (!effectiveOrderId) {
      setStatus('error');
      setError('No order ID found');
      return;
    }

    if (confirmAttemptedForOrderRef.current === effectiveOrderId) return;
    confirmAttemptedForOrderRef.current = effectiveOrderId;

    confirmAndFetchOrder(effectiveOrderId, effectiveSessionId);
  }, [
    confirmAndFetchOrder,
    orderId,
    queryOrderId,
    querySessionId,
    sessionId,
  ]);

  if (status === 'loading') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-surface'>
        <div className='text-center'>
          <Loader2 className='w-12 h-12 text-primary mx-auto mb-4 animate-spin' />
          <h2 className='text-xl font-bold text-heading'>Confirming your payment...</h2>
          <p className='text-muted mt-2'>Please wait</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-surface px-4'>
        <div className='max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center'>
          <XCircle className='w-16 h-16 text-red-500 mx-auto mb-4' />
          <h2 className='text-2xl font-bold text-heading mb-2'>Error</h2>
          <p className='text-muted mb-6'>{error}</p>
          <button
            onClick={() => {
              clearPaymentSession();
              navigate(ROUTES.CHECKOUT);
            }}
            className='bg-primary hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg'
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-surface px-4'>
      <div className='max-w-2xl w-full bg-white rounded-xl shadow-lg overflow-hidden'>
        {/* Success Header */}
        <div className='bg-gradient-to-r from-green-500 to-green-600 p-8 text-center text-white'>
          <CheckCircle className='w-20 h-20 mx-auto mb-4' />
          <h1 className='text-3xl font-black mb-2'>Payment Successful!</h1>
          <p className='text-green-100'>Your order has been confirmed</p>
        </div>

        {/* Order Details */}
        <div className='p-8'>
          <h2 className='text-xl font-bold text-heading mb-4'>Order Details</h2>
          
          <div className='bg-gray-50 rounded-lg p-6 mb-6'>
            <div className='grid grid-cols-2 gap-4'>
          
              <div>
                <p className='text-sm text-muted mb-1'>Name</p>
                <p className='font-semibold text-heading'>{order?.fullName}</p>
              </div>
              <div>
                <p className='text-sm text-muted mb-1'>Email</p>
                <p className='font-semibold text-heading'>{order?.email}</p>
              </div>
            </div>
          </div>

          <div className='border-t border-gray-200 pt-6 flex justify-between items-center'>
            <div>
              <p className='text-sm text-muted mb-1'>Total Amount</p>
              <p className='text-3xl font-black text-primary'>
                {formattedTotalAmount || '—'}
              </p>
            </div>
            <button
              onClick={() => {
                clearPaymentSession();
                navigate(ROUTES.HOME);
              }}
              className='bg-primary hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-lg'
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
