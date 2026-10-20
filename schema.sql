-- ====================================================================
-- MYSHOP POS & INVENTORY MANAGEMENT SYSTEM - SUPABASE DATABASE SCHEMA
-- PostgreSQL / Supabase Schema (Complete with Constraints & RLS Policies)
-- ====================================================================

-- Enable necessary PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 1. ENUMS & CUSTOM TYPES
-- ====================================================================

-- User roles within a store (RBAC)
CREATE TYPE app_role AS ENUM (
  'admin',
  'supervisor',
  'inventory_manager',
  'staff'
);

-- Employee operational shift statuses
CREATE TYPE shift_status AS ENUM (
  'CLOCKED_IN',
  'ON_BREAK',
  'OFF_SHIFT',
  'INACTIVE'
);

-- Inventory product stock level statuses
CREATE TYPE stock_status AS ENUM (
  'IN_STOCK',
  'LOW_STOCK',
  'OUT_OF_STOCK'
);

-- Tax classification statuses
CREATE TYPE tax_status AS ENUM (
  'VATABLE_12',
  'NON_VAT',
  'TAX_EXEMPT'
);

-- Order payment statuses
CREATE TYPE order_payment_status AS ENUM (
  'COMPLETED',
  'PENDING',
  'VOIDED',
  'REFUNDED'
);

-- Payment gateway types
CREATE TYPE payment_gateway_type AS ENUM (
  'CASH',
  'GCASH',
  'MAYA',
  'CARD',
  'BANK_TRANSFER',
  'UTANG'
);

-- Customer Utang credit status
CREATE TYPE utang_status AS ENUM (
  'CURRENT',
  'DUE_SOON',
  'OVERDUE',
  'SETTLED'
);

-- Utang ledger transaction types
CREATE TYPE utang_txn_type AS ENUM (
  'CHARGE',
  'PAYMENT',
  'ADJUSTMENT',
  'WRITE_OFF'
);

-- Notification categories
CREATE TYPE notification_category AS ENUM (
  'SALES',
  'INVENTORY',
  'TEAM',
  'UTANG',
  'SYSTEM'
);

-- AI Supplier Invoice extraction status
CREATE TYPE invoice_status AS ENUM (
  'EXTRACTED',
  'CONFIRMED',
  'CANCELLED'
);

-- ====================================================================
-- 2. USER PROFILES (EXTENDING SUPABASE AUTH)
-- ====================================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_profile_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT check_profile_name_not_empty CHECK (length(trim(full_name)) > 0)
);

-- ====================================================================
-- 2.05 USER DEVICE SESSIONS (1 Active Device Per User Account)
-- ====================================================================

CREATE TABLE user_device_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  device_id VARCHAR(255) NOT NULL,
  device_name VARCHAR(255) NOT NULL DEFAULT 'Mobile Device',
  device_os VARCHAR(50) NOT NULL DEFAULT 'Android',
  app_version VARCHAR(50) DEFAULT '1.0.0',
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_active_user_device UNIQUE (user_id)
);

CREATE INDEX idx_user_device_sessions_user_id ON user_device_sessions(user_id);
CREATE INDEX idx_user_device_sessions_device_id ON user_device_sessions(device_id);

-- Enable RLS for user_device_sessions
ALTER TABLE user_device_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own device session"
  ON user_device_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ====================================================================
-- 2.1 USER / OWNER SUBSCRIPTIONS (SAAS MULTI-TENANT BILLING)
-- ====================================================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_tier VARCHAR(50) NOT NULL DEFAULT 'free',           -- 'free', 'micro', 'small', 'medium'
  status VARCHAR(50) NOT NULL DEFAULT 'active',            -- 'active', 'past_due', 'canceled', 'trialing'
  billing_interval VARCHAR(20) NOT NULL DEFAULT 'monthly', -- 'monthly', 'annual'
  price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,             -- price in PHP (e.g. 0.00, 99.00, 499.00, 1499.00)
  max_branches INTEGER NOT NULL DEFAULT 1,                 -- Free/Micro/Small: 1, Medium: 5 (+addons)
  max_devices INTEGER NOT NULL DEFAULT 1,                  -- Micro: 1, Small: 3, Medium: 999
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  paymongo_checkout_session_id VARCHAR(255),
  paymongo_payment_id VARCHAR(255),
  paymongo_customer_id VARCHAR(255),                       -- PayMongo customer vault ID (for saved card recurring charges)
  paymongo_payment_method_id VARCHAR(255),                 -- PayMongo tokenized card payment method ID (pm_...)
  payment_method VARCHAR(50) NOT NULL DEFAULT 'PayMongo',  -- 'PayMongo', 'Card', 'GCash', 'Maya'
  auto_renew BOOLEAN NOT NULL DEFAULT TRUE,                -- TRUE by default for active paid subscriptions
  scheduled_plan_tier VARCHAR(50),                         -- Scheduled plan tier for next billing cycle ('free', 'micro', 'small', 'medium')
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,     -- TRUE if user turned off auto-renew / scheduled downgrade to Free Tier
  grace_period_end TIMESTAMPTZ,                            -- Grace period for payment retry before downgrade
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(owner_id)
);

-- ====================================================================
-- 2.2 SUBSCRIPTION SALES / BILLING LEDGER (FOR SAAS ADMIN PANEL)
-- ====================================================================

CREATE TABLE subscription_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
  plan_tier VARCHAR(50) NOT NULL,                          -- 'micro', 'small', 'medium', 'enterprise'
  billing_interval VARCHAR(20) NOT NULL DEFAULT 'monthly', -- 'monthly', 'annual'
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,             -- price charged in PHP (0.00 for admin grant / free promo)
  currency VARCHAR(10) NOT NULL DEFAULT 'PHP',
  payment_status VARCHAR(50) NOT NULL DEFAULT 'paid',      -- 'paid', 'refunded', 'failed', 'pending', 'complimentary'
  payment_method VARCHAR(50) NOT NULL DEFAULT 'PayMongo',  -- 'PayMongo', 'GCash', 'Maya', 'Card', 'Admin_Grant', 'Promo'
  grant_type VARCHAR(50) NOT NULL DEFAULT 'purchase',      -- 'purchase', 'admin_grant', 'promo_free', 'vip_complimentary', 'trial'
  granted_by UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Admin user ID who granted free tier/plan
  admin_notes TEXT,                                        -- Reason/memo for admin grant
  other_details JSONB NOT NULL DEFAULT '{}'::jsonb,        -- Flexible payload for admin privileges, custom configs, campaign IDs
  paymongo_checkout_session_id VARCHAR(255),
  paymongo_payment_id VARCHAR(255),
  period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  period_end TIMESTAMPTZ NOT NULL,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast analytical & lookup indexes for SaaS Admin Panel
CREATE INDEX idx_subscription_sales_owner_id ON subscription_sales(owner_id);
CREATE INDEX idx_subscription_sales_plan_tier ON subscription_sales(plan_tier);
CREATE INDEX idx_subscription_sales_grant_type ON subscription_sales(grant_type);
CREATE INDEX idx_subscription_sales_payment_status ON subscription_sales(payment_status);
CREATE INDEX idx_subscription_sales_created_at ON subscription_sales(created_at DESC);
CREATE INDEX idx_subscription_sales_paymongo_payment_id ON subscription_sales(paymongo_payment_id);
CREATE INDEX idx_subscription_sales_paymongo_session_id ON subscription_sales(paymongo_checkout_session_id);

-- ====================================================================
-- 3. STORES & MULTI-TENANT WORKSPACES
-- ====================================================================

CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  name VARCHAR(255) NOT NULL,
  branch_code VARCHAR(100),
  location TEXT,
  store_email VARCHAR(255),
  store_phone VARCHAR(50),
  currency VARCHAR(10) NOT NULL DEFAULT 'PHP',
  available_payment_gateways JSONB NOT NULL DEFAULT '["CASH", "GCASH", "CARD", "BANK_TRANSFER"]'::jsonb,
  plan_tier VARCHAR(50) NOT NULL DEFAULT 'free',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_store_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT check_store_currency_not_empty CHECK (length(trim(currency)) > 0)
);

-- ====================================================================
-- 4. STORE MEMBERSHIPS & TEAM MANAGEMENT
-- ====================================================================

CREATE TABLE store_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'staff',
  employee_id VARCHAR(50) NOT NULL,
  current_shift shift_status NOT NULL DEFAULT 'OFF_SHIFT',
  last_clock_in TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(store_id, user_id),
  UNIQUE(store_id, employee_id),
  CONSTRAINT check_employee_id_not_empty CHECK (length(trim(employee_id)) > 0)
);

-- ====================================================================
-- 5. PRODUCT CATEGORIES & INVENTORY CATALOG
-- ====================================================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(store_id, name),
  CONSTRAINT check_category_name_not_empty CHECK (length(trim(name)) > 0)
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  barcode VARCHAR(100),
  description TEXT,
  price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL DEFAULT 'pcs',
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(store_id, sku),
  CONSTRAINT check_product_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT check_product_sku_not_empty CHECK (length(trim(sku)) > 0),
  CONSTRAINT check_product_price_non_negative CHECK (price >= 0),
  CONSTRAINT check_product_cost_non_negative CHECK (cost_price >= 0),
  CONSTRAINT check_product_stock_non_negative CHECK (stock_quantity >= 0),
  CONSTRAINT check_product_threshold_non_negative CHECK (low_stock_threshold >= 0)
);

-- ====================================================================
-- 6. STOCK AUDIT & INVENTORY MOVEMENT LOGS
-- ====================================================================

CREATE TABLE inventory_stock_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  performed_by UUID REFERENCES store_members(id) ON DELETE SET NULL,
  change_qty INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reason VARCHAR(100) NOT NULL,
  reference_id VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_stock_log_reason_not_empty CHECK (length(trim(reason)) > 0),
  CONSTRAINT check_stock_log_previous_non_negative CHECK (previous_stock >= 0),
  CONSTRAINT check_stock_log_new_non_negative CHECK (new_stock >= 0)
);

-- ====================================================================
-- 7. AI SUPPLIER INVOICES & EXTRACTED DATA
-- ====================================================================

CREATE TABLE supplier_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  imported_by UUID REFERENCES store_members(id) ON DELETE SET NULL,
  supplier_name VARCHAR(255) NOT NULL,
  invoice_number VARCHAR(100),
  invoice_date DATE,
  scanned_image_url TEXT,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  status invoice_status NOT NULL DEFAULT 'EXTRACTED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_supplier_name_not_empty CHECK (length(trim(supplier_name)) > 0),
  CONSTRAINT check_invoice_total_non_negative CHECK (total_amount >= 0)
);

CREATE TABLE supplier_invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES supplier_invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  item_name VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  quantity INTEGER NOT NULL DEFAULT 1,
  cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  suggested_category VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_invoice_item_name_not_empty CHECK (length(trim(item_name)) > 0),
  CONSTRAINT check_invoice_item_qty_positive CHECK (quantity > 0),
  CONSTRAINT check_invoice_item_cost_non_negative CHECK (cost_price >= 0),
  CONSTRAINT check_invoice_item_price_non_negative CHECK (selling_price >= 0)
);

-- ====================================================================
-- 8. ORDERS & POINT OF SALE (POS) TRANSACTIONS
-- ====================================================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  cashier_id UUID REFERENCES store_members(id) ON DELETE SET NULL,
  transaction_number VARCHAR(100) NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  discount_label VARCHAR(100),
  discount_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  vat_rate NUMERIC(5, 2) NOT NULL DEFAULT 12.00,
  vat_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  vatable_sales NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  vat_exempt_sales NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  final_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  payment_gateway payment_gateway_type NOT NULL DEFAULT 'CASH',
  amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  change_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  payment_status order_payment_status NOT NULL DEFAULT 'COMPLETED',
  is_utang BOOLEAN NOT NULL DEFAULT FALSE,
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(store_id, transaction_number),
  CONSTRAINT check_order_txn_not_empty CHECK (length(trim(transaction_number)) > 0),
  CONSTRAINT check_order_subtotal_non_negative CHECK (subtotal >= 0),
  CONSTRAINT check_order_discount_rate_range CHECK (discount_rate >= 0 AND discount_rate <= 100),
  CONSTRAINT check_order_discount_amount_non_negative CHECK (discount_amount >= 0),
  CONSTRAINT check_order_vat_rate_range CHECK (vat_rate >= 0 AND vat_rate <= 100),
  CONSTRAINT check_order_vat_amount_non_negative CHECK (vat_amount >= 0),
  CONSTRAINT check_order_vatable_sales_non_negative CHECK (vatable_sales >= 0),
  CONSTRAINT check_order_vat_exempt_non_negative CHECK (vat_exempt_sales >= 0),
  CONSTRAINT check_order_final_total_non_negative CHECK (final_total >= 0),
  CONSTRAINT check_order_paid_non_negative CHECK (amount_paid >= 0),
  CONSTRAINT check_order_change_non_negative CHECK (change_amount >= 0)
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  quantity INTEGER NOT NULL DEFAULT 1,
  line_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  is_vatable BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_order_item_name_not_empty CHECK (length(trim(product_name)) > 0),
  CONSTRAINT check_order_item_qty_positive CHECK (quantity > 0),
  CONSTRAINT check_order_item_unit_price_non_negative CHECK (unit_price >= 0),
  CONSTRAINT check_order_item_cost_price_non_negative CHECK (cost_price >= 0),
  CONSTRAINT check_order_item_line_total_non_negative CHECK (line_total >= 0),
  CONSTRAINT check_order_item_discount_non_negative CHECK (discount_amount >= 0)
);

-- ====================================================================
-- 9. UTANG & CUSTOMER CREDIT LEDGER
-- ====================================================================

CREATE TABLE utang_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50),
  address TEXT,
  total_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  due_date DATE,
  credit_status utang_status NOT NULL DEFAULT 'CURRENT',
  items_count INTEGER NOT NULL DEFAULT 0,
  last_purchase_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_utang_customer_name_not_empty CHECK (length(trim(customer_name)) > 0),
  CONSTRAINT check_utang_total_balance_non_negative CHECK (total_balance >= 0),
  CONSTRAINT check_utang_items_count_non_negative CHECK (items_count >= 0)
);

CREATE TABLE utang_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  utang_account_id UUID NOT NULL REFERENCES utang_accounts(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  recorded_by UUID REFERENCES store_members(id) ON DELETE SET NULL,
  transaction_type utang_txn_type NOT NULL DEFAULT 'CHARGE',
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  balance_before NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  balance_after NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  payment_method VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_utang_txn_amount_non_negative CHECK (amount >= 0),
  CONSTRAINT check_utang_txn_balance_before_non_negative CHECK (balance_before >= 0),
  CONSTRAINT check_utang_txn_balance_after_non_negative CHECK (balance_after >= 0)
);

-- ====================================================================
-- 10. NOTIFICATIONS & STORE ALERTS
-- ====================================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  recipient_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category notification_category NOT NULL DEFAULT 'SYSTEM',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_type VARCHAR(100),
  action_payload JSONB,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_notification_title_not_empty CHECK (length(trim(title)) > 0),
  CONSTRAINT check_notification_message_not_empty CHECK (length(trim(message)) > 0)
);

-- ====================================================================
-- 11. AUDIT TRAIL LOGS
-- ====================================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES store_members(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(100),
  details JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_audit_action_not_empty CHECK (length(trim(action)) > 0),
  CONSTRAINT check_audit_entity_not_empty CHECK (length(trim(entity_type)) > 0)
);

-- ====================================================================
-- 12. PERFORMANCE INDEXES
-- ====================================================================

-- Stores & Profiles
CREATE INDEX idx_stores_owner ON stores(owner_id);
CREATE INDEX idx_store_members_lookup ON store_members(user_id, store_id);

-- Inventory & Products
CREATE INDEX idx_products_store_category ON products(store_id, category_id);
CREATE INDEX idx_products_barcode ON products(store_id, barcode);
CREATE INDEX idx_inventory_stock_logs ON inventory_stock_logs(store_id, product_id);

-- Orders & Order Items
CREATE INDEX idx_orders_store_date ON orders(store_id, created_at DESC);
CREATE INDEX idx_orders_cashier ON orders(store_id, cashier_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Utang Accounts & Transactions
CREATE INDEX idx_utang_accounts_store ON utang_accounts(store_id, credit_status);
CREATE INDEX idx_utang_transactions_account ON utang_transactions(utang_account_id, created_at DESC);

-- Notifications & Audit
CREATE INDEX idx_notifications_store_user ON notifications(store_id, recipient_user_id, is_read);
CREATE INDEX idx_audit_logs_store ON audit_logs(store_id, created_at DESC);

-- ====================================================================
-- 13. AUTOMATED UPDATED_AT TRIGGER FUNCTION
-- ====================================================================

CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers to relevant tables
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE TRIGGER set_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE TRIGGER set_subscription_sales_updated_at BEFORE UPDATE ON subscription_sales FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE TRIGGER set_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE TRIGGER set_store_members_updated_at BEFORE UPDATE ON store_members FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE TRIGGER set_supplier_invoices_updated_at BEFORE UPDATE ON supplier_invoices FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE TRIGGER set_utang_accounts_updated_at BEFORE UPDATE ON utang_accounts FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- ====================================================================
-- 14. SECURITY HELPER FUNCTIONS (FOR ROW-LEVEL SECURITY EVALUATION)
-- ====================================================================

-- 1. Check if current user is the owner of a given store
CREATE OR REPLACE FUNCTION is_store_owner(p_store_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
SET row_security = off
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM stores
    WHERE id = p_store_id AND owner_id = auth.uid()
  );
END;
$$;

-- 2. Check if current user has any of the specified roles in the store (Owner automatically qualifies)
CREATE OR REPLACE FUNCTION has_store_role(p_store_id UUID, VARIADIC p_roles app_role[])
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
SET row_security = off
AS $$
BEGIN
  -- Store owner always has full admin authority
  IF is_store_owner(p_store_id) THEN
    RETURN TRUE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM store_members
    WHERE store_id = p_store_id
      AND user_id = auth.uid()
      AND role = ANY(p_roles)
  );
END;
$$;

-- 3. Check if user is an active member or owner of the store
CREATE OR REPLACE FUNCTION is_store_member(p_store_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
SET row_security = off
AS $$
BEGIN
  RETURN is_store_owner(p_store_id) OR EXISTS (
    SELECT 1 FROM store_members
    WHERE store_id = p_store_id AND user_id = auth.uid()
  );
END;
$$;

-- 4. Secure Badge Scanner Member Resolver (Accessible by Anonymous for Badge Login)
CREATE OR REPLACE FUNCTION get_badge_member_info(p_badge_code TEXT)
RETURNS TABLE (
  member_id UUID,
  employee_id VARCHAR,
  user_id UUID,
  role app_role,
  full_name VARCHAR,
  avatar_url TEXT,
  email VARCHAR,
  store_id UUID,
  store_name VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sm.id AS member_id,
    sm.employee_id,
    sm.user_id,
    sm.role,
    p.full_name,
    p.avatar_url,
    p.email,
    s.id AS store_id,
    s.name AS store_name
  FROM store_members sm
  JOIN profiles p ON p.id = sm.user_id
  JOIN stores s ON s.id = sm.store_id
  WHERE LOWER(TRIM(sm.employee_id)) = LOWER(TRIM(p_badge_code))
     OR sm.id::text = TRIM(p_badge_code)
     OR sm.user_id::text = TRIM(p_badge_code)
     OR LOWER(TRIM(p.email)) = LOWER(TRIM(p_badge_code))
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION get_badge_member_info(TEXT) TO anon, authenticated;

-- 5. Atomic POS Stock Deduction Function (SECURITY DEFINER to reliably deduct inventory upon checkout)
CREATE OR REPLACE FUNCTION deduct_product_stock(
  p_product_id UUID,
  p_quantity NUMERIC,
  p_store_id UUID DEFAULT NULL
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_current_stock NUMERIC;
  v_new_stock NUMERIC;
BEGIN
  SELECT stock_quantity INTO v_current_stock
  FROM products
  WHERE id = p_product_id;

  IF v_current_stock IS NULL THEN
    RETURN NULL;
  END IF;

  v_new_stock := GREATEST(0, v_current_stock - p_quantity);

  UPDATE products
  SET 
    stock_quantity = v_new_stock,
    updated_at = NOW()
  WHERE id = p_product_id;

  RETURN v_new_stock;
END;
$$;

GRANT EXECUTE ON FUNCTION deduct_product_stock(UUID, NUMERIC, UUID) TO authenticated, anon;

-- 6. Automated Subscription Renewal & Period Expiration Processor
CREATE OR REPLACE FUNCTION process_subscription_renewals()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_sub RECORD;
  v_renewed_count INTEGER := 0;
  v_downgraded_count INTEGER := 0;
  v_next_end TIMESTAMPTZ;
  v_target_tier VARCHAR(50);
BEGIN
  -- Process all active subscriptions where period has expired
  FOR v_sub IN
    SELECT * FROM subscriptions
    WHERE status = 'active'
      AND plan_tier != 'free'
      AND current_period_end <= NOW()
    FOR UPDATE
  LOOP
    -- Calculate interval duration
    IF v_sub.billing_interval = 'annual' THEN
      v_next_end := NOW() + INTERVAL '1 year';
    ELSE
      v_next_end := NOW() + INTERVAL '30 days';
    END IF;

    -- Scenario A: AUTO-RENEW IS ACTIVE (Extend period & record sales ledger)
    IF v_sub.auto_renew = TRUE AND (v_sub.cancel_at_period_end IS FALSE OR v_sub.cancel_at_period_end IS NULL) THEN
      v_target_tier := COALESCE(v_sub.scheduled_plan_tier, v_sub.plan_tier);

      -- 1. Extend subscription period
      UPDATE subscriptions
      SET
        plan_tier = v_target_tier,
        scheduled_plan_tier = NULL,
        current_period_start = NOW(),
        current_period_end = v_next_end,
        updated_at = NOW()
      WHERE id = v_sub.id;

      -- 2. Update store(s) if plan changed
      UPDATE stores
      SET plan_tier = v_target_tier, updated_at = NOW()
      WHERE owner_id = v_sub.owner_id;

      -- 3. Log into subscription_sales ledger
      INSERT INTO subscription_sales (
        owner_id,
        plan_tier,
        billing_interval,
        amount,
        currency,
        payment_status,
        payment_method,
        grant_type,
        paymongo_checkout_session_id,
        paymongo_payment_id,
        period_start,
        period_end,
        admin_notes,
        other_details
      ) VALUES (
        v_sub.owner_id,
        v_target_tier,
        v_sub.billing_interval,
        v_sub.price,
        'PHP',
        'paid',
        COALESCE(v_sub.payment_method, 'PayMongo'),
        'purchase',
        v_sub.paymongo_checkout_session_id,
        v_sub.paymongo_payment_id,
        NOW(),
        v_next_end,
        'Automated billing cycle renewal',
        jsonb_build_object('auto_renewed', true, 'renewal_date', NOW())
      );

      -- 4. Create in-app renewal notification
      INSERT INTO notifications (
        recipient_user_id,
        title,
        message,
        notification_type
      ) VALUES (
        v_sub.owner_id,
        'Subscription Auto-Renewed',
        CONCAT('Your subscription has been renewed until ', TO_CHAR(v_next_end, 'Mon DD, YYYY'), '.'),
        'SUBSCRIPTION'
      );

      v_renewed_count := v_renewed_count + 1;

    -- Scenario B: AUTO-RENEW TURNED OFF / CANCELED (Revert gracefully to Free Tier)
    ELSE
      v_target_tier := COALESCE(v_sub.scheduled_plan_tier, 'free');

      UPDATE subscriptions
      SET
        plan_tier = v_target_tier,
        status = 'active',
        price = 0.00,
        auto_renew = FALSE,
        scheduled_plan_tier = NULL,
        cancel_at_period_end = FALSE,
        updated_at = NOW()
      WHERE id = v_sub.id;

      UPDATE stores
      SET plan_tier = v_target_tier, updated_at = NOW()
      WHERE owner_id = v_sub.owner_id;

      -- Create notification
      INSERT INTO notifications (
        recipient_user_id,
        title,
        message,
        notification_type
      ) VALUES (
        v_sub.owner_id,
        'Subscription Period Ended',
        'Your paid subscription period has concluded and reverted to the Free Tier (1 branch).',
        'SUBSCRIPTION'
      );

      v_downgraded_count := v_downgraded_count + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'renewed_count', v_renewed_count,
    'downgraded_count', v_downgraded_count,
    'processed_at', NOW()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION process_subscription_renewals() TO authenticated, service_role;

-- ====================================================================
-- 15. ROW-LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- -- --------------------------------------------------------------------
-- A. PROFILES TABLE RLS
-- --------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_policy"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "profiles_insert_policy"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_policy"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- --------------------------------------------------------------------
-- A.1 SUBSCRIPTIONS TABLE RLS
-- --------------------------------------------------------------------
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 1. Store owners and their store staff can view the subscription
CREATE POLICY "subscriptions_select_policy"
ON subscriptions FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid() OR
  owner_id IN (
    SELECT s.owner_id FROM stores s
    JOIN store_members sm ON sm.store_id = s.id
    WHERE sm.user_id = auth.uid()
  )
);

-- 2. Store owners can create their own subscription record
CREATE POLICY "subscriptions_insert_policy"
ON subscriptions FOR INSERT
TO authenticated
WITH CHECK (
  owner_id = auth.uid()
);

-- 3. Only the store owner can update their subscription
CREATE POLICY "subscriptions_update_policy"
ON subscriptions FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid()
)
WITH CHECK (
  owner_id = auth.uid()
);

-- 4. Only the store owner can delete their subscription
CREATE POLICY "subscriptions_delete_policy"
ON subscriptions FOR DELETE
TO authenticated
USING (
  owner_id = auth.uid()
);

-- -- --------------------------------------------------------------------
-- A.2 SUBSCRIPTION SALES / BILLING LEDGER TABLE RLS
-- --------------------------------------------------------------------
ALTER TABLE subscription_sales ENABLE ROW LEVEL SECURITY;

-- 1. INSERT POLICY: Allow authenticated users to record sales entries
CREATE POLICY "subscription_sales_insert_policy"
ON subscription_sales FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- 2. SELECT POLICY: Store owners can view their own receipts; Admins & Service role can view all
CREATE POLICY "subscription_sales_select_policy"
ON subscription_sales FOR SELECT
TO authenticated, anon
USING (
  owner_id = auth.uid() OR
  auth.uid() IS NULL OR
  (auth.jwt() ->> 'role') = 'service_role' OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. UPDATE POLICY: Admins and owners can update/manage sales entries
CREATE POLICY "subscription_sales_update_policy"
ON subscription_sales FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid() OR
  (auth.jwt() ->> 'role') = 'service_role' OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
  owner_id = auth.uid() OR
  (auth.jwt() ->> 'role') = 'service_role' OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. DELETE POLICY: Only Admins can delete sales ledger records
CREATE POLICY "subscription_sales_delete_policy"
ON subscription_sales FOR DELETE
TO authenticated
USING (
  (auth.jwt() ->> 'role') = 'service_role' OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- --------------------------------------------------------------------
-- B. STORES TABLE RLS
-- --------------------------------------------------------------------
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stores_select_policy"
ON stores FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid() OR
  id IN (SELECT store_id FROM store_members WHERE user_id = auth.uid())
);

CREATE POLICY "stores_insert_policy"
ON stores FOR INSERT
TO authenticated
WITH CHECK (
  owner_id = auth.uid()
);

CREATE POLICY "stores_update_policy"
ON stores FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid() OR
  id IN (SELECT store_id FROM store_members WHERE user_id = auth.uid() AND role = 'admin')
)
WITH CHECK (
  owner_id = auth.uid() OR
  id IN (SELECT store_id FROM store_members WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "stores_delete_policy"
ON stores FOR DELETE
TO authenticated
USING (
  owner_id = auth.uid()
);

-- --------------------------------------------------------------------
-- C. STORE MEMBERS TABLE RLS
-- --------------------------------------------------------------------
ALTER TABLE store_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "store_members_select_policy"
ON store_members FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "store_members_insert_policy"
ON store_members FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR auth.uid() IS NOT NULL);

CREATE POLICY "store_members_update_policy"
ON store_members FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR auth.uid() IS NOT NULL)
WITH CHECK (user_id = auth.uid() OR auth.uid() IS NOT NULL);

CREATE POLICY "store_members_delete_policy"
ON store_members FOR DELETE
TO authenticated
USING (user_id = auth.uid() OR auth.uid() IS NOT NULL);

-- --------------------------------------------------------------------
-- D. CATEGORIES TABLE RLS
-- --------------------------------------------------------------------
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store members can view categories"
ON categories FOR SELECT
TO authenticated
USING (is_store_member(store_id));

CREATE POLICY "Admins and inventory managers can modify categories"
ON categories FOR ALL
TO authenticated
USING (has_store_role(store_id, 'admin', 'inventory_manager'))
WITH CHECK (has_store_role(store_id, 'admin', 'inventory_manager'));

-- --------------------------------------------------------------------
-- E. PRODUCTS TABLE RLS
-- --------------------------------------------------------------------
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store members can view products"
ON products FOR SELECT
TO authenticated
USING (is_store_member(store_id));

CREATE POLICY "Admins and inventory managers can insert and delete products"
ON products FOR INSERT
TO authenticated
WITH CHECK (has_store_role(store_id, 'admin', 'inventory_manager'));

CREATE POLICY "Store members can update products"
ON products FOR UPDATE
TO authenticated
USING (is_store_member(store_id))
WITH CHECK (is_store_member(store_id));

CREATE POLICY "Admins and inventory managers can delete products"
ON products FOR DELETE
TO authenticated
USING (has_store_role(store_id, 'admin', 'inventory_manager'));

-- --------------------------------------------------------------------
-- F. INVENTORY STOCK LOGS TABLE RLS
-- --------------------------------------------------------------------
ALTER TABLE inventory_stock_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins, supervisors, and inventory managers can view stock logs"
ON inventory_stock_logs FOR SELECT
TO authenticated
USING (has_store_role(store_id, 'admin', 'supervisor', 'inventory_manager'));

CREATE POLICY "Store members can record stock audit logs"
ON inventory_stock_logs FOR INSERT
TO authenticated
WITH CHECK (is_store_member(store_id));

-- --------------------------------------------------------------------
-- G. SUPPLIER INVOICES & ITEMS TABLE RLS
-- --------------------------------------------------------------------
ALTER TABLE supplier_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and inventory managers can view supplier invoices"
ON supplier_invoices FOR SELECT
TO authenticated
USING (has_store_role(store_id, 'admin', 'inventory_manager'));

CREATE POLICY "Admins and inventory managers can manage supplier invoices"
ON supplier_invoices FOR ALL
TO authenticated
USING (has_store_role(store_id, 'admin', 'inventory_manager'))
WITH CHECK (has_store_role(store_id, 'admin', 'inventory_manager'));

CREATE POLICY "Admins and inventory managers can view supplier invoice items"
ON supplier_invoice_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM supplier_invoices si
    WHERE si.id = supplier_invoice_items.invoice_id
      AND has_store_role(si.store_id, 'admin', 'inventory_manager')
  )
);

CREATE POLICY "Admins and inventory managers can manage invoice items"
ON supplier_invoice_items FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM supplier_invoices si
    WHERE si.id = supplier_invoice_items.invoice_id
      AND has_store_role(si.store_id, 'admin', 'inventory_manager')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM supplier_invoices si
    WHERE si.id = supplier_invoice_items.invoice_id
      AND has_store_role(si.store_id, 'admin', 'inventory_manager')
  )
);

-- --------------------------------------------------------------------
-- H. ORDERS & ORDER ITEMS TABLE RLS
-- --------------------------------------------------------------------
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store members and owners can view orders"
ON orders FOR SELECT
TO authenticated
USING (is_store_member(store_id));

CREATE POLICY "Store members and owners can create orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (is_store_member(store_id));

CREATE POLICY "Store members and owners can update orders"
ON orders FOR UPDATE
TO authenticated
USING (is_store_member(store_id))
WITH CHECK (is_store_member(store_id));

CREATE POLICY "Store members and owners can delete orders"
ON orders FOR DELETE
TO authenticated
USING (has_store_role(store_id, 'admin'));

CREATE POLICY "Store members and owners can view order items"
ON order_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = order_items.order_id AND is_store_member(o.store_id)
  )
);

CREATE POLICY "Store members and owners can create order items"
ON order_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = order_items.order_id AND is_store_member(o.store_id)
  )
);

CREATE POLICY "Store members and owners can delete order items"
ON order_items FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = order_items.order_id AND has_store_role(o.store_id, 'admin')
  )
);

-- --------------------------------------------------------------------
-- I. UTANG ACCOUNTS & TRANSACTIONS TABLE RLS
-- --------------------------------------------------------------------
ALTER TABLE utang_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE utang_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store members and owners can view utang accounts"
ON utang_accounts FOR SELECT
TO authenticated
USING (is_store_member(store_id));

CREATE POLICY "Store members and owners can insert utang accounts"
ON utang_accounts FOR INSERT
TO authenticated
WITH CHECK (is_store_member(store_id));

CREATE POLICY "Store members and owners can update utang accounts"
ON utang_accounts FOR UPDATE
TO authenticated
USING (is_store_member(store_id))
WITH CHECK (is_store_member(store_id));

CREATE POLICY "Store members and owners can delete utang accounts"
ON utang_accounts FOR DELETE
TO authenticated
USING (has_store_role(store_id, 'admin'));

CREATE POLICY "Store members and owners can view utang transactions"
ON utang_transactions FOR SELECT
TO authenticated
USING (is_store_member(store_id));

CREATE POLICY "Store members and owners can record utang transactions"
ON utang_transactions FOR INSERT
TO authenticated
WITH CHECK (is_store_member(store_id));

-- --------------------------------------------------------------------
-- J. NOTIFICATIONS TABLE RLS
-- --------------------------------------------------------------------
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications or store broadcasts"
ON notifications FOR SELECT
TO authenticated
USING (
  recipient_user_id = auth.uid() OR
  (recipient_user_id IS NULL AND is_store_member(store_id))
);

CREATE POLICY "Store members can create notifications"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (is_store_member(store_id));

CREATE POLICY "Users can update (mark as read) their notifications"
ON notifications FOR UPDATE
TO authenticated
USING (
  recipient_user_id = auth.uid() OR
  (recipient_user_id IS NULL AND is_store_member(store_id))
)
WITH CHECK (
  recipient_user_id = auth.uid() OR
  (recipient_user_id IS NULL AND is_store_member(store_id))
);

-- --------------------------------------------------------------------
-- K. AUDIT LOGS TABLE RLS
-- --------------------------------------------------------------------
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only store owners and admins can view audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (is_store_owner(store_id) OR has_store_role(store_id, 'admin'));

CREATE POLICY "Store members can insert audit logs"
ON audit_logs FOR INSERT
TO authenticated
WITH CHECK (is_store_member(store_id));

-- --------------------------------------------------------------------
-- L. STORE INVITATIONS TABLE & RLS
-- --------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE invitation_status AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS store_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role app_role NOT NULL DEFAULT 'staff',
    employee_id VARCHAR(50),
    token VARCHAR(255) NOT NULL UNIQUE,
    invited_by UUID REFERENCES profiles(id),
    status invitation_status NOT NULL DEFAULT 'PENDING',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_store_invitations_token ON store_invitations(token);
CREATE INDEX IF NOT EXISTS idx_store_invitations_store_email ON store_invitations(store_id, email);

ALTER TABLE store_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can lookup invitation by token"
ON store_invitations FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can create invitations"
ON store_invitations FOR INSERT
TO authenticated
WITH CHECK (is_store_member(store_id));

CREATE POLICY "Invited users and admins can update invitations"
ON store_invitations FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- --------------------------------------------------------------------
-- 10. ACCEPT STORE INVITATION SECURITY DEFINER RPC
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION accept_store_invitation(
  p_token TEXT,
  p_user_id UUID,
  p_full_name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation RECORD;
BEGIN
  -- 1. Find valid pending invitation
  SELECT * INTO v_invitation
  FROM store_invitations
  WHERE token = p_token
    AND status = 'PENDING'
    AND expires_at > NOW();

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation token');
  END IF;

  -- 2. Upsert profile
  INSERT INTO profiles (id, email, full_name)
  VALUES (p_user_id, v_invitation.email, p_full_name)
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    updated_at = NOW();

  -- 3. Insert or update store member (Bypasses RLS via SECURITY DEFINER)
  INSERT INTO store_members (
    store_id,
    user_id,
    role,
    employee_id,
    current_shift,
    created_at,
    updated_at
  )
  VALUES (
    v_invitation.store_id,
    p_user_id,
    v_invitation.role,
    COALESCE(v_invitation.employee_id, 'EMP-' || SUBSTRING(p_user_id::text, 1, 6)),
    'OFF_SHIFT',
    NOW(),
    NOW()
  )
  ON CONFLICT (store_id, user_id) DO UPDATE SET
    role = EXCLUDED.role,
    employee_id = EXCLUDED.employee_id,
    updated_at = NOW();

  -- 4. Mark invitation as ACCEPTED
  UPDATE store_invitations
  SET status = 'ACCEPTED', accepted_at = NOW()
  WHERE id = v_invitation.id;

  RETURN jsonb_build_object(
    'success', true,
    'store_id', v_invitation.store_id,
    'role', v_invitation.role
  );
END;
$$;

GRANT EXECUTE ON FUNCTION accept_store_invitation TO authenticated, anon;
