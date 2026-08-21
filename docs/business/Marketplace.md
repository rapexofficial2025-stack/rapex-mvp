# Marketplace

Business rules for Marketplace.

## Status
**Received, not independently verified.** Pasted by the founder
2026-08-20 as a "RAPEX Master Category System" reference PDF
(`RAPEX_MASTER_CATEGORY_LIST_for_ICON.pdf`) — review only until
confirmed against real Xano. This is a content/taxonomy spec, not yet
implemented anywhere in the frontend. `AddProductPage.tsx` (merchant-portal)
currently uses a free-text Category field — replacing it with a real
picker sourced from this taxonomy is future work once it exists as
actual Xano category records (see `docs/database/data-dictionary.md`'s
Category Master / Service Category tables), not hardcoded client-side.

## Category taxonomy (5 levels)

### Level 1 — Primary Category (4)
The top-level split, each with its own icon/GIF:
1. **Food & Beverage** — all ready-to-eat food
2. **Shop** — all essential/non-essential non-food
3. **Services** — freelancer, group, and company service providers
4. **Auction** — pre-loved and high-value items

### Level 2 — Store Subcategory (icon + product icon)
Grouped under the primary categories above.

**Food:** Ready-to-Eat Meals, Restaurants, Fast Food, Carinderia, Bakery,
Cafe, Milk Tea Shop, Pizza Shop, Burger Shop, Chicken Shop, Seafood,
BBQ & Grill, Street Food, Dessert Shop, Grocery, Convenience Store,
Frozen Food, Meat Shop, Seafood Market, Fruit Stand, Vegetable Store,
Water Station

**Non-Food (Shop):** Household, Appliances, Furniture, Home Improvement,
Hardware, Electrical, Plumbing, Paint Center, Lighting, Construction
Supply, Glass & Aluminum, Tiles & Flooring, Gadgets, Mobile Phones,
Computer Shop, Accessories, Camera Shop, Gaming, Fashion, Clothing,
Shoes, Bags, Jewelry, Watches, Cosmetics, Beauty, Office & School, Books,
Office Supplies, Printing Supplies, Automotive, Motorcycle, Bicycle,
Tires, Auto Accessories, Car Care, Medical, Pharmacy, Medical Supplies,
Vitamins, Pet Shop, Sports, Musical Instruments, Toys, Baby Store,
Industrial, Safety Equipment, Agriculture Equipment

**Agriculture:** Fresh Produce, Livestock, Feeds, Seeds, Fertilizers,
Farm Equipment, Pesticides, Organic Products, Rice Dealer, Corn Dealer,
Fishery, Aquaculture

**Services:** Creative, Construction, Engineering, Home Services,
Automotive, Health, Beauty, Business, Education, Events, Water Services,
Cleaning, Repair, Professional Services

**Local Market:** Sari-Sari Store, Local Market, Rice Dealer, Egg Dealer,
Seafood Vendor, Meat Shop, Mini Mart, Farm Products, Rice & Grains,
Specialty Store

### Level 3 — Store Type
Per the source doc: **"This is actually more important than Product
Category because users search by STORE."**

- **Food Store:** Restaurant, Fast Food, Carinderia, Bakery, Coffee
  Product, Milk Tea, Pizza, Burger, Street Food, Dessert Shop, Meat Shop,
  Seafood Shop, Vegetable Store, Fruit Store, Grocery, Convenience Store,
  Frozen Product, Water Refilling, Ice Dealer, Liquor Store, Beverage Store
- **Non-Food Store:** Department Store, Household Store, Furniture Store,
  Mattress Store, Glass & Aluminum, Door Supplier, Lumber Store,
  Construction Supply, Hardware Store, Electrical Supply, Plumbing
  Supply, Paint Center, Lighting Store, Roofing Supply, Tiles Store
- **Electronics Store:** Mobile Shop, Computer Shop, Gadget Store, Camera
  Store, Gaming Store, CCTV Store, Audio Store, Printer Store
- **Fashion Store:** Clothing Store, Boutique, Shoes, Bags, Watches,
  Jewelry, Accessories, Cosmetics, Barber Supply, Beauty Supply
- **Automotive Store:** Auto Parts, Motorcycle Parts, Tire Shop, Oil
  Store, Battery Store, Accessories, Car Wash, Fuel Station
- **Health Store:** Pharmacy, Medical Supplies, Clinic, Laboratory,
  Dental Clinic, Optical
- **Agriculture Store:** Rice Dealer, Corn Dealer, Vegetable Supplier,
  Fruit Supplier, Poultry, Hog Supplier, Livestock, Fish Dealer, Seed
  Supplier, Plant Nursery, Organic Shop
- **Pet Store:** Pet Shop, Veterinary, Aquarium, Bird Shop
- **Industrial Store:** Industrial Supply, Safety Supply, Machinery,
  Welding Supply
- **Service Store:** Home Cleaning, Handyman, Electrician, Plumber,
  Mason, Carpenter, Roofing, Aircon Service, Laundry, Moving Service
- **Automotive Services:** Mechanic, Auto Repair, Car Wash, Vulcanizing,
  Towing, Battery Installation
- **Creative Services:** Tattoo, Mural, Graphic Design, Photography,
  Videography, Printing, Signage, Music/Dance/Art Lessons, Web Design,
  App Development
- **Business Services:** Accounting, Bookkeeping, Legal, Notary,
  Consulting, Insurance, Real Estate, Courier, Cargo, Freight
- **Personal Services:** Salon, Barbershop, Spa, Massage, Nail Salon,
  Makeup Artist, Personal Trainer, Tutor

### Level 4 — Product Category
Each store defines its own product categories (store-specific, not a
fixed global list). Example given in the source doc:
- **Hardware Store:** Hammer, Screwdriver, Drill, Pliers, PVC Pipe,
  Nails, Cement, Steel Bar, Paint, Switch, Outlet, Breaker, LED Bulb, Wire
- **Pet Shop:** Dog Food, Cat Food, Bird Food, Aquarium, Dog Cage, Pet
  Medicine

### Level 5 — Tags / Badges
Emoji-backed tags applied to stores/products, grouped as:
- **Delivery tags:** speed (Free/Express/Same-Day/Within 2h/4h/Next-Day/
  Overnight/Scheduled), payment (COD/Card/QR PH/GCash/Maya/Bank
  Transfer/RAPEX Wallet/Installment), fulfillment (Pickup/Curbside/Store
  Pickup/Meet-up/Nationwide/International/Bulk/Cold Chain), availability
  (Open Now/24 Hours/Opens Soon/Closing Soon/By Reservation/Call Before
  Delivery)
- **Status tags (popularity):** Popular, Trending, Best Seller, New
  Arrival, Just Added, Featured, Premium, Budget Friendly, Best Value,
  Customer Favorite, Most Loved, Fast Selling, Hot Deal, Flash Sale,
  Recommended, Limited Offer, Promo Item, Bundle Deal, Limited Edition,
  Seasonal, Summer/Holiday/Rainy-Day Special, Staff Pick, AI Recommended
- **Merchant tags:** verification (Verified Merchant/Business, Registered
  Business, DTI/SEC Registered, Licensed Seller, Permit Verified),
  reputation (Top Rated, Top Seller, Elite/Premium/Gold Merchant,
  Official Store, RAPEX Mall, Local Business, Family-Owned, Community
  Favorite, Trusted/Recommended Seller), performance (Fast Responder,
  Fast Shipping, High Fulfillment Rate, Top Performing, On-Time
  Delivery, Excellent Support, Repeat Customer Favorite, Quality Assured)
- **Badges:** membership tiers (Bronze → Silver → Gold → Diamond →
  Platinum → Titanium → Elite → VIP → Legend → Founders Club),
  achievement badges (Top Seller, Best Merchant, Rising Star, Fast
  Growing, Sales Champion, Million Sales Club, Trending/Premium/Official
  Store, Community Favorite, Customer Choice, Excellence Award, Trusted
  Merchant, Fulfillment Master, Lightning Delivery, Anniversary/Pioneer
  Store, Hall of Fame), loyalty badges (Loyal/Super Loyal/VIP Customer,
  Gold/Diamond Loyalty, Lifetime Member, Referral Champion, Frequent
  Buyer, Big Spender, Bulk Buyer)
- **Product tags:** food (cuisine flags PH/JP/KR/CN/TH/IN/MX/IT/etc., food
  type, dessert, dietary — Spicy/Healthy/Vegan/Vegetarian/Halal/Kosher/
  Low-Sodium/Sugar-Free/Gluten-Free/Dairy-Free/Nut-Free/High-Protein),
  origin (Made in PH, Imported, Locally Manufactured, Local/Farm-Fresh/
  Region-Exclusive/Island Product), craftsmanship (Handmade, Artisan
  Made, Custom Made, Handcrafted, Factory Made, Made to Order), eco
  (Eco-Friendly, Organic, Sustainable, Natural, Plastic-Free, Recyclable
  Packaging, Carbon Conscious), availability (In Stock, Limited Stock,
  Fast Moving, Out of Stock, Pre-Order, Back Order, Newly Restocked),
  selling type (Retail, Wholesale, Bulk/Case Pack, Bundle, Combo Deal,
  Multi-Pack), quality (Premium/Standard Quality, Luxury, Certified,
  Warranty Included, Authentic, Original, FDA Approved, BFAD Registered,
  DTI Certified), business (B2B, B2C, Distributor, Dealer, Manufacturer,
  Supplier, Exclusive Distributor)
- **Promotion tags:** Grand Opening, Anniversary Sale, Flash Sale,
  Clearance Sale, Buy 1 Get 1, Voucher Available, Cashback, Holiday Sale,
  Birthday Promo, Weekend/Midnight Sale, Daily Deal, Free Gift, Gift with
  Purchase, Price Drop, Limited-Time Offer

## Icon asset production note (from source doc)
Founder's own note in the source PDF: target ~512×512 transparent PNG +
SVG icons — 4 Primary Category icons, 45–60 Subcategory icons, 120–180
Store Type icons, 250–400 Product Category icons (expand over time),
60–100 Tag icon/badges. Suggested free source for basic icons/stickers/
GIFs: flaticon.com. This is an asset-production task, not something to
build in code.
