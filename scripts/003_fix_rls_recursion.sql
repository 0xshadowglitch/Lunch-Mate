-- ============================================================
-- FIX: Infinite recursion in organization_members RLS policy
-- ============================================================
-- The problem: RLS policies on organization_members were querying
-- the same table to check membership, causing infinite recursion.
--
-- The solution: Use a SECURITY DEFINER function that bypasses RLS
-- when checking if the current user is a member of an org.
-- ============================================================

-- Step 1: Drop all existing policies on organization_members
DROP POLICY IF EXISTS "Members can view their organization" ON organization_members;
DROP POLICY IF EXISTS "Members can view org members" ON organization_members;
DROP POLICY IF EXISTS "Admins can manage members" ON organization_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON organization_members;
DROP POLICY IF EXISTS "Allow read for org members" ON organization_members;
DROP POLICY IF EXISTS "Allow insert for org owner" ON organization_members;
DROP POLICY IF EXISTS "Allow admin to manage members" ON organization_members;
-- Drop any other policies that may exist (add names here if needed)

-- Step 2: Create a SECURITY DEFINER helper function
-- This function runs as the DB superuser, bypassing RLS,
-- so it won't trigger the recursive policy.
CREATE OR REPLACE FUNCTION public.is_org_member(org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE organization_members.org_id = $1
      AND organization_members.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE organization_members.org_id = $1
      AND organization_members.user_id = auth.uid()
      AND organization_members.role = 'admin'
  );
$$;

-- Step 3: Re-create safe, non-recursive RLS policies

-- Allow users to see their own membership rows
CREATE POLICY "Users can view their own memberships"
ON public.organization_members
FOR SELECT
USING (user_id = auth.uid());

-- Allow users to see all members of orgs they belong to
-- Uses the helper function (SECURITY DEFINER) to avoid recursion
CREATE POLICY "Org members can view all members in their org"
ON public.organization_members
FOR SELECT
USING (public.is_org_member(org_id));

-- Allow org admins to insert new members
CREATE POLICY "Org admins can add members"
ON public.organization_members
FOR INSERT
WITH CHECK (public.is_org_admin(org_id));

-- Allow org admins to update member roles
CREATE POLICY "Org admins can update members"
ON public.organization_members
FOR UPDATE
USING (public.is_org_admin(org_id));

-- Allow org admins to remove members
CREATE POLICY "Org admins can delete members"
ON public.organization_members
FOR DELETE
USING (public.is_org_admin(org_id));

-- Also fix organizations table policies if they reference organization_members
DROP POLICY IF EXISTS "Members can view their organization" ON organizations;
DROP POLICY IF EXISTS "Users can view their orgs" ON organizations;

CREATE POLICY "Users can view orgs they belong to"
ON public.organizations
FOR SELECT
USING (public.is_org_member(id));

CREATE POLICY "Users can create organizations"
ON public.organizations
FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Admins can update their org"
ON public.organizations
FOR UPDATE
USING (public.is_org_admin(id));
