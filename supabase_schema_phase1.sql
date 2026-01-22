-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Linked to auth.users)
create table public.profiles (
  id uuid not null primary key,
  auth_user_id uuid references auth.users(id) on delete cascade unique,
  email text not null unique,
  full_name text,
  phone text,
  avatar_url text,
  status text default 'active' check (status in ('active', 'inactive', 'suspended')),
  metadata jsonb default '{}'::jsonb,
  last_login_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for profiles
create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_profiles_auth_user_id on public.profiles(auth_user_id);
create index if not exists idx_profiles_status on public.profiles(status);

-- 2. COMPANIES
create table public.companies (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  name_en text,
  legal_name text,
  email text,
  phone text,
  address text,
  city text,
  country text default 'Iraq',
  tax_number text unique,
  commercial_register text unique,
  registration_date date,
  logo_url text,
  base_currency_code text not null default 'IQD',
  fiscal_year_start_month integer default 1 check (fiscal_year_start_month between 1 and 12),
  settings jsonb default '{
    "invoice_prefix": "INV",
    "invoice_start_number": 1000,
    "default_tax_rate": 0,
    "default_terms": 30,
    "date_format": "DD/MM/YYYY",
    "decimal_places": 2,
    "currency_symbol": "د.ع",
    "auto_generate_vouchers": true
  }'::jsonb,
  is_active boolean default true,
  is_verified boolean default false,
  verified_at timestamp with time zone,
  verified_by uuid references public.profiles(id),
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for companies
create index if not exists idx_companies_tax_number on public.companies(tax_number);
create index if not exists idx_companies_commercial_register on public.companies(commercial_register);
create index if not exists idx_companies_is_active on public.companies(is_active);
create index if not exists idx_companies_base_currency_code on public.companies(base_currency_code);

-- 3. BRANCHES
create table public.branches (
  id uuid default uuid_generate_v4() primary key,
  company_id uuid not null references public.companies(id) on delete cascade,
  code text not null,
  name text not null,
  name_en text,
  manager_id uuid references public.profiles(id),
  address text,
  city text,
  phone text,
  email text,
  is_main boolean default false,
  is_active boolean default true,
  opening_date date default current_date,
  metadata jsonb default '{}'::jsonb,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(company_id, code)
);

-- Indexes for branches
create index if not exists idx_branches_company_id on public.branches(company_id);
create index if not exists idx_branches_is_main on public.branches(is_main);
create index if not exists idx_branches_manager_id on public.branches(manager_id);
create index if not exists idx_branches_company_code on public.branches(company_id, code);

-- 4. ROLES
create table public.roles (
  id uuid default uuid_generate_v4() primary key,
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  name_ar text,
  description text,
  permissions jsonb not null default '{
    "dashboard": ["view"],
    "sales": ["view", "create", "edit", "delete", "approve"],
    "purchases": ["view", "create", "edit", "delete", "approve"],
    "inventory": ["view", "create", "edit", "delete"],
    "accounting": ["view", "create", "edit", "delete", "post"],
    "reports": ["view"],
    "settings": ["view", "edit"]
  }'::jsonb,
  is_system_role boolean default false,
  is_active boolean default true,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(company_id, name)
);

-- Indexes for roles
create index if not exists idx_roles_company_id on public.roles(company_id);
create index if not exists idx_roles_is_system on public.roles(is_system_role);

-- System roles insert
insert into public.roles (company_id, name, name_ar, description, is_system_role, permissions) values
(null, 'Super Admin', 'المشرف العام', 'Full system access', true, '{"*": ["*"]}'),
(null, 'Company Owner', 'مالك الشركة', 'Full company access', true, '{"*": ["*"]}'),
(null, 'Accountant', 'محاسب', 'Accounting department access', true, '{"accounting": ["*"], "reports": ["view"], "dashboard": ["view"]}'),
(null, 'Sales Manager', 'مدير مبيعات', 'Sales department access', true, '{"sales": ["*"], "inventory": ["view"], "reports": ["view"], "dashboard": ["view"]}'),
(null, 'Warehouse Manager', 'مدير مستودع', 'Inventory management access', true, '{"inventory": ["*"], "purchases": ["view", "create"], "reports": ["view"], "dashboard": ["view"]}')
on conflict do nothing;

-- 5. USER_COMPANIES (Many-to-Many with audit trail)
create table public.user_companies (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  role_id uuid not null references public.roles(id) on delete restrict,
  is_owner boolean default false,
  is_default boolean default false,
  is_active boolean default true,
  access_level text default 'full' check (access_level in ('full', 'limited', 'view_only')),
  start_date date default current_date,
  end_date date,
  invited_by uuid references public.profiles(id),
  invited_at timestamp with time zone,
  accepted_at timestamp with time zone,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, company_id)
);

-- Indexes for user_companies
create index if not exists idx_user_companies_user_id on public.user_companies(user_id);
create index if not exists idx_user_companies_company_id on public.user_companies(company_id);
create index if not exists idx_user_companies_role_id on public.user_companies(role_id);
create index if not exists idx_user_companies_branch_id on public.user_companies(branch_id);
create index if not exists idx_user_companies_is_active on public.user_companies(is_active);
create index if not exists idx_user_companies_user_company on public.user_companies(user_id, company_id);

-- 🔒 ROW LEVEL SECURITY POLICIES

-- PROFILES: Users can only view and edit their own profile
alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = auth_user_id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = auth_user_id);

create policy "profiles_insert_auth" on public.profiles
  for insert with check (auth.uid() = auth_user_id);

-- COMPANIES: Users can only view companies they're members of
alter table public.companies enable row level security;

create policy "companies_select_member" on public.companies
  for select using (
    exists (
      select 1 from public.user_companies uc
      where uc.company_id = companies.id
        and uc.user_id = auth.uid()
        and uc.is_active = true
    )
  );

create policy "companies_insert_owner" on public.companies
  for insert with check (
    -- Only allow inserting if user exists in profiles
    exists (select 1 from public.profiles where auth_user_id = auth.uid())
    -- Company creator becomes owner automatically (handled by trigger)
  );

create policy "companies_update_owner" on public.companies
  for update using (
    exists (
      select 1 from public.user_companies uc
      where uc.company_id = companies.id
        and uc.user_id = auth.uid()
        and uc.is_owner = true
        and uc.is_active = true
    )
  );

-- BRANCHES: Users can view branches of their companies
alter table public.branches enable row level security;

create policy "branches_select_company_member" on public.branches
  for select using (
    exists (
      select 1 from public.user_companies uc
      where uc.company_id = branches.company_id
        and uc.user_id = auth.uid()
        and uc.is_active = true
    )
  );

create policy "branches_insert_company_admin" on public.branches
  for insert with check (
    exists (
      select 1 from public.user_companies uc
      where uc.company_id = branches.company_id
        and uc.user_id = auth.uid()
        and (uc.is_owner = true or uc.role_id in (
          select id from public.roles 
          where company_id = branches.company_id 
          and permissions->'settings' @> '["edit"]'
        ))
        and uc.is_active = true
    )
  );

create policy "branches_update_company_admin" on public.branches
  for update using (
    exists (
      select 1 from public.user_companies uc
      where uc.company_id = branches.company_id
        and uc.user_id = auth.uid()
        and (uc.is_owner = true or uc.role_id in (
          select id from public.roles 
          where company_id = branches.company_id 
          and permissions->'settings' @> '["edit"]'
        ))
        and uc.is_active = true
    )
  );

-- ROLES: Users can view roles of their companies
alter table public.roles enable row level security;

create policy "roles_select_company_member" on public.roles
  for select using (
    company_id is null -- System roles are public
    or exists (
      select 1 from public.user_companies uc
      where uc.company_id = roles.company_id
        and uc.user_id = auth.uid()
        and uc.is_active = true
    )
  );

create policy "roles_insert_company_owner" on public.roles
  for insert with check (
    company_id is not null
    and exists (
      select 1 from public.user_companies uc
      where uc.company_id = roles.company_id
        and uc.user_id = auth.uid()
        and uc.is_owner = true
        and uc.is_active = true
    )
  );

create policy "roles_update_company_owner" on public.roles
  for update using (
    company_id is not null
    and exists (
      select 1 from public.user_companies uc
      where uc.company_id = roles.company_id
        and uc.user_id = auth.uid()
        and uc.is_owner = true
        and uc.is_active = true
    )
  );

-- USER_COMPANIES: Strict access control
alter table public.user_companies enable row level security;

create policy "user_companies_select_own" on public.user_companies
  for select using (
    user_id = auth.uid() -- Can see own memberships
    or exists ( -- Company owners can see all members
      select 1 from public.user_companies uc2
      where uc2.company_id = user_companies.company_id
        and uc2.user_id = auth.uid()
        and uc2.is_owner = true
        and uc2.is_active = true
    )
  );

create policy "user_companies_insert_owner" on public.user_companies
  for insert with check (
    -- Only company owners can add members
    exists (
      select 1 from public.user_companies uc
      where uc.company_id = user_companies.company_id
        and uc.user_id = auth.uid()
        and uc.is_owner = true
        and uc.is_active = true
    )
    -- Cannot add duplicate membership
    and not exists (
      select 1 from public.user_companies uc2
      where uc2.user_id = user_companies.user_id
        and uc2.company_id = user_companies.company_id
        and uc2.is_active = true
    )
  );

create policy "user_companies_update_owner" on public.user_companies
  for update using (
    -- Only company owners can update memberships
    exists (
      select 1 from public.user_companies uc
      where uc.company_id = user_companies.company_id
        and uc.user_id = auth.uid()
        and uc.is_owner = true
        and uc.is_active = true
    )
  );

-- ⚡ TRIGGERS AND FUNCTIONS

-- Automatically set created_by for companies
create or replace function public.set_company_creator()
returns trigger as $$
begin
  new.created_by := (select id from public.profiles where auth_user_id = auth.uid()); -- Modifying to get profile ID
  return new;
end;
$$ language plpgsql security definer;

create trigger trigger_set_company_creator
  before insert on public.companies
  for each row execute function public.set_company_creator();

-- Automatically make company creator an owner
create or replace function public.make_company_owner()
returns trigger as $$
begin
  insert into public.user_companies (
    user_id, company_id, role_id, is_owner, is_default, is_active
  )
  values (
    new.created_by,
    new.id,
    (select id from public.roles where name = 'Company Owner' and company_id is null limit 1),
    true,
    true,
    true
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger trigger_make_company_owner
  after insert on public.companies
  for each row execute function public.make_company_owner();

-- Handle new user registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id, auth_user_id, email, full_name, 
    created_at, updated_at
  )
  values (
    uuid_generate_v4(),
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    now(),
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

create trigger update_companies_updated_at
  before update on public.companies
  for each row execute function public.update_updated_at_column();

create trigger update_branches_updated_at
  before update on public.branches
  for each row execute function public.update_updated_at_column();

create trigger update_roles_updated_at
  before update on public.roles
  for each row execute function public.update_updated_at_column();

create trigger update_user_companies_updated_at
  before update on public.user_companies
  for each row execute function public.update_updated_at_column();

-- 📊 VIEWS FOR EASY QUERYING

-- User profile with company info
create or replace view public.user_profile_with_companies as
select 
  p.*,
  jsonb_agg(
    jsonb_build_object(
      'company', c,
      'membership', uc,
      'role', r,
      'branch', b
    )
  ) filter (where uc.id is not null) as companies
from public.profiles p
left join public.user_companies uc on p.id = uc.user_id and uc.is_active = true
left join public.companies c on uc.company_id = c.id
left join public.roles r on uc.role_id = r.id
left join public.branches b on uc.branch_id = b.id
group by p.id;

-- Company with members
create or replace view public.company_with_members as
select 
  c.*,
  jsonb_agg(
    jsonb_build_object(
      'user', jsonb_build_object(
        'id', p.id,
        'auth_user_id', p.auth_user_id,
        'email', p.email,
        'full_name', p.full_name,
        'avatar_url', p.avatar_url
      ),
      'membership', jsonb_build_object(
        'id', uc.id,
        'is_owner', uc.is_owner,
        'is_default', uc.is_default,
        'access_level', uc.access_level,
        'start_date', uc.start_date
      ),
      'role', r,
      'branch', b
    )
  ) filter (where uc.id is not null) as members
from public.companies c
left join public.user_companies uc on c.id = uc.company_id and uc.is_active = true
left join public.profiles p on uc.user_id = p.id
left join public.roles r on uc.role_id = r.id
left join public.branches b on uc.branch_id = b.id
group by c.id;

-- 🔧 HELPER FUNCTIONS

-- Check if user is company owner
create or replace function public.is_company_owner(
  user_uuid uuid,
  company_uuid uuid
)
returns boolean as $$
begin
  return exists (
    select 1 from public.user_companies uc
    where uc.user_id = user_uuid
      and uc.company_id = company_uuid
      and uc.is_owner = true
      and uc.is_active = true
  );
end;
$$ language plpgsql security definer;

-- Get user's companies
create or replace function public.get_user_companies(user_uuid uuid)
returns table(
  company_id uuid,
  company_name text,
  is_owner boolean,
  role_name text,
  branch_name text
) as $$
begin
  return query
  select 
    c.id as company_id,
    c.name as company_name,
    uc.is_owner,
    r.name as role_name,
    b.name as branch_name
  from public.user_companies uc
  join public.companies c on uc.company_id = c.id
  left join public.roles r on uc.role_id = r.id
  left join public.branches b on uc.branch_id = b.id
  where uc.user_id = user_uuid
    and uc.is_active = true
    and c.is_active = true
  order by uc.is_default desc, c.created_at desc;
end;
$$ language plpgsql security definer;

-- Set default company for user
create or replace function public.set_default_company(
  user_uuid uuid,
  company_uuid uuid
)
returns void as $$
begin
  -- Reset all defaults for user
  update public.user_companies
  set is_default = false
  where user_id = user_uuid;
  
  -- Set new default
  update public.user_companies
  set is_default = true
  where user_id = user_uuid
    and company_id = company_uuid;
end;
$$ language plpgsql security definer;
