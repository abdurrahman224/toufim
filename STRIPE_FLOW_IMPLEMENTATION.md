# Stripe Integration Flow - Fixed

## 🎯 Correct API Call Sequence

### STEP 1: Create Order (CheckoutContent.jsx)
```javascript
// When user clicks "Proceed to Payment" button
const { data } = await httpMethods.post(API_ENDPOINTS.ORDERS.CREATE, {
  packageId: selectedTicket,
  voucherCode: promoApplied ? appliedPromoKey : null,
  fullName: formData.fullName,
  email: formData.emailAddress,
  phone: formData.phoneNumber,
  instagramUsername: formData.instagramUsername,
  amount: basePrice,
  discount: promoDiscount,
});

const { orderId, sessionId, paymentUrl } = data.data;

// Store for later use
sessionStorage.setItem('orderId', orderId);
sessionStorage.setItem('sessionId', sessionId);
```

**Backend should return:**
```json
{
  "orderId": "uuid",
  "sessionId": "cs_test_...",
  "paymentUrl": "https://checkout.stripe.com/..."
}
```

---

### STEP 2: Redirect to Stripe
```javascript
// Immediately redirect to Stripe Checkout
window.location.href = paymentUrl;
```

**User completes payment on Stripe's hosted page**

---

### STEP 3: Stripe redirects back
**After payment success, Stripe redirects to:**
```
https://your-domain.com/payment-success?orderId=xxx
```

---

### STEP 4: Confirm Order (PaymentSuccess.jsx)
```javascript
// Extract orderId from URL
const orderId = searchParams.get('orderId');

// Get sessionId from sessionStorage
const sessionId = sessionStorage.getItem('sessionId');

// Confirm the order
await httpMethods.post(API_ENDPOINTS.ORDERS.CONFIRM, {
  sessionId
});
```

**Note:** This endpoint should be **idempotent** (safe to call multiple times)

---

### STEP 5: Fetch Final Order
```javascript
// Get complete order details
const { data } = await httpMethods.get(
  API_ENDPOINTS.ORDERS.BY_ID(orderId)
);

const order = data.data.order;

// Display success UI with order details
```

---

## 📁 Files Modified

### 1. API Endpoints Config
**File:** `src/services/httpEndpoint.js`

Added order endpoints:
```javascript
ORDERS: {
  CREATE: '/orders',
  CONFIRM: '/orders/confirm',
  BY_ID: (id) => `/orders/${id}',
}
```

### 2. Routes Config
**File:** `src/config/index.js`

Added payment routes:
```javascript
PAYMENT_SUCCESS: '/payment-success',
PAYMENT_CANCEL: '/payment-cancel',
```

### 3. Checkout Component
**File:** `src/components/services/CheckoutContent.jsx`

**Changes:**
- Added `httpMethods` and `API_ENDPOINTS` imports
- Added state: `isSubmitting`, `submitError`
- Set default payment method to `'stripe'`
- Added `handleSubmitOrder()` function:
  - Validates form fields
  - Calls `POST /api/orders`
  - Stores `orderId` and `sessionId` in sessionStorage
  - Redirects to `paymentUrl`
- Updated submit button with loading state

### 4. Payment Success Page
**File:** `src/pages/PaymentSuccess.jsx`

**Implementation:**
- Extracts `orderId` from URL query params
- Retrieves `sessionId` from sessionStorage
- Calls `POST /api/orders/confirm` with sessionId
- Calls `GET /api/orders/:orderId` to fetch order
- Shows loading/success/error states
- Displays order details
- Cleans up sessionStorage after success

### 5. Payment Cancel Page
**File:** `src/pages/PaymentCancel.jsx`

**Implementation:**
- Simple cancel message
- "Try Again" button → returns to checkout
- "Go Home" button → returns to homepage

### 6. Router
**File:** `src/router/router.jsx`

**Changes:**
- Added lazy imports for `PaymentSuccess` and `PaymentCancel`
- Added routes:
  - `/payment-success`
  - `/payment-cancel`

---

## 🔐 Data Storage Pattern

### sessionStorage Usage
```javascript
// ✅ After creating order (Checkout)
sessionStorage.setItem('orderId', orderId);
sessionStorage.setItem('sessionId', sessionId);

// ✅ After confirming order (PaymentSuccess)
sessionStorage.removeItem('orderId');
sessionStorage.removeItem('sessionId');
```

**Why sessionStorage?**
- Persists during Stripe redirect
- Automatically cleared when tab closes
- Not shared across tabs

---

## ⚠️ Important Notes

### 1. Confirm Endpoint Must Be Idempotent
The `/api/orders/confirm` endpoint will be called:
- By frontend after redirect (Step 4)
- By Stripe webhook (if implemented)

**Backend must handle:**
```javascript
// Example backend logic
if (order.status === 'confirmed') {
  return { message: 'Already confirmed', order };
}
// Otherwise confirm the order
```

### 2. Validation Required
Backend must verify:
- `sessionId` matches the order
- Payment was actually completed (verify with Stripe)
- Order exists and is in pending state

### 3. Error Handling
Frontend handles:
- Missing orderId in URL → show error
- Confirm fails → show error with retry
- Order fetch fails → show error

---

## 🚀 Testing Flow

1. Fill checkout form
2. Click "Proceed to Payment"
3. Verify redirect to Stripe
4. Use test card: `4242 4242 4242 4242`
5. Complete payment
6. Verify redirect to `/payment-success?orderId=xxx`
7. Check order is confirmed
8. Verify order details displayed

---

## 📝 Minimal Changes Summary

Only these files were modified:
1. ✅ `src/services/httpEndpoint.js` - Added order endpoints
2. ✅ `src/config/index.js` - Added payment routes
3. ✅ `src/components/services/CheckoutContent.jsx` - Added submit logic
4. ✅ `src/pages/PaymentSuccess.jsx` - Created (confirm + fetch flow)
5. ✅ `src/pages/PaymentCancel.jsx` - Created (simple cancel page)
6. ✅ `src/router/router.jsx` - Added payment routes

**No redesign, only integration fixes!**
