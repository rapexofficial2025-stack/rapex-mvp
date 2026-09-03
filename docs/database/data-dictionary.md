# RAPEX Core Data Dictionary — Master Column Checklist v1

**Received, not independently verified.** Uploaded by the founder as a
`.docx` on 2026-08-18 — a data-model readiness checklist, not confirmed
against live Xano from this environment. Review only; no schema changes
have been made from this doc.

**Purpose** (from the source doc): prepare the core RAPEX data model
before continuing feature implementation. This is a hybrid marketplace +
delivery + community + rewards + logistics architecture. Columns are
intentionally practical and simplified. Feature-specific tables can stay
inactive until their feature is built.

## Global rules
- Use unique IDs for every operational entity.
- Use active/status booleans and status fields instead of destructive
  deletion for historical operational data.
- Use `created_at`, `updated_at`, and where useful `deleted_at`/
  `archived_at` for auditability.
- Keep historical snapshots on transactions so later product/store edits
  don't change old orders.
- Do not duplicate Xano APIs or tables when an existing structure can be
  extended.
- Do not delete existing APIs during frontend integration; update/extend
  compatible APIs.
- Use relationships/foreign keys instead of copying full records into
  every table.
- Sensitive authentication credentials stay in the authentication
  system, not ordinary profile tables.

## RAPEX `rapid_code` ID rule — critical
Xano already has its own native UUID/`id` field. **Never** create another
column named `id` or `user_id` that conflicts with Xano's native ID.

- Native Xano `id` = internal database identifier (UUID).
- `rapid_code` = RAPEX-facing, human-readable public identifier — used
  for RAPEX-facing identification, references, QR/referral display,
  logs, and UI. Database relationships still use Xano's native `id`.

Format: `ROLE-REGION-MUNICIPALITY-SERIES`, e.g.:
```
USR-152154-212-001   (User)
RDR-152154-212-001   (Rider)
ADMN-152154-212-001  (Admin)
MCT-152154-212-001   (Merchant)
SERP-152154-212-001  (Service Provider)
FLR-152154-212-001   (Freelancer)
```
Freelancer is a role/sub-role of the RAPEX ecosystem — never confuse it
with the native Xano ID or create it as a duplicate user identity.

## Implementation note for Xano
This is a data-model **readiness checklist**, not permission to blindly
create 66 independent tables. Before creating any table or endpoint:
inspect the existing Xano schema. If a current table already serves the
same purpose, extend it. If a current API already performs the same or
similar function, update/extend it. **Do not duplicate APIs. Do not
delete existing APIs.** Preserve existing contracts and historical data.
Do not implement unfinished business rules merely because a table/column
exists — create the data foundation now, activate feature logic only
when that feature is finalized.

After any update, report: existing structures reused; columns added;
columns updated; APIs reused/updated; any genuine missing structure; any
conflict requiring human approval.

---

## Tables

### 1. Users
`user_id`(ID) `referral_id`(Text) `first_name`(Text) `middle_name`(Text)
`last_name`(Text) `birthdate`(Date) `age`(Computed) `gender`(Enum)
`email`(Text) `email_verified`(Boolean) `mobile_number`(Text)
`mobile_verified`(Boolean) `profile_photo_id`(ID) `cover_photo_id`(ID)
`role`(Enum) `account_status`(Enum) `online_status`(Boolean)
`last_active_at`(DateTime) `community_id`(ID) `culture_language_id`(ID)
`kyc_status`(Enum) `registration_progress`(Integer) `vip_status`(Boolean)
`subscription_id`(ID) `wallet_id`(ID) `level_id`(ID) `xp`(Integer)
`points_balance`(Decimal) `default_address_id`(ID) `created_at`(DateTime)
`updated_at`(DateTime)

### 2. User Addresses
`address_id`(ID) `user_id`(ID) `label`(Text) `region_id`(ID)
`province_id`(ID) `municipality_id`(ID) `barangay_id`(ID)
`address_1`(Text) `address_2`(Text) `latitude`(Decimal)
`longitude`(Decimal) `location_permission`(Boolean)
`default_address`(Boolean) `active`(Boolean) `created_at`(DateTime)
`updated_at`(DateTime)

### 3. Referral History
`referral_record_id`(ID) `referrer_user_id`(ID) `referred_user_id`(ID)
`referral_code`(Text) `qr_source`(Boolean) `status`(Enum)
`registered_at`(DateTime) `first_order_id`(ID) `reward_issued`(Boolean)
`reward_amount`(Decimal) `created_at`(DateTime)

### 4. QR / Referral Code
`qr_id`(ID) `user_id`(ID) `referral_id`(Text) `qr_payload`(Text)
`qr_image_url`(Text) `active`(Boolean) `created_at`(DateTime)

### 5. Merchant
`merchant_id`(ID) `user_id`(ID) `merchant_code`(Text)
`business_name`(Text) `business_type`(Enum) `owner_name`(Text)
`contact_number`(Text) `email`(Text) `logo_id`(ID) `cover_photo_id`(ID)
`description`(Text) `kyc_status`(Enum) `verified`(Boolean)
`vip_status`(Boolean) `pos_connected`(Boolean) `pos_provider_id`(ID)
`active`(Boolean) `created_at`(DateTime) `updated_at`(DateTime)

### 6. Store
`store_id`(ID) `merchant_id`(ID) `store_code`(Text) `store_name`(Text)
`store_type`(Enum) `category_id`(ID) `logo_id`(ID) `cover_photo_id`(ID)
`description`(Text) `region_id`(ID) `province_id`(ID)
`municipality_id`(ID) `barangay_id`(ID) `address_1`(Text)
`address_2`(Text) `latitude`(Decimal) `longitude`(Decimal)
`open_time`(Time) `close_time`(Time) `open_status`(Boolean)
`rating`(Decimal) `delivery_enabled`(Boolean) `active`(Boolean)
`created_at`(DateTime) `updated_at`(DateTime)

### 7. Product
`product_id`(ID) `store_id`(ID) `category_id`(ID) `subcategory_id`(ID)
`product_type`(Enum) `name`(Text) `description`(Text) `brand`(Text)
`base_price`(Decimal) `unit`(Text) `has_variants`(Boolean)
`has_addons`(Boolean) `inventory_tracking`(Boolean)
`stock_quantity`(Decimal) `active`(Boolean) `out_of_stock`(Boolean)
`image_id`(ID) `weight`(Decimal) `length`(Decimal) `width`(Decimal)
`height`(Decimal) `is_food`(Boolean) `is_fresh`(Boolean)
`preparation_time`(Integer) `wholesale_enabled`(Boolean)
`wholesale_min_qty`(Integer) `preloved_enabled`(Boolean)
`auction_enabled`(Boolean) `service_enabled`(Boolean)
`pos_synced`(Boolean) `pos_product_id`(Text) `created_at`(DateTime)
`updated_at`(DateTime)

### 8. Product Variant
`variant_id`(ID) `product_id`(ID) `variant_name`(Text) `sku`(Text)
`price`(Decimal) `stock_quantity`(Decimal) `weight`(Decimal)
`image_id`(ID) `active`(Boolean) `created_at`(DateTime)
`updated_at`(DateTime)

### 9. Product Add-on
`addon_id`(ID) `product_id`(ID) `group_name`(Text) `name`(Text)
`price`(Decimal) `selection_type`(Enum) `required`(Boolean)
`max_quantity`(Integer) `active`(Boolean)

### 10. Product Category
`category_id`(ID) `parent_id`(ID) `name`(Text) `category_type`(Enum)
`icon_id`(ID) `sort_order`(Integer) `active`(Boolean)
`created_at`(DateTime) `updated_at`(DateTime)

### 11. Service Category
`service_category_id`(ID) `parent_id`(ID) `name`(Text)
`description`(Text) `icon_id`(ID) `sort_order`(Integer) `active`(Boolean)
`created_at`(DateTime) `updated_at`(DateTime)

### 12. Municipality / Location Master
`location_id`(ID) `region_id`(ID) `province_id`(ID)
`municipality_id`(ID) `barangay_id`(ID) `name`(Text) `type`(Enum)
`parent_id`(ID) `latitude`(Decimal) `longitude`(Decimal)
`active`(Boolean)

### 13. Culture / Community
`community_id`(ID) `name`(Text) `description`(Text) `language_id`(ID)
`icon_id`(ID) `active`(Boolean) `sort_order`(Integer)

### 14. Language
`language_id`(ID) `name`(Text) `code`(Text) `active`(Boolean)
`sort_order`(Integer)

### 15. Rider
`rider_id`(ID) `user_id`(ID) `rider_code`(Text) `vehicle_id`(ID)
`vehicle_type`(Enum) `plate_number`(Text) `license_number`(Text)
`license_expiry`(Date) `online_status`(Boolean) `auto_pick`(Boolean)
`work_schedule`(JSON) `current_latitude`(Decimal)
`current_longitude`(Decimal) `last_location_at`(DateTime)
`service_radius_km`(Decimal) `wallet_id`(ID) `rating`(Decimal)
`completed_deliveries`(Integer) `verified`(Boolean) `active`(Boolean)

### 16. Vehicle
`vehicle_id`(ID) `rider_id`(ID) `vehicle_type`(Enum) `brand`(Text)
`model`(Text) `plate_number`(Text) `capacity_weight`(Decimal)
`capacity_volume`(Decimal) `active`(Boolean) `verified`(Boolean)

### 17. Order
`order_id`(ID) `master_order_id`(ID) `user_id`(ID) `store_id`(ID)
`order_type`(Enum) `delivery_type`(Enum) `order_status`(Enum)
`payment_status`(Enum) `subtotal`(Decimal) `discount`(Decimal)
`delivery_fee`(Decimal) `current_delivery_fee`(Decimal)
`total_amount`(Decimal) `voucher_id`(ID) `rider_id`(ID)
`delivery_address_id`(ID) `placed_at`(DateTime) `accepted_at`(DateTime)
`prepared_at`(DateTime) `picked_up_at`(DateTime) `delivered_at`(DateTime)
`cancelled_at`(DateTime) `waiting_hours`(Decimal) `failed_reason`(Text)
`created_at`(DateTime) `updated_at`(DateTime)

### 18. Order Item
`order_item_id`(ID) `order_id`(ID) `product_id`(ID) `variant_id`(ID)
`quantity`(Decimal) `unit_price`(Decimal) `discount`(Decimal)
`subtotal`(Decimal) `product_name_snapshot`(Text)
`variant_name_snapshot`(Text)

### 19. Delivery
`delivery_id`(ID) `order_id`(ID) `rider_id`(ID) `vehicle_type`(Enum)
`delivery_type`(Enum) `pickup_latitude`(Decimal)
`pickup_longitude`(Decimal) `dropoff_latitude`(Decimal)
`dropoff_longitude`(Decimal) `distance_km`(Decimal)
`estimated_minutes`(Integer) `delivery_fee`(Decimal) `current_fee`(Decimal)
`status`(Enum) `assigned_at`(DateTime) `picked_up_at`(DateTime)
`delivered_at`(DateTime) `failed_at`(DateTime)

### 20. Wallet
`wallet_id`(ID) `user_id`(ID) `wallet_type`(Enum) `balance`(Decimal)
`available_balance`(Decimal) `held_balance`(Decimal) `status`(Enum)
`created_at`(DateTime) `updated_at`(DateTime)

### 21. Wallet Transaction
`transaction_id`(ID) `wallet_id`(ID) `transaction_type`(Enum)
`amount`(Decimal) `reference_type`(Text) `reference_id`(ID)
`balance_after`(Decimal) `description`(Text) `created_at`(DateTime)

### 22. Bank Account / Payout
`bank_account_id`(ID) `user_id`(ID) `account_name`(Text)
`bank_name`(Text) `account_number_masked`(Text) `account_type`(Enum)
`verification_status`(Enum) `default_payout`(Boolean) `active`(Boolean)
`created_at`(DateTime) `updated_at`(DateTime)

### 23. Payment
`payment_id`(ID) `order_id`(ID) `user_id`(ID) `method`(Enum)
`provider`(Text) `reference_number`(Text) `amount`(Decimal)
`status`(Enum) `paid_at`(DateTime) `refund_amount`(Decimal)
`refunded_at`(DateTime) `created_at`(DateTime)

### 24. Coupon
`coupon_id`(ID) `user_id`(ID) `coupon_code`(Text) `source`(Enum)
`value`(Decimal) `minimum_purchase`(Decimal) `merchant_id`(ID)
`product_id`(ID) `status`(Enum) `expires_at`(DateTime)
`used_at`(DateTime) `order_id`(ID) `created_at`(DateTime)

### 25. Reward / Point History
`reward_id`(ID) `user_id`(ID) `source_type`(Enum) `source_id`(ID)
`points`(Decimal) `xp`(Integer) `description`(Text)
`balance_after`(Decimal) `created_at`(DateTime)

### 26. Level
`level_id`(ID) `level_number`(Integer) `level_name`(Text)
`xp_required`(Integer) `reward_id`(ID) `description`(Text)
`active`(Boolean)

### 27. Gamification Task
`task_id`(ID) `name`(Text) `description`(Text) `task_type`(Enum)
`xp_reward`(Integer) `points_reward`(Decimal) `daily_limit`(Integer)
`active`(Boolean) `created_at`(DateTime)

### 28. Level Reward
`reward_id`(ID) `level_id`(ID) `reward_type`(Enum)
`reward_value`(Decimal) `coupon_id`(ID) `description`(Text)
`active`(Boolean) `expires_at`(DateTime)

### 29. Saved Product
`save_id`(ID) `user_id`(ID) `product_id`(ID) `store_id`(ID)
`created_at`(DateTime) `active`(Boolean)

### 30. Express Cart
`cart_id`(ID) `user_id`(ID) `cart_type`(Enum) `order_id`(ID)
`status`(Enum) `expires_at`(DateTime) `created_at`(DateTime)
`updated_at`(DateTime)

### 31. Product History / Inventory Log
`inventory_log_id`(ID) `product_id`(ID) `variant_id`(ID) `store_id`(ID)
`change_type`(Enum) `quantity_before`(Decimal) `quantity_change`(Decimal)
`quantity_after`(Decimal) `source_type`(Enum) `source_id`(ID)
`changed_by_user_id`(ID) `created_at`(DateTime)

### 32. POS Connection
`pos_connection_id`(ID) `merchant_id`(ID) `provider_name`(Text)
`connection_type`(Enum) `external_store_id`(Text) `api_status`(Enum)
`last_sync_at`(DateTime) `sync_products`(Boolean)
`sync_inventory`(Boolean) `sync_orders`(Boolean) `active`(Boolean)

### 33. POS Sync Log
`sync_log_id`(ID) `pos_connection_id`(ID) `sync_type`(Enum)
`status`(Enum) `records_processed`(Integer) `records_failed`(Integer)
`error_message`(Text) `started_at`(DateTime) `completed_at`(DateTime)

### 34. Chat Thread
`chat_id`(ID) `order_id`(ID) `sender_user_id`(ID) `receiver_user_id`(ID)
`thread_type`(Enum) `status`(Enum) `last_message_at`(DateTime)
`created_at`(DateTime)

### 35. Chat Message
`message_id`(ID) `chat_id`(ID) `sender_user_id`(ID)
`message_type`(Enum) `message_text`(Text) `attachment_id`(ID)
`read_at`(DateTime) `created_at`(DateTime) `deleted`(Boolean)

### 36. Rating / Review
`review_id`(ID) `user_id`(ID) `target_type`(Enum) `target_id`(ID)
`order_id`(ID) `rating`(Integer) `comment`(Text) `photo_id`(ID)
`status`(Enum) `created_at`(DateTime)

### 37. Like
`like_id`(ID) `user_id`(ID) `target_type`(Enum) `target_id`(ID)
`active`(Boolean) `created_at`(DateTime)

### 38. Store Follow
`follow_id`(ID) `user_id`(ID) `store_id`(ID) `active`(Boolean)
`created_at`(DateTime)

### 39. Post / Community Content
`post_id`(ID) `user_id`(ID) `community_id`(ID) `title`(Text)
`content`(Text) `media_id`(ID) `status`(Enum) `likes_count`(Integer)
`comments_count`(Integer) `created_at`(DateTime) `updated_at`(DateTime)

### 40. Comment
`comment_id`(ID) `post_id`(ID) `user_id`(ID) `comment_text`(Text)
`status`(Enum) `created_at`(DateTime) `updated_at`(DateTime)

### 41. Subscription
`subscription_id`(ID) `user_id`(ID) `plan_id`(ID) `status`(Enum)
`billing_cycle`(Enum) `start_date`(DateTime) `next_billing_date`(DateTime)
`end_date`(DateTime) `auto_renew`(Boolean) `payment_method_id`(ID)
`created_at`(DateTime)

### 42. Subscription Plan
`plan_id`(ID) `name`(Text) `billing_cycle`(Enum) `price`(Decimal)
`vip_access`(Boolean) `wholesale_access`(Boolean)
`partner_access`(Boolean) `freelance_access`(Boolean) `active`(Boolean)

### 43. Freelance / Service Provider
`provider_id`(ID) `user_id`(ID) `provider_type`(Enum)
`business_name`(Text) `service_category_id`(ID) `description`(Text)
`profile_photo_id`(ID) `cover_photo_id`(ID) `service_area_id`(ID)
`hourly_rate`(Decimal) `availability_status`(Boolean)
`verification_status`(Enum) `rating`(Decimal) `active`(Boolean)
`created_at`(DateTime)

### 44. Service Booking
`booking_id`(ID) `customer_id`(ID) `provider_id`(ID)
`service_category_id`(ID) `booking_status`(Enum) `scheduled_at`(DateTime)
`location_address_id`(ID) `estimated_price`(Decimal)
`final_price`(Decimal) `payment_status`(Enum) `completed_at`(DateTime)
`cancelled_at`(DateTime) `created_at`(DateTime)

### 45. Partnership
`partnership_id`(ID) `partner_user_id`(ID) `referred_merchant_id`(ID)
`status`(Enum) `commission_rate`(Decimal) `start_date`(DateTime)
`end_date`(DateTime) `total_earned`(Decimal) `active`(Boolean)
`created_at`(DateTime)

### 46. Auction
`auction_id`(ID) `seller_user_id`(ID) `product_id`(ID) `title`(Text)
`description`(Text) `starting_price`(Decimal) `current_price`(Decimal)
`minimum_increment`(Decimal) `start_at`(DateTime) `end_at`(DateTime)
`status`(Enum) `winner_bid_id`(ID) `active`(Boolean)

### 47. Auction Bid
`bid_id`(ID) `auction_id`(ID) `bidder_user_id`(ID) `bid_amount`(Decimal)
`bid_status`(Enum) `created_at`(DateTime)

### 48. Auction Winner
`winner_id`(ID) `auction_id`(ID) `bid_id`(ID) `winner_user_id`(ID)
`winning_amount`(Decimal) `payment_status`(Enum)
`fulfillment_status`(Enum) `created_at`(DateTime)

### 49. Logistics
`logistics_id`(ID) `order_id`(ID) `delivery_id`(ID) `vehicle_type`(Enum)
`route_type`(Enum) `distance_km`(Decimal) `estimated_time`(Integer)
`actual_time`(Integer) `status`(Enum) `assigned_rider_id`(ID)
`created_at`(DateTime)

### 50. Notification
`notification_id`(ID) `user_id`(ID) `type`(Enum) `title`(Text)
`message`(Text) `reference_type`(Text) `reference_id`(ID)
`read`(Boolean) `created_at`(DateTime)

### 51. Password / Security Events
`security_event_id`(ID) `user_id`(ID) `event_type`(Enum)
`device_id`(Text) `ip_address`(Text) `success`(Boolean)
`created_at`(DateTime)

### 52. User Device
`device_id`(ID) `user_id`(ID) `device_identifier`(Text)
`platform`(Enum) `push_token`(Text) `app_version`(Text)
`last_seen_at`(DateTime) `active`(Boolean)

### 53. Audit Log
`audit_id`(ID) `actor_user_id`(ID) `action`(Text) `entity_type`(Text)
`entity_id`(ID) `old_value`(JSON) `new_value`(JSON) `ip_address`(Text)
`created_at`(DateTime)

### 54. Media / Asset Bank
`asset_id`(ID) `owner_type`(Enum) `owner_id`(ID) `asset_type`(Enum)
`file_url`(Text) `storage_path`(Text) `mime_type`(Text)
`sort_order`(Integer) `active`(Boolean) `created_at`(DateTime)

### 55. Marketing Ads
`ad_id`(ID) `campaign_name`(Text) `asset_id`(ID) `target_audience`(Enum)
`placement_type`(Enum) `start_at`(DateTime) `expires_at`(DateTime)
`click_action`(Text) `priority`(Integer) `randomize`(Boolean)
`active`(Boolean) `created_at`(DateTime)

See `docs/business/MarketingAds.md` for the full ads-engine behavior this
table backs.

### 56. Business / Store Hours
`schedule_id`(ID) `store_id`(ID) `day_of_week`(Integer) `open_time`(Time)
`close_time`(Time) `closed`(Boolean) `active`(Boolean)

### 57. Product Price History
`price_history_id`(ID) `product_id`(ID) `variant_id`(ID)
`old_price`(Decimal) `new_price`(Decimal) `changed_by_user_id`(ID)
`reason`(Text) `created_at`(DateTime)

### 58. Product Wholesale Tier
`wholesale_tier_id`(ID) `product_id`(ID) `minimum_quantity`(Integer)
`discount_type`(Enum) `discount_value`(Decimal) `active`(Boolean)
`created_at`(DateTime)

### 59. Referral Reward Config
`config_id`(ID) `reward_type`(Enum) `reward_value`(Decimal)
`coupon_count`(Integer) `monthly_limit`(Integer) `active`(Boolean)
`created_at`(DateTime)

### 60. System Status / Feature Flags
`feature_id`(ID) `feature_name`(Text) `enabled`(Boolean)
`audience`(Enum) `start_at`(DateTime) `end_at`(DateTime)
`description`(Text) `updated_at`(DateTime)

### 61. Industrial Wholesale Inquiry
For large buyers who don't simply click Buy Now.
`inquiry_id`(ID) `buyer_user_id`(ID) `merchant_id`(ID) `product_id`(ID)
`quantity_requested`(Decimal) `unit`(Text) `target_price`(Decimal)
`delivery_location_id`(ID) `requested_delivery_date`(Date)
`special_requirements`(Text) `status`(Enum) `created_at`(DateTime)
`updated_at`(DateTime)

### 62. Wholesale Quotation
Merchant responds to the inquiry with an actual quotation, enabling
`Inquire → Quote → Accept → Order → RAPEX Logistics` without forcing an
industrial customer through ordinary checkout.
`quotation_id`(ID) `inquiry_id`(ID) `merchant_id`(ID) `buyer_user_id`(ID)
`quantity`(Decimal) `unit_price`(Decimal) `discount`(Decimal)
`subtotal`(Decimal) `delivery_fee`(Decimal) `total_amount`(Decimal)
`valid_until`(DateTime) `payment_terms`(Text) `delivery_terms`(Text)
`status`(Enum) `created_at`(DateTime) `updated_at`(DateTime)

### 63. System Error Log
Catches: `AUTH_FAILED`, `API_TIMEOUT`, `DATABASE_ERROR`,
`PAYMENT_FAILED`, `ORDER_ERROR`, `POS_SYNC_ERROR`, `LOCATION_ERROR`,
`UPLOAD_ERROR`, `SERVER_ERROR`, `UNKNOWN_ERROR`.
`error_id`(ID) `error_code`(Text) `error_type`(Enum) `severity`(Enum)
`service`(Text) `module`(Text) `endpoint`(Text) `user_id`(ID)
`order_id`(ID) `device_id`(ID) `request_id`(Text) `message`(Text)
`stack_trace`(Text) `status_code`(Integer) `ip_address`(Text)
`environment`(Enum) `resolved`(Boolean) `resolved_by`(ID)
`resolved_at`(DateTime) `created_at`(DateTime)

### 64. Authentication Event Log
Separate from general errors — gives Admin/engineering an actual history
instead of "user says login doesn't work." Examples: `LOGIN_SUCCESS`,
`LOGIN_FAILED`, `GOOGLE_AUTH_FAILED`, `OTP_FAILED`, `OTP_EXPIRED`,
`PASSWORD_RESET`, `ACCOUNT_LOCKED`, `TOKEN_EXPIRED`, `SESSION_EXPIRED`.
`auth_event_id`(ID) `user_id`(ID) `event_type`(Enum)
`email_or_mobile`(Text) `device_id`(ID) `ip_address`(Text)
`success`(Boolean) `failure_reason`(Text) `attempt_count`(Integer)
`created_at`(DateTime)

### 65. Server / System Monitor
For production infrastructure.
`server_log_id`(ID) `service_name`(Text) `environment`(Enum)
`status`(Enum) `cpu_usage`(Decimal) `memory_usage`(Decimal)
`storage_usage`(Decimal) `response_time_ms`(Integer)
`error_rate`(Decimal) `request_count`(Integer) `uptime`(Decimal)
`last_check_at`(DateTime)

**Architectural note from the source doc**: don't make Xano itself the
only place every server metric lives. Business error/audit records
belong in the application/backend data model; infrastructure monitoring
should use appropriate monitoring/logging infrastructure. The data
dictionary keeps the references needed to connect those systems.

### 66. Bug / Issue Tracker
Kept separate from raw system errors.
`bug_id`(ID) `reported_by`(ID) `title`(Text) `description`(Text)
`module`(Text) `severity`(Enum) `priority`(Enum) `status`(Enum)
`error_id`(ID) `device_id`(ID) `app_version`(Text)
`screenshots`(Asset ID) `assigned_to`(ID) `resolution`(Text)
`resolved_at`(DateTime) `created_at`(DateTime) `updated_at`(DateTime)

---

## Core RAPEX relationship map
```
USER → ADDRESS / WALLET / REFERRAL / COUPON / XP-POINTS / LEVEL / SUBSCRIPTION / CHAT / ORDERS
MERCHANT → STORE → CATEGORY → PRODUCT → VARIANT / ADD-ON / INVENTORY / POS
ORDER → ORDER ITEM → DELIVERY → RIDER → VEHICLE / LOGISTICS / PAYMENT
COMMUNITY → POSTS → COMMENTS / LIKES
SERVICE PROVIDER → SERVICE CATEGORY → BOOKING
AUCTION → BIDS → WINNER
REFERRAL → HISTORY → REWARD
ALL IMPORTANT CHANGES → AUDIT LOG
```

## Production layer grouping
```
RAPEX CORE
├── USERS
├── MERCHANT
├── STORE
├── PRODUCTS
├── ORDERS
├── DELIVERY
├── RIDERS
├── WALLET
├── REFERRAL
├── REWARDS
├── POS
├── CHAT
├── COMMUNITY
├── SERVICES
├── AUCTION
├── WHOLESALE
│    ├── Inquiry
│    └── Quotation
│
└── SYSTEM
     ├── Auth Events
     ├── Error Logs
     ├── Server Monitoring
     ├── Bug Tracker
     ├── Audit Logs
     └── Security Events
```
`AUTH_FAILED`/bug/server-error events must never just disappear into a
console log — they need traceable IDs so Claude, Codex, Xano, and Admin
can identify what happened.

## Features covered by this core model
User accounts/profile/address/KYC/security · Merchant/stores/products/
variants/categories/inventory · Food/Fresh and Non-Food ordering
foundations · Orders, multi-merchant master orders, delivery, logistics ·
Rider/vehicle/online status/Auto-Pick · Wallet, top-up, transactions,
payment, bank payout · Referral ID/QR/history · Coupons, reward points,
XP, levels, tasks, level rewards · Ratings, likes, follows, posts,
comments, chat history · Subscriptions and VIP plan foundations · POS
connection and sync history · Service provider/freelance and booking
foundations · Partnership foundations · Auction/bidder/winner
foundations · Marketing ads and centralized media/asset bank ·
Notifications, devices, security events, audit logs · Wholesale tier
foundations · Product and price history · Municipality, cultural
community, and language masters.

## Still open (from the source doc)
- Final industrial wholesale approval/payment rules.
- Final infrastructure monitoring stack.

## Strict rules for whoever implements this in Xano
1. **Update existing tables/columns first** — do not create duplicate
   tables, columns, APIs, or business logic if an equivalent already
   exists.
2. **Do not delete** existing Xano APIs, tables, or working logic —
   extend/update instead.
3. **Xano ID rule** (critical, repeated from above): never create
   another `id`/`user_id` column conflicting with Xano's native ID. Use
   native Xano `id` internally, `rapid_code` for RAPEX-facing IDs.
4. Use `rapid_code` for RAPEX-facing identification/references/QR/
   referral display/logs/UI; use Xano's native `id` for database
   relationships.
5. Freelancer is a role/sub-role — never a duplicate user identity.
6. Preserve existing relationships and API contracts — if an existing
   API already does the job, update/extend it rather than adding
   another one.
7. Don't implement unfinished business rules just because a table/column
   exists — build the foundation now, activate logic when the feature is
   finalized.
8. After updating, report: existing structures reused; columns added;
   columns updated; APIs reused/updated; any genuine missing structure;
   any conflict that needs human approval.

**Do not duplicate. Do not delete. Extend the existing RAPEX system.**
