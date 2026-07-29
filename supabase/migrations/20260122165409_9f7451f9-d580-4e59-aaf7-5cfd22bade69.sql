-- Create role enum for user types
CREATE TYPE public.app_role AS ENUM ('driver', 'parking_owner', 'admin');

-- Create booking status enum
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'active', 'completed', 'cancelled');

-- Create payment status enum
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- =====================
-- USER ROLES TABLE (separate from profiles per security requirements)
-- =====================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =====================
-- PROFILES TABLE
-- =====================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =====================
-- PARKING LOCATIONS TABLE
-- =====================
CREATE TABLE public.parking_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'USA',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  description TEXT,
  amenities TEXT[] DEFAULT '{}',
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.parking_locations ENABLE ROW LEVEL SECURITY;

-- =====================
-- PARKING SLOTS TABLE
-- =====================
CREATE TABLE public.parking_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES public.parking_locations(id) ON DELETE CASCADE NOT NULL,
  slot_number TEXT NOT NULL,
  slot_type TEXT DEFAULT 'standard', -- standard, compact, handicap, ev
  hourly_rate DECIMAL(10, 2) NOT NULL,
  daily_rate DECIMAL(10, 2),
  is_available BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (location_id, slot_number)
);

ALTER TABLE public.parking_slots ENABLE ROW LEVEL SECURITY;

-- =====================
-- BOOKINGS TABLE
-- =====================
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  slot_id UUID REFERENCES public.parking_slots(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  vehicle_type TEXT,
  vehicle_plate TEXT,
  total_amount DECIMAL(10, 2) NOT NULL,
  status booking_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- =====================
-- PAYMENTS TABLE
-- =====================
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT,
  stripe_payment_id TEXT,
  status payment_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- =====================
-- QR CODES TABLE
-- =====================
CREATE TABLE public.qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- =====================
-- SECURITY DEFINER FUNCTIONS
-- =====================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Check if user owns a parking location
CREATE OR REPLACE FUNCTION public.is_location_owner(_user_id UUID, _location_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.parking_locations
    WHERE id = _location_id AND owner_id = _user_id
  )
$$;

-- Check if user owns the slot (via location ownership)
CREATE OR REPLACE FUNCTION public.is_slot_owner(_user_id UUID, _slot_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.parking_slots ps
    JOIN public.parking_locations pl ON ps.location_id = pl.id
    WHERE ps.id = _slot_id AND pl.owner_id = _user_id
  )
$$;

-- Check if booking belongs to a slot owned by user
CREATE OR REPLACE FUNCTION public.is_booking_for_owned_slot(_user_id UUID, _booking_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.parking_slots ps ON b.slot_id = ps.id
    JOIN public.parking_locations pl ON ps.location_id = pl.id
    WHERE b.id = _booking_id AND pl.owner_id = _user_id
  )
$$;

-- =====================
-- RLS POLICIES: user_roles
-- =====================
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- RLS POLICIES: profiles
-- =====================
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- RLS POLICIES: parking_locations
-- =====================
CREATE POLICY "Anyone can view active parking locations"
  ON public.parking_locations FOR SELECT
  USING (is_active = true);

CREATE POLICY "Owners can view their own locations"
  ON public.parking_locations FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Parking owners can create locations"
  ON public.parking_locations FOR INSERT
  WITH CHECK (owner_id = auth.uid() AND public.has_role(auth.uid(), 'parking_owner'));

CREATE POLICY "Owners can update their own locations"
  ON public.parking_locations FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their own locations"
  ON public.parking_locations FOR DELETE
  USING (owner_id = auth.uid());

CREATE POLICY "Admins can manage all locations"
  ON public.parking_locations FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- RLS POLICIES: parking_slots
-- =====================
CREATE POLICY "Anyone can view active slots"
  ON public.parking_slots FOR SELECT
  USING (is_active = true);

CREATE POLICY "Owners can view their slots"
  ON public.parking_slots FOR SELECT
  USING (public.is_slot_owner(auth.uid(), id));

CREATE POLICY "Owners can create slots for their locations"
  ON public.parking_slots FOR INSERT
  WITH CHECK (public.is_location_owner(auth.uid(), location_id));

CREATE POLICY "Owners can update their slots"
  ON public.parking_slots FOR UPDATE
  USING (public.is_slot_owner(auth.uid(), id));

CREATE POLICY "Owners can delete their slots"
  ON public.parking_slots FOR DELETE
  USING (public.is_slot_owner(auth.uid(), id));

CREATE POLICY "Admins can manage all slots"
  ON public.parking_slots FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- RLS POLICIES: bookings
-- =====================
CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Slot owners can view bookings for their slots"
  ON public.bookings FOR SELECT
  USING (public.is_booking_for_owned_slot(auth.uid(), id));

CREATE POLICY "Authenticated users can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own bookings"
  ON public.bookings FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Slot owners can update bookings for their slots"
  ON public.bookings FOR UPDATE
  USING (public.is_booking_for_owned_slot(auth.uid(), id));

CREATE POLICY "Users can cancel their own bookings"
  ON public.bookings FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all bookings"
  ON public.bookings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- RLS POLICIES: payments
-- =====================
CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = booking_id AND b.user_id = auth.uid()
  ));

CREATE POLICY "Slot owners can view payments for their bookings"
  ON public.payments FOR SELECT
  USING (public.is_booking_for_owned_slot(auth.uid(), booking_id));

CREATE POLICY "Users can create payments for their bookings"
  ON public.payments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = booking_id AND b.user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all payments"
  ON public.payments FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- RLS POLICIES: qr_codes
-- =====================
CREATE POLICY "Users can view QR codes for their bookings"
  ON public.qr_codes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = booking_id AND b.user_id = auth.uid()
  ));

CREATE POLICY "Slot owners can view QR codes for their bookings"
  ON public.qr_codes FOR SELECT
  USING (public.is_booking_for_owned_slot(auth.uid(), booking_id));

CREATE POLICY "Admins can manage all QR codes"
  ON public.qr_codes FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- TRIGGERS
-- =====================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_parking_locations_updated_at
  BEFORE UPDATE ON public.parking_locations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_parking_slots_updated_at
  BEFORE UPDATE ON public.parking_slots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-generate QR code on confirmed booking
CREATE OR REPLACE FUNCTION public.generate_booking_qr()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
    INSERT INTO public.qr_codes (booking_id, code, expires_at)
    VALUES (
      NEW.id,
      'PK-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8)),
      NEW.end_time
    )
    ON CONFLICT (booking_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_booking_confirmed
  AFTER UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.generate_booking_qr();

-- Create indexes for performance
CREATE INDEX idx_parking_locations_owner ON public.parking_locations(owner_id);
CREATE INDEX idx_parking_locations_city ON public.parking_locations(city);
CREATE INDEX idx_parking_locations_coords ON public.parking_locations(latitude, longitude);
CREATE INDEX idx_parking_slots_location ON public.parking_slots(location_id);
CREATE INDEX idx_parking_slots_available ON public.parking_slots(is_available, is_active);
CREATE INDEX idx_bookings_user ON public.bookings(user_id);
CREATE INDEX idx_bookings_slot ON public.bookings(slot_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_dates ON public.bookings(start_time, end_time);
CREATE INDEX idx_payments_booking ON public.payments(booking_id);
CREATE INDEX idx_qr_codes_booking ON public.qr_codes(booking_id);
CREATE INDEX idx_qr_codes_code ON public.qr_codes(code);