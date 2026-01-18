-- Phase 2: Secure Academy, Users, and Studios
-- Date: 2026-01-07

-- 1. ACADEMY COURSES
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.academy_courses;

DROP POLICY IF EXISTS "View own studio courses" ON public.academy_courses;
CREATE POLICY "View own studio courses" ON public.academy_courses
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM public.studio_memberships WHERE studio_id = academy_courses.studio_id)
  );

DROP POLICY IF EXISTS "Manage own studio courses" ON public.academy_courses;
CREATE POLICY "Manage own studio courses" ON public.academy_courses
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM public.studio_memberships WHERE studio_id = academy_courses.studio_id AND role IN ('owner', 'manager'))
  );


-- 2. ACADEMY ENROLLMENTS
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.academy_enrollments;
-- Enrollments don't have a direct studio_id, they link to course_id.
-- We must join with academy_courses to check studio_id.

DROP POLICY IF EXISTS "View own studio enrollments" ON public.academy_enrollments;
CREATE POLICY "View own studio enrollments" ON public.academy_enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.academy_courses ac
      WHERE ac.id = academy_enrollments.course_id
      AND auth.uid() IN (SELECT user_id FROM public.studio_memberships WHERE studio_id = ac.studio_id)
    )
  );

DROP POLICY IF EXISTS "Manage own studio enrollments" ON public.academy_enrollments;
CREATE POLICY "Manage own studio enrollments" ON public.academy_enrollments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.academy_courses ac
      WHERE ac.id = academy_enrollments.course_id
      AND auth.uid() IN (SELECT user_id FROM public.studio_memberships WHERE studio_id = ac.studio_id AND role IN ('owner', 'manager'))
    )
  );


-- 3. ACADEMY ATTENDANCE (Daily & Logs)
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.academy_daily_attendance;

DROP POLICY IF EXISTS "View studio attendance" ON public.academy_daily_attendance;
CREATE POLICY "View studio attendance" ON public.academy_daily_attendance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.academy_courses ac
      WHERE ac.id = academy_daily_attendance.course_id
      AND auth.uid() IN (SELECT user_id FROM public.studio_memberships WHERE studio_id = ac.studio_id)
    )
  );

DROP POLICY IF EXISTS "Manage studio attendance" ON public.academy_daily_attendance;
CREATE POLICY "Manage studio attendance" ON public.academy_daily_attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.academy_courses ac
      WHERE ac.id = academy_daily_attendance.course_id
      AND auth.uid() IN (SELECT user_id FROM public.studio_memberships WHERE studio_id = ac.studio_id AND role IN ('owner', 'manager', 'artist')) -- Artists might take attendance
    )
  );


-- 4. MEMBERSHIPS & STUDIOS
-- Crucial: Ensure users can only see memberships related to their studios or themselves.

DROP POLICY IF EXISTS "Enable all for studios" ON public.studios;

DROP POLICY IF EXISTS "View own studios" ON public.studios;
CREATE POLICY "View own studios" ON public.studios
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM public.studio_memberships WHERE studio_id = studios.id)
  );

-- 5. USERS
-- Ensure users only see profiles of people in their studio (or themselves).
-- This prevents "Select Artist" dropdowns from showing artists from other studios.

DROP POLICY IF EXISTS "Enable all for users" ON public.users;

DROP POLICY IF EXISTS "View self and studio colleagues" ON public.users;
CREATE POLICY "View self and studio colleagues" ON public.users
  FOR SELECT USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 
      FROM public.studio_memberships my_mem
      JOIN public.studio_memberships their_mem ON my_mem.studio_id = their_mem.studio_id
      WHERE my_mem.user_id = auth.uid() AND their_mem.user_id = users.id
    )
  );

DROP POLICY IF EXISTS "Update self" ON public.users;
CREATE POLICY "Update self" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 6. COMMUNICATIONS
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.communications;
DROP POLICY IF EXISTS "View studio communications" ON public.communications;
CREATE POLICY "View studio communications" ON public.communications
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM public.studio_memberships WHERE studio_id = communications.studio_id)
  );

DROP POLICY IF EXISTS "Manage studio communications" ON public.communications;
CREATE POLICY "Manage studio communications" ON public.communications
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM public.studio_memberships WHERE studio_id = communications.studio_id)
  );
