# Merchant

Business rules for Merchant registration, store creation, and
verification. See `Authentication.md` for the shared cross-role auth
architecture this plugs into.

## Status
**Received, not independently verified.** Pasted by the founder
2026-08-20 as a GPT-authored reconciliation doc — review only until
confirmed against real Xano. **This flow is now declared an Alpha
blocker** — see `Authentication.md`'s "Alpha blocker declaration."

## Core principle
```
Merchant Account → Merchant Identity → Business Verification →
Main Store → Store Verification → Approval → Merchant Dashboard
```
Don't make the merchant fill 100 fields on the first screen. Collect
enough to establish identity, security, and the primary store first;
collect deeper business information through the verification flow.

## Merchant vs. Store are separate identities
```
MERCHANT
   ├── Identity (the account owner)
   └── STORE
         ├── Products
         ├── Inventory
         ├── Orders
         ├── Location
         └── Ratings
```
A merchant may eventually own/manage **multiple stores**:
```
MERCHANT
 ├── STORE 1
 ├── STORE 2
 ├── STORE 3
 └── ...
```
Avoid the classic mistake of hardcoding 1 merchant = 1 store forever.

## The 13-step registration flow

### Step 1 — Create Merchant Account (account security)
Required: Email, Mobile Number, Password, Confirm Password, Country,
Accept Terms & Conditions, Accept Privacy Policy, Merchant Agreement
acceptance. Verification: Email OTP, Mobile OTP, password strength
validation, account status.

System fields: `Merchant_ID` (Xano native ID), `rapid_code`,
`role = MERCHANT`, Account Status, Registration Status, Verification
Status, Created At, Last Login, Last Active, Email Verified, Mobile
Verified.

Merchant status chain:
```
REGISTERED → EMAIL_VERIFIED → MOBILE_VERIFIED → PROFILE_COMPLETED →
DOCUMENTS_SUBMITTED → UNDER_REVIEW → APPROVED → ACTIVE
```

### Step 2 — Merchant Basic Information (who owns the account)
- **Personal/Owner**: First/Middle/Last Name, Suffix, Birthday, Gender,
  Profile Photo, Nationality, Cultural Background, Primary Language.
- **Contact**: Mobile Number, Alternate Mobile, Email, Alternate Email.
- **Residential Address**: Region, Province, Municipality/City,
  Barangay, Address Line 1/2, Postal Code.
- **Identity Verification**: ID Type, ID Number, ID Front, ID Back,
  Selfie with ID.

### Step 3 — Merchant Type
Select before store creation:
- **Merchant Type**: Individual Seller, Sole Proprietor, Partnership,
  Corporation, Cooperative, Other.
- **Business Registration Status**: Registered Business, Informal/Small
  Seller, Home-Based Business, Online Seller, Other.

Don't block small sellers for lacking corporation-level documents — the
verification engine determines required documentation **based on
merchant type** (see Step 8).

### Step 4 — Main Store Registration
Store Name (e.g. "JLEX Hardware"), Store Display Name (optional, if
different), Store Category (Hardware, Sari-Sari, Pharmacy, Pet Shop,
Agri Business, Wet Market, Korean Mart, Food, Frozen Food, Meat Shop,
Cold Storage, Other), Subcategory (loaded dynamically from the selected
category — e.g. Hardware → Paint / Construction Materials / Tools /
Electrical / Plumbing).

### Step 5 — Store Details
**Identity**: Store Name, Description, Logo, Cover Photo, Store Photos,
Contact Number, Store Email.
**Operating Hours**: per-day Open/Close/Closed, plus Holiday Schedule,
Temporary Closure, Special Hours.

### Step 6 — Store Location (critical for logistics)
Region, Province, Municipality/City, Barangay, Address Line 1/2, Postal
Code, Latitude, Longitude. Capture via "Use Current Location," "Select
on Map," or "Manual Address." The stored coordinates become
**authoritative** for: store discovery, distance, delivery fee, rider
assignment, Auto-Pick, ETA, service radius.

### Step 7 — Store Delivery Configuration
**Delivery**: RAPEX Delivery, Store Pickup (if enabled later), Available
for Rapid Express, Available for Standard Delivery.
**Store Preparation**: Average Preparation Time, Order Acceptance Time,
Maximum Order Capacity, Temporary Order Pause.

**Hard rule**: merchants can never manually manipulate the RAPEX
delivery fee — it stays controlled by the RAPEX Formula Engine (see
`Commissions.md`).

### Step 8 — Business Documents
Possible documents (configurable per merchant type, never
one-size-fits-all): Government Business Registration, DTI Registration,
SEC Registration, Mayor's Permit, BIR Registration, Business Permit,
other required document.
```
Merchant Type → Verification Rule → Required Documents
```
Never hardcode "every merchant must have all five."

### Step 9 — Bank / Payout Information
Account Name, Bank/Provider, Account Number, Account Type, GCash/
e-wallet if supported, Verification Status.

**Security**: never expose complete bank details in normal UI — display
masked (`**** **** 1234`). Admin may have controlled full access.

### Step 10 — Store Verification (Admin review)
Admin reviews **Merchant**: Identity, Email, Mobile, ID, Selfie,
Business information. And **Store**: Store Name, Category, Address,
GPS, Store photos, Documents, Bank/payout information.

Outcome:
```
PENDING → UNDER REVIEW → APPROVED
```
or:
```
REJECTED → CORRECTION REQUIRED → RESUBMITTED → UNDER REVIEW
```

### Step 11 — Merchant Security Status (separate flags, not one boolean)
`is_active` (account) · `email_verified` · `mobile_verified` ·
`identity_verified` · `business_verified` · `store_verified` ·
`payout_verified` · `merchant_verified` (overall/computed). This lets
Admin see exactly what passed, not just a single opaque `verified=true`
— see `Verification.md` for the general pattern this follows.

### Step 12 — Merchant Access Level
```
REGISTERED (cannot sell yet)
    ↓
VERIFIED (can activate store)
    ↓
ACTIVE (can receive orders)
```
Plus exception states: `SUSPENDED` (cannot receive new orders) and
`DEACTIVATED` (account disabled).

### Step 13 — Merchant Dashboard (after approval)
Today's Sales, Orders (Pending/Preparing/Ready/Completed), Products,
Inventory, Store Status, Store Hours, Wallet, Settlement, Reports,
Ratings, Messages, Promotions, POS, Delivery Settings.

Later/conditional, **never auto-activated** just because the merchant
account exists: Wholesale, Service Provider, Freelancer, Auction,
Partnership.

## Recommended screen-by-screen UX (10 screens)
```
1. Create Merchant Account (Email, Mobile, Password)
2. Verify Account (Email OTP, Mobile OTP)
3. Merchant Basic Information (Name, Birthday, Contact, Residential Address)
4. Identity Verification (ID, Selfie)
5. Create Your Store (Store Name, Category, Subcategory, Logo, Cover)
6. Store Location (Current Location / Map / Manual Address)
7. Store Operations (Hours, Preparation Time, Delivery Availability)
8. Business Verification (documents required per merchant type)
9. Payout Account (Bank / E-wallet)
10. Submit for Verification → "Your merchant application has been
    submitted. Status: UNDER REVIEW" → Admin gets a New Merchant
    Verification Request.
```

## Xano rule (same as everywhere else)
Use one identity/authentication foundation (see `Authentication.md`),
not a separate system for Merchant. Inspect existing tables/APIs first;
extend rather than duplicate. Use Xano's native `id` internally and
`rapid_code` (`MCT-...`) for RAPEX-facing identifiers.
