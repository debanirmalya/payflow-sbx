
GRANT SELECT ON public.users TO authenticated;
GRANT INSERT ON public.users TO authenticated;
GRANT UPDATE ON public.users TO authenticated;

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to view all users
CREATE POLICY "Anyone can view users"
ON public.users
FOR SELECT
TO public
USING (true);

-- Policy to allow only admin and accounts users to modify users
CREATE POLICY "Only admin and accounts can modify users"
ON public.users
FOR ALL
TO authenticated
USING (
  CASE 
    -- Allow if the user is modifying their own row (for initial creation)
    WHEN auth.uid() = id THEN true
    -- Otherwise check for admin/accounts role
    ELSE (auth.jwt() ->> 'role')::text IN ('admin', 'accounts')
  END
)
WITH CHECK (
  CASE 
    -- Allow if the user is modifying their own row (for initial creation)
    WHEN auth.uid() = id THEN true
    -- Otherwise check for admin/accounts role
    ELSE (auth.jwt() ->> 'role')::text IN ('admin', 'accounts')
  END
);



ALTER TABLE payments
ADD COLUMN quantity_checked_by UUID REFERENCES users(id),
ADD COLUMN quality_checked_by UUID REFERENCES users(id),
ADD COLUMN purchase_owner UUID REFERENCES users(id),
ADD COLUMN price_check_guaranteed_by UUID REFERENCES users(id);

-- Add indexes for better query performance
CREATE INDEX idx_payments_quantity_checked_by ON payments(quantity_checked_by);
CREATE INDEX idx_payments_quality_checked_by ON payments(quality_checked_by);
CREATE INDEX idx_payments_purchase_owner ON payments(purchase_owner);
CREATE INDEX idx_payments_price_check_guaranteed_by ON payments(price_check_guaranteed_by);

-- Add comments to document the purpose of each column
COMMENT ON COLUMN payments.quantity_checked_by IS 'User who verified the quantity of items';
COMMENT ON COLUMN payments.quality_checked_by IS 'User who verified the quality of items';
COMMENT ON COLUMN payments.purchase_owner IS 'User who owns the purchase process';
COMMENT ON COLUMN payments.price_check_guaranteed_by IS 'User who guaranteed the price check (required)';


-- Create categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create subcategories table (independent from categories)
CREATE TABLE subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_subcategories_name ON subcategories(name);

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for both tables
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subcategories_updated_at
    BEFORE UPDATE ON subcategories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- Add category and subcategory columns to payments table
ALTER TABLE payments
ADD COLUMN category VARCHAR(255),
ADD COLUMN subcategory VARCHAR(255);




ALTER TABLE public.users 
ADD COLUMN status text NOT NULL DEFAULT 'active' 
CHECK (status IN ('active', 'inactive'));



-- Add updated_at column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Create or replace the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;

-- Create the trigger
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column(); 


ALTER TABLE payments 
ADD COLUMN accounts_verification_status VARCHAR(20) NOT NULL DEFAULT 'pending' 
CHECK (accounts_verification_status IN ('pending', 'verified'));