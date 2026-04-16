-- ============================================================
-- FIX: Organization owners must be able to add themselves as members
-- ============================================================
-- The previous policy blocked the first member insertion because
-- it only allowed existing admins to add members.

DROP POLICY IF EXISTS "Org admins can add members" ON public.organization_members;
DROP POLICY IF EXISTS "Allow members creation" ON public.organization_members;

CREATE POLICY "Allow members creation"
ON public.organization_members
FOR INSERT
WITH CHECK (
  -- 1. Allow if the user is the owner of the organization (needed for first member)
  EXISTS (
    SELECT 1 FROM public.organizations
    WHERE organizations.id = organization_members.org_id
      AND organizations.owner_id = auth.uid()
  )
  OR
  -- 2. Allow if the user is already an admin of the organization
  public.is_org_admin(org_id)
);
