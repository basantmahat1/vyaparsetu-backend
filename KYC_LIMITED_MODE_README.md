# 🔒 Limited Mode System - Complete Implementation

## System Overview

**Limited Mode** system ensures KYC-verified users get full access while unverified users get controlled access to core features only.

---

## 📋 What's Locked/Unlocked

### 🟢 Always Available (Limited Mode)
- Dashboard (basic overview)
- Products (max 50)
- Sales/Billing (manual entry)
- Customers (view only)
- Inventory (max 50 items)

### 🔴 Locked Until KYC Verified
- Payments & Payment Gateway
- Advanced Reports
- Staff Management
- Online Store Publishing
- API Access
- Bulk Upload
- Advanced Analytics

---

## 🛠️ Backend Implementation

### 1. **KYC Check Middleware**
Location: `middlewares/kycCheck.middleware.js`

**Features:**
- Fetches business KYC status
- Attaches to `req.business`
- Provides feature access matrix

**Usage:**
```javascript
// In routes
router.use(kycCheckMiddleware);

// In app.js - Applied globally to all protected routes
app.use('/api/*', authMiddleware, kycCheckMiddleware);
```

### 2. **Feature Lock Middleware**
Restricts specific features based on KYC status:
```javascript
router.post('/payments', featureLockMiddleware('payments'), paymentController);
```

**Response if locked:**
```json
{
  "success": false,
  "locked": true,
  "message": "payments is locked. Please complete KYC verification.",
  "kycStatus": "pending",
  "redirectTo": "/owner/dashboard?view=kyc"
}
```

### 3. **KYC Status Endpoints**

#### Get KYC Status
```
GET /api/kyc/status
```
**Response:**
```json
{
  "success": true,
  "data": {
    "kycStatus": "verified",
    "isApproved": true,
    "isVerified": true,
    "features": {
      "dashboard": { "locked": false, "mode": "basic" },
      "products": { "locked": false, "mode": "limited", "maxItems": 50 },
      "payments": { "locked": false }
    },
    "progress": {
      "percentage": 100,
      "completed": 8,
      "total": 8
    }
  }
}
```

#### Get Dashboard Overview
```
GET /api/kyc/overview
```

### 4. **Product Limit in Limited Mode**
Location: `controllers/product.controller.js`

When user is NOT KYC verified:
- Maximum 50 products allowed
- Returns error with current count and limit
- Error includes `redirectTo` for KYC completion

**Example Response (Limit Reached):**
```json
{
  "success": false,
  "locked": true,
  "message": "Product limit reached (50). Complete KYC to add more.",
  "currentCount": 50,
  "limit": 50,
  "redirectTo": "/owner/dashboard?view=kyc"
}
```

---

## 🎨 Frontend Implementation

### 1. **KYC Status Hook**
Location: `hooks/useKycStatus.js`

```javascript
import { useKycStatus } from '../hooks/useKycStatus';

const { kycStatus, isVerified, features, progress, loading, error } = useKycStatus();
```

**Returns:**
- `kycStatus`: 'pending', 'verified', 'rejected'
- `isVerified`: Boolean
- `features`: Feature access matrix
- `progress`: { percentage, completed, total, fields }

### 2. **Feature Lock Hook**
```javascript
import { useFeatureLock } from '../hooks/useKycStatus';

const { isLocked, mode, maxItems } = useFeatureLock('payments');
```

### 3. **UI Components**

#### KycProgressBar
Shows KYC completion progress:
```jsx
import KycProgressBar from '../components/kyc/KycProgressBar';

<KycProgressBar showLabel={true} />
```

#### KycPromptBanner
Shows actionable banner when KYC incomplete:
```jsx
import KycPromptBanner from '../components/kyc/KycPromptBanner';

<KycPromptBanner />
```

#### FeatureLock
Wraps locked features with overlay:
```jsx
import FeatureLock from '../components/kyc/FeatureLock';

<FeatureLock feature="payments">
  <PaymentGatewayForm />
</FeatureLock>
```

#### LimitedModeWarning
Shows warning badge for limited features:
```jsx
import LimitedModeWarning from '../components/kyc/LimitedModeWarning';

<LimitedModeWarning feature="product" maxItems={50} />
```

#### KycStatusDisplay
Shows current KYC status:
```jsx
import KycStatusDisplay from '../components/kyc/KycStatusDisplay';

<KycStatusDisplay 
  kycStatus={kycStatus}
  progress={progress}
  onCompleteClick={() => navigate('?view=kyc')}
/>
```

### 4. **Integration in OwnerLayout**
```jsx
<OwnerLayout>
  <KycPromptBanner />  {/* Banner at top */}
  <KycProgressBar />   {/* Progress tracking */}
  {children}
</OwnerLayout>
```

---

## 📱 Page Implementation Examples

### Products Page
```jsx
import { useFeatureLock } from '../hooks/useKycStatus';
import LimitedModeWarning from '../components/kyc/LimitedModeWarning';

const ProductsPage = () => {
  const { isLocked, maxItems } = useFeatureLock('products');

  return (
    <>
      <LimitedModeWarning feature="product" maxItems={maxItems} />
      <ProductList />
      <button disabled={isLocked} onClick={addProduct}>
        Add Product
      </button>
    </>
  );
};
```

### Payments Page (Fully Locked)
```jsx
import FeatureLock from '../components/kyc/FeatureLock';

const PaymentsPage = () => {
  return (
    <FeatureLock feature="payments">
      <PaymentGatewayForm />
    </FeatureLock>
  );
};
```

### Dashboard (Always Available)
```jsx
const OwnerDashboard = () => {
  const { isVerified } = useKycStatus();

  return (
    <>
      {isVerified ? (
        <FullDashboard />
      ) : (
        <BasicDashboard />
      )}
    </>
  );
};
```

---

## 🔄 Flow Diagram

```
User Signup
    ↓
[Limited Mode - Soft Onboarding]
    ├─ Dashboard ✓ (basic)
    ├─ Products ✓ (max 50)
    ├─ Sales ✓ (manual)
    ├─ Payments ✗ (locked)
    ├─ Reports ✗ (locked)
    └─ Staff ✗ (locked)
    ↓
KYC Banner + Progress Shown
    ↓
User Completes KYC
    ↓
System Processes (pending → verified)
    ↓
[Full Access Mode]
    ├─ All features unlocked
    ├─ No product limit
    └─ Full analytics
```

---

## 🔧 Configuration

### Limits (in `constants/limitedMode.js`)
```javascript
export const LIMITED_MODE_LIMITS = {
  MAX_PRODUCTS: 50,
  MAX_INVENTORY_ITEMS: 50,
  MAX_STAFF_MEMBERS: 0,
};
```

### Feature Access Matrix
```javascript
export const FEATURE_ACCESS = {
  PRODUCTS: { locked: false, mode: 'limited', maxItems: 50 },
  PAYMENTS: { locked: true },
  STAFF: { locked: true },
  // ... more
};
```

---

## 🚀 How to Use in Your Routes

### Backend Routes
```javascript
// Protected by KYC check
router.post('/products', authMiddleware, kycCheckMiddleware, createProduct);

// Locked feature
router.post('/payments', authMiddleware, featureLockMiddleware('payments'), processPayment);
```

### Frontend Routes
```javascript
// Show lock overlay
<FeatureLock feature="payments">
  <PaymentsPage />
</FeatureLock>

// Show warning
<LimitedModeWarning feature="product" />
<ProductsPage />

// Conditional rendering
{isVerified ? <FullReports /> : <BasicReports />}
```

---

## ✅ Testing Checklist

- [ ] KYC progress bar shows 0% for new user
- [ ] KYC banner displays "Complete KYC" message
- [ ] Products limit warning shows at 40+ products
- [ ] Cannot add 51st product (gets error with redirect)
- [ ] Cannot access payments page (lock overlay shows)
- [ ] Staff button disabled for unverified users
- [ ] After KYC approval, all features unlock
- [ ] Progress bar shows 100% when verified
- [ ] Banner disappears when verified
- [ ] All API endpoints return proper locked response

---

## 📝 Notes

- KYC status is fetched every 30 seconds in the hook (configurable)
- All locked features return `{ locked: true, redirectTo }` in responses
- Product limit is enforced at backend, not just frontend
- Feature access is dynamic - cached for 30 seconds
- Limited mode is soft onboarding - users can explore before KYC

---

**Created:** May 8, 2026
**Version:** 1.0.0
