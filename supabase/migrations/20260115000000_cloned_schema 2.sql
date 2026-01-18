--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY "public"."waitlist" DROP CONSTRAINT IF EXISTS "waitlist_studio_id_fkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."users" DROP CONSTRAINT IF EXISTS "users_studio_id_fkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."users" DROP CONSTRAINT IF EXISTS "users_id_fkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."user_integrations" DROP CONSTRAINT IF EXISTS "user_integrations_user_id_fkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."transactions" DROP CONSTRAINT IF EXISTS "transactions_studio_id_fkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."transactions" DROP CONSTRAINT IF EXISTS "transactions_artist_id_fkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."transactions" DROP CONSTRAINT IF EXISTS "transactions_appointment_id_fkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."studios" DROP CONSTRAINT IF EXISTS "studios_created_by_fkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."studio_memberships" DROP CONSTRAINT IF EXISTS "studio_memberships_user_id_fkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."studio_memberships" DROP CONSTRAINT IF EXISTS "studio_memberships_studio_id_fkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."studio_invitations" DROP CONSTRAINT IF EXISTS "studio_invitations_studio_id_fkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."studio_invitations" DROP CONSTRAINT IF EXISTS "studio_invitations_invited_by_fkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."presence_logs" DROP CONSTRAINT IF EXISTS "presence_logs_studio_id_fkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."presence_logs" DROP CONSTRAINT IF EXISTS "presence_logs_created_by_fkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."presence_logs" DROP CONSTRAINT IF EXISTS "presence_logs_artist_id_fkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."courses" DROP CONSTRAINT IF EXISTS "courses_studio_id_fkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."communication_replies" DROP CONSTRAINT IF EXISTS "communication_replies_communication_id_fkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."clients" DROP CONSTRAINT IF EXISTS "clients_studio_id_fkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."client_consents" DROP CONSTRAINT IF EXISTS "client_consents_template_id_fkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."client_consents" DROP CONSTRAINT IF EXISTS "client_consents_client_id_fkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."artist_contracts" DROP CONSTRAINT IF EXISTS "artist_contracts_studio_id_fkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."artist_contracts" DROP CONSTRAINT IF EXISTS "artist_contracts_artist_id_fkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."appointments" DROP CONSTRAINT IF EXISTS "appointments_studio_id_fkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."appointments" DROP CONSTRAINT IF EXISTS "appointments_client_id_fkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."appointments" DROP CONSTRAINT IF EXISTS "appointments_artist_id_fkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."academy_enrollments" DROP CONSTRAINT IF EXISTS "academy_enrollments_course_id_fkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."academy_daily_attendance" DROP CONSTRAINT IF EXISTS "academy_daily_attendance_course_id_fkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."academy_attendance_logs" DROP CONSTRAINT IF EXISTS "academy_attendance_logs_course_id_fkey" CASCADE;
DROP INDEX IF EXISTS "public"."idx_user_integrations_user_id";
DROP INDEX IF EXISTS "public"."idx_transactions_artist_id";
DROP INDEX IF EXISTS "public"."idx_transactions_appointment_id";
DROP INDEX IF EXISTS "public"."idx_clients_studio_email";
DROP INDEX IF EXISTS "public"."idx_appointments_google_event_id";
ALTER TABLE IF EXISTS ONLY "public"."waitlist" DROP CONSTRAINT IF EXISTS "waitlist_pkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."waitlist_entries" DROP CONSTRAINT IF EXISTS "waitlist_entries_pkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."users" DROP CONSTRAINT IF EXISTS "users_pkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."user_integrations" DROP CONSTRAINT IF EXISTS "user_integrations_user_id_provider_key" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."user_integrations" DROP CONSTRAINT IF EXISTS "user_integrations_pkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."transactions" DROP CONSTRAINT IF EXISTS "transactions_pkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."studios" DROP CONSTRAINT IF EXISTS "studios_pkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."studio_memberships" DROP CONSTRAINT IF EXISTS "studio_memberships_studio_id_user_id_key" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."studio_memberships" DROP CONSTRAINT IF EXISTS "studio_memberships_pkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."studio_invitations" DROP CONSTRAINT IF EXISTS "studio_invitations_token_key" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."studio_invitations" DROP CONSTRAINT IF EXISTS "studio_invitations_pkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."recurring_expenses" DROP CONSTRAINT IF EXISTS "recurring_expenses_pkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."presence_logs" DROP CONSTRAINT IF EXISTS "presence_logs_pkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."courses" DROP CONSTRAINT IF EXISTS "courses_pkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."consent_templates" DROP CONSTRAINT IF EXISTS "consent_templates_pkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."communications" DROP CONSTRAINT IF EXISTS "communications_pkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."communication_replies" DROP CONSTRAINT IF EXISTS "communication_replies_pkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."clients" DROP CONSTRAINT IF EXISTS "clients_pkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."client_consents" DROP CONSTRAINT IF EXISTS "client_consents_pkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."artist_contracts" DROP CONSTRAINT IF EXISTS "artist_contracts_pkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."appointments" DROP CONSTRAINT IF EXISTS "appointments_pkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."academy_enrollments" DROP CONSTRAINT IF EXISTS "academy_enrollments_pkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."academy_daily_attendance" DROP CONSTRAINT IF EXISTS "academy_daily_attendance_pkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."academy_courses" DROP CONSTRAINT IF EXISTS "academy_courses_pkey" CASCADE;
ALTER TABLE IF EXISTS ONLY "public"."academy_attendance_logs" DROP CONSTRAINT IF EXISTS "academy_attendance_logs_pkey" CASCADE;
DROP TABLE IF EXISTS "public"."waitlist_entries" CASCADE;
DROP TABLE IF EXISTS "public"."waitlist" CASCADE;
DROP TABLE IF EXISTS "public"."users" CASCADE;
DROP TABLE IF EXISTS "public"."user_integrations" CASCADE;
DROP TABLE IF EXISTS "public"."transactions" CASCADE;
DROP TABLE IF EXISTS "public"."studios" CASCADE;
DROP TABLE IF EXISTS "public"."studio_memberships" CASCADE;
DROP TABLE IF EXISTS "public"."studio_invitations" CASCADE;
DROP TABLE IF EXISTS "public"."recurring_expenses" CASCADE;
DROP TABLE IF EXISTS "public"."presence_logs" CASCADE;
DROP TABLE IF EXISTS "public"."courses" CASCADE;
DROP TABLE IF EXISTS "public"."consent_templates" CASCADE;
DROP TABLE IF EXISTS "public"."communications" CASCADE;
DROP TABLE IF EXISTS "public"."communication_replies" CASCADE;
DROP TABLE IF EXISTS "public"."clients" CASCADE;
DROP TABLE IF EXISTS "public"."client_consents" CASCADE;
DROP TABLE IF EXISTS "public"."artist_contracts" CASCADE;
DROP TABLE IF EXISTS "public"."appointments" CASCADE;
DROP TABLE IF EXISTS "public"."academy_enrollments" CASCADE;
DROP TABLE IF EXISTS "public"."academy_daily_attendance" CASCADE;
DROP TABLE IF EXISTS "public"."academy_courses" CASCADE;
DROP TABLE IF EXISTS "public"."academy_attendance_logs" CASCADE;
DROP FUNCTION IF EXISTS "public"."recover_orphaned_owner"();
DROP FUNCTION IF EXISTS "public"."handle_new_user"();
DROP FUNCTION IF EXISTS "public"."get_my_pending_invitations"();
DROP FUNCTION IF EXISTS "public"."get_invitation_by_token_v2"("token_input" "text");
DROP FUNCTION IF EXISTS "public"."get_client_by_contact_v2"("p_email" "text", "p_phone" "text", "p_studio_id" "uuid");
DROP FUNCTION IF EXISTS "public"."get_client_by_contact"("p_email" "text", "p_phone" "text", "p_studio_id" "uuid");
DROP FUNCTION IF EXISTS "public"."delete_team_member"("target_user_id" "uuid", "studio_id_input" "uuid");
DROP FUNCTION IF EXISTS "public"."create_waitlist_entry_public"("p_studio_id" "uuid", "p_client_id" "uuid", "p_client_name" "text", "p_email" "text", "p_phone" "text", "p_styles" "text"[], "p_interest_type" "text", "p_description" "text", "p_artist_pref_id" "uuid", "p_images" "text"[]);
DROP FUNCTION IF EXISTS "public"."create_client_public"("p_studio_id" "uuid", "p_full_name" "text", "p_email" "text", "p_phone" "text", "p_fiscal_code" "text", "p_address" "text", "p_city" "text", "p_zip_code" "text", "p_preferred_styles" "text"[], "p_whatsapp_broadcast_opt_in" boolean);
DROP TYPE IF EXISTS "public"."user_role";
DROP SCHEMA IF EXISTS "public";
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA "public";


--
-- Name: SCHEMA "public"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA "public" IS 'standard public schema';


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."user_role" AS ENUM (
    'owner',
    'manager',
    'artist',
    'student'
);


--
-- Name: TYPE "user_role"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TYPE "public"."user_role" IS 'User roles: owner, manager, artist, student (all lowercase)';


--
-- Name: create_client_public("uuid", "text", "text", "text", "text", "text", "text", "text", "text"[], boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."create_client_public"("p_studio_id" "uuid", "p_full_name" "text", "p_email" "text", "p_phone" "text", "p_fiscal_code" "text", "p_address" "text", "p_city" "text", "p_zip_code" "text", "p_preferred_styles" "text"[], "p_whatsapp_broadcast_opt_in" boolean) RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_client_id uuid;
  v_result json;
BEGIN
  -- Intentional UPSERT
  -- We update the 'updated_at' (or just email to itself) to ensure we get the ID back
  INSERT INTO public.clients (
    studio_id, full_name, email, phone, fiscal_code, 
    address, city, zip_code, preferred_styles, whatsapp_broadcast_opt_in
  )
  VALUES (
    p_studio_id, p_full_name, p_email, p_phone, p_fiscal_code,
    p_address, p_city, p_zip_code, p_preferred_styles, p_whatsapp_broadcast_opt_in
  )
  ON CONFLICT (studio_id, email) 
  DO UPDATE SET 
    email = EXCLUDED.email -- Dummy update to ensure RETURNING works
  RETURNING id INTO v_client_id;
  
  v_result := json_build_object('id', v_client_id, 'full_name', p_full_name, 'email', p_email);
  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  -- If the ON CONFLICT failed (e.g. constraint mismatch), fallback to pure insert
  -- and let the caller handle errors, or logging it.
  -- But we try to be helpful:
  RAISE WARNING 'Upsert failed, trying fallback select. Error: %', SQLERRM;
  
  SELECT id INTO v_client_id FROM public.clients 
  WHERE studio_id = p_studio_id AND LOWER(email) = LOWER(p_email) LIMIT 1;
  
  IF v_client_id IS NOT NULL THEN
     v_result := json_build_object('id', v_client_id, 'full_name', p_full_name, 'email', p_email);
     RETURN v_result;
  END IF;

  RAISE; -- Re-throw original error if fallback failed
END;
$$;


--
-- Name: create_waitlist_entry_public("uuid", "uuid", "text", "text", "text", "text"[], "text", "text", "uuid", "text"[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."create_waitlist_entry_public"("p_studio_id" "uuid", "p_client_id" "uuid", "p_client_name" "text", "p_email" "text", "p_phone" "text", "p_styles" "text"[], "p_interest_type" "text", "p_description" "text", "p_artist_pref_id" "uuid", "p_images" "text"[]) RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_entry_id uuid;
  v_result json;
BEGIN
  INSERT INTO public.waitlist_entries (
    studio_id, client_id, client_name, email, phone, 
    styles, interest_type, description, artist_pref_id, images
  )
  VALUES (
    p_studio_id, p_client_id, p_client_name, p_email, p_phone,
    p_styles, p_interest_type, p_description, p_artist_pref_id, p_images
  )
  RETURNING id INTO v_entry_id;

  v_result := json_build_object('id', v_entry_id);
  RETURN v_result;
END;
$$;


--
-- Name: delete_team_member("uuid", "uuid"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."delete_team_member"("target_user_id" "uuid", "studio_id_input" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    caller_role TEXT;
    target_membership_exists BOOLEAN;
BEGIN
    -- 1. Check if the caller is an OWNER of the specified studio
    SELECT role INTO caller_role
    FROM public.studio_memberships
    WHERE studio_id = studio_id_input
    AND user_id = auth.uid();

    IF caller_role IS NULL OR caller_role != 'owner' THEN
        RAISE EXCEPTION 'Access Denied: You must be an Owner to delete members.';
    END IF;

    -- 2. Check if the target user is actually a member of this studio
    -- (This prevents deleting random users from other studios)
    SELECT EXISTS (
        SELECT 1 
        FROM public.studio_memberships 
        WHERE studio_id = studio_id_input 
        AND user_id = target_user_id
    ) INTO target_membership_exists;

    IF NOT target_membership_exists THEN
        RAISE EXCEPTION 'Target user is not a member of this studio.';
    END IF;

    -- 3. Perform Deletion
    -- Delete from studio_memberships first (Explicit, though cascade might handle it)
    DELETE FROM public.studio_memberships 
    WHERE studio_id = studio_id_input 
    AND user_id = target_user_id;
    
    -- Delete from auth.users (This cascades to public.users if generic FK exists, 
    -- but we should ensure public.users is cleaned up too)
    -- Note: This requires the function to be SECURITY DEFINER to access auth.users
    DELETE FROM auth.users WHERE id = target_user_id;
    
    -- If public.users still exists (e.g. no cascade), delete it manually
    DELETE FROM public.users WHERE id = target_user_id;

END;
$$;


--
-- Name: get_client_by_contact("text", "text", "uuid"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."get_client_by_contact"("p_email" "text", "p_phone" "text", "p_studio_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_client_id uuid;
BEGIN
  SELECT id INTO v_client_id
  FROM public.clients 
  WHERE studio_id = p_studio_id
    AND (
      LOWER(email) = LOWER(p_email)
      OR 
      phone = p_phone
    )
  LIMIT 1;
  
  RETURN v_client_id;
END;
$$;


--
-- Name: get_client_by_contact_v2("text", "text", "uuid"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."get_client_by_contact_v2"("p_email" "text", "p_phone" "text", "p_studio_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_client_id uuid;
BEGIN
  -- Simple lookup
  SELECT id INTO v_client_id
  FROM public.clients 
  WHERE studio_id = p_studio_id
    AND (
      LOWER(email) = LOWER(p_email)
      OR 
      phone = p_phone
    )
  LIMIT 1;
  
  RETURN v_client_id;
END;
$$;


--
-- Name: get_invitation_by_token_v2("text"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."get_invitation_by_token_v2"("token_input" "text") RETURNS TABLE("id" "uuid", "studio_id" "uuid", "email" "text", "role" "text", "token" "text", "invited_by" "uuid", "created_at" timestamp with time zone, "used_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.studio_id,
        i.email,
        i.role::TEXT,
        i.token::TEXT, -- Explicitly cast to TEXT to match return type
        i.invited_by,
        i.created_at,
        i.used_at
    FROM 
        public.studio_invitations i
    WHERE 
        -- Compare as text to be safe
        i.token::TEXT = token_input 
        AND i.used_at IS NULL;
END;
$$;


--
-- Name: get_my_pending_invitations(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."get_my_pending_invitations"() RETURNS TABLE("token" "text", "studio_name" "text", "role" "text", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    user_email TEXT;
BEGIN
    -- Get current user's email
    SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
    
    IF user_email IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT 
        i.token,
        s.name as studio_name,
        i.role,
        i.created_at
    FROM public.studio_invitations i
    JOIN public.studios s ON s.id = i.studio_id
    WHERE i.email = user_email
    AND i.used_at IS NULL;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.users (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'STUDENT')
  on conflict (id) do nothing; -- Prevent error if already exists
  return new;
end;
$$;


--
-- Name: recover_orphaned_owner(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."recover_orphaned_owner"() RETURNS TABLE("recovered_studio_name" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    found_studio_id UUID;
    found_studio_name TEXT;
BEGIN
    -- 1. Find a studio created by this user
    -- (Assuming 1 studio per user for now, or just pick the first)
    SELECT id, name INTO found_studio_id, found_studio_name
    FROM public.studios
    WHERE created_by = auth.uid()
    LIMIT 1;

    IF found_studio_id IS NULL THEN
        RETURN; -- User owns no studios
    END IF;

    -- 2. Check if membership already exists (sanity check)
    PERFORM 1 FROM public.studio_memberships 
    WHERE studio_id = found_studio_id AND user_id = auth.uid();
    
    IF FOUND THEN
        -- Already a member, nothing to do (why are we here? maybe cached state in frontend)
        RETURN QUERY SELECT found_studio_name;
        RETURN;
    END IF;

    -- 3. Restore Membership
    INSERT INTO public.studio_memberships (studio_id, user_id, role)
    VALUES (found_studio_id, auth.uid(), 'owner');

    RETURN QUERY SELECT found_studio_name;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = "heap";

--
-- Name: academy_attendance_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."academy_attendance_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "course_id" "uuid",
    "student_id" "uuid" NOT NULL,
    "action" "text" NOT NULL,
    "previous_value" integer,
    "new_value" integer,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: academy_courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."academy_courses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "studio_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "duration" "text",
    "price" numeric(10,2) DEFAULT 0,
    "materials" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: academy_daily_attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."academy_daily_attendance" (
    "course_id" "uuid" NOT NULL,
    "student_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "status" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "academy_daily_attendance_status_check" CHECK (("status" = ANY (ARRAY['PRESENT'::"text", 'ABSENT'::"text", 'LATE'::"text"])))
);


--
-- Name: academy_enrollments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."academy_enrollments" (
    "course_id" "uuid" NOT NULL,
    "student_id" "uuid" NOT NULL,
    "allowed_days" integer DEFAULT 0,
    "attended_days" integer DEFAULT 0,
    "attendance_updated_at" timestamp with time zone,
    "attendance_updated_by" "uuid",
    "total_cost" numeric(10,2) DEFAULT 0,
    "deposits" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: appointments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."appointments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "studio_id" "uuid",
    "client_id" "uuid",
    "artist_id" "uuid",
    "service_name" "text" NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "status" "text" DEFAULT 'PENDING'::"text" NOT NULL,
    "price" numeric DEFAULT 0,
    "deposit" numeric DEFAULT 0,
    "notes" "text",
    "images" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "google_event_id" "text"
);

ALTER TABLE ONLY "public"."appointments" REPLICA IDENTITY FULL;


--
-- Name: artist_contracts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."artist_contracts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "studio_id" "uuid",
    "artist_id" "uuid",
    "commission_rate" numeric DEFAULT 0,
    "rent_type" "text" NOT NULL,
    "rent_fixed_amount" numeric,
    "rent_percent_rate" numeric,
    "presence_price" numeric,
    "presence_package_limit" integer,
    "used_presences" integer DEFAULT 0,
    "presence_cycle_start" timestamp with time zone DEFAULT "now"(),
    "presence_cycle_end" timestamp with time zone,
    "vat_number" "text",
    "fiscal_code" "text",
    "address" "text",
    "iban" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "artist_contracts_rent_type_check" CHECK (("rent_type" = ANY (ARRAY['FIXED'::"text", 'PERCENTAGE'::"text", 'PRESENCES'::"text"])))
);


--
-- Name: client_consents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."client_consents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "template_id" "uuid" NOT NULL,
    "template_version" integer NOT NULL,
    "signature_url" "text",
    "signed_at" timestamp with time zone DEFAULT "now"(),
    "role" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."clients" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "studio_id" "uuid",
    "full_name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "images" "jsonb" DEFAULT '[]'::"jsonb",
    "fiscal_code" "text",
    "address" "text",
    "city" "text",
    "zip_code" "text",
    "preferred_styles" "text"[] DEFAULT '{}'::"text"[],
    "whatsapp_broadcast_opt_in" boolean DEFAULT false
);

ALTER TABLE ONLY "public"."clients" REPLICA IDENTITY FULL;


--
-- Name: communication_replies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."communication_replies" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "communication_id" "uuid",
    "author_id" "uuid" NOT NULL,
    "author_name" "text",
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: communications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."communications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "studio_id" "uuid" NOT NULL,
    "author_id" "uuid" NOT NULL,
    "author_name" "text",
    "content" "text" NOT NULL,
    "is_important" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: consent_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."consent_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "studio_id" "text" NOT NULL,
    "version" integer DEFAULT 1 NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "is_active" boolean DEFAULT true,
    "required_resign" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."courses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "studio_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "start_date" timestamp with time zone,
    "end_date" timestamp with time zone,
    "student_ids" "uuid"[],
    "created_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: presence_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."presence_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "studio_id" "uuid",
    "artist_id" "uuid",
    "action" "text" NOT NULL,
    "note" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "presence_logs_action_check" CHECK (("action" = ANY (ARRAY['ADD'::"text", 'RESET'::"text"])))
);


--
-- Name: recurring_expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."recurring_expenses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "studio_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "amount" numeric NOT NULL,
    "category" "text" NOT NULL,
    "day_of_month" integer DEFAULT 1,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


--
-- Name: studio_invitations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."studio_invitations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "studio_id" "uuid" NOT NULL,
    "email" "text",
    "role" "public"."user_role" NOT NULL,
    "invited_by" "uuid",
    "token" "text" NOT NULL,
    "expires_at" timestamp with time zone DEFAULT ("now"() + '7 days'::interval) NOT NULL,
    "used_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: studio_memberships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."studio_memberships" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "studio_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."user_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: studios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."studios" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "address" "text",
    "city" "text",
    "phone" "text",
    "logo_url" "text",
    "website" "text",
    "vat_number" "text",
    "fiscal_code" "text",
    "company_name" "text",
    "google_review_url" "text",
    "google_sheets_config" "jsonb",
    "academy_terms" "text",
    "academy_terms_version" integer DEFAULT 0,
    "ai_settings" "jsonb"
);


--
-- Name: COLUMN "studios"."google_sheets_config"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN "public"."studios"."google_sheets_config" IS 'Stores configuration for automatic Google Sheets sync: {spreadsheet_id, sheet_name, auto_sync_enabled}';


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "studio_id" "uuid",
    "date" timestamp with time zone NOT NULL,
    "amount" numeric NOT NULL,
    "type" "text" NOT NULL,
    "category" "text" NOT NULL,
    "description" "text",
    "payment_method" "text",
    "appointment_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "artist_id" "uuid",
    CONSTRAINT "transactions_type_check" CHECK (("type" = ANY (ARRAY['INCOME'::"text", 'EXPENSE'::"text"])))
);


--
-- Name: user_integrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."user_integrations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "provider" "text" NOT NULL,
    "access_token" "text" NOT NULL,
    "refresh_token" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_integrations_provider_check" CHECK (("provider" = 'google'::"text"))
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text",
    "role" "text" DEFAULT 'STUDENT'::"text" NOT NULL,
    "studio_id" "uuid",
    "avatar_url" "text",
    "phone" "text",
    "calendar_color" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "academy_terms_accepted_at" timestamp with time zone,
    "academy_terms_accepted_version" integer DEFAULT 0
);


--
-- Name: waitlist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."waitlist" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "studio_id" "uuid",
    "client_name" "text" NOT NULL,
    "client_phone" "text",
    "service_request" "text",
    "preferred_days" "text",
    "status" "text" DEFAULT 'PENDING'::"text" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: waitlist_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."waitlist_entries" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "studio_id" "uuid" NOT NULL,
    "client_id" "uuid",
    "email" "text",
    "phone" "text",
    "client_name" "text",
    "preferred_artist_id" "uuid",
    "styles" "text"[],
    "description" "text",
    "images" "text"[],
    "status" "text" DEFAULT 'PENDING'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "interest_type" "text" DEFAULT 'TATTOO'::"text",
    "artist_pref_id" "uuid",
    CONSTRAINT "waitlist_entries_interest_type_check" CHECK (("interest_type" = ANY (ARRAY['TATTOO'::"text", 'ACADEMY'::"text"]))),
    CONSTRAINT "waitlist_entries_status_check" CHECK (("status" = ANY (ARRAY['PENDING'::"text", 'CONTACTED'::"text", 'IN_PROGRESS'::"text", 'BOOKED'::"text", 'REJECTED'::"text"])))
);


--
-- Name: COLUMN "waitlist_entries"."interest_type"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN "public"."waitlist_entries"."interest_type" IS 'Indicates if the user is interested in a Tattoo service or Academy course';


--
-- Name: COLUMN "waitlist_entries"."artist_pref_id"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN "public"."waitlist_entries"."artist_pref_id" IS 'ID of the preferred artist (optional)';


--
-- Name: academy_attendance_logs academy_attendance_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."academy_attendance_logs"
    ADD CONSTRAINT "academy_attendance_logs_pkey" PRIMARY KEY ("id");


--
-- Name: academy_courses academy_courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."academy_courses"
    ADD CONSTRAINT "academy_courses_pkey" PRIMARY KEY ("id");


--
-- Name: academy_daily_attendance academy_daily_attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."academy_daily_attendance"
    ADD CONSTRAINT "academy_daily_attendance_pkey" PRIMARY KEY ("course_id", "student_id", "date");


--
-- Name: academy_enrollments academy_enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."academy_enrollments"
    ADD CONSTRAINT "academy_enrollments_pkey" PRIMARY KEY ("course_id", "student_id");


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_pkey" PRIMARY KEY ("id");


--
-- Name: artist_contracts artist_contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."artist_contracts"
    ADD CONSTRAINT "artist_contracts_pkey" PRIMARY KEY ("id");


--
-- Name: client_consents client_consents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."client_consents"
    ADD CONSTRAINT "client_consents_pkey" PRIMARY KEY ("id");


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");


--
-- Name: communication_replies communication_replies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."communication_replies"
    ADD CONSTRAINT "communication_replies_pkey" PRIMARY KEY ("id");


--
-- Name: communications communications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."communications"
    ADD CONSTRAINT "communications_pkey" PRIMARY KEY ("id");


--
-- Name: consent_templates consent_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."consent_templates"
    ADD CONSTRAINT "consent_templates_pkey" PRIMARY KEY ("id");


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_pkey" PRIMARY KEY ("id");


--
-- Name: presence_logs presence_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."presence_logs"
    ADD CONSTRAINT "presence_logs_pkey" PRIMARY KEY ("id");


--
-- Name: recurring_expenses recurring_expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."recurring_expenses"
    ADD CONSTRAINT "recurring_expenses_pkey" PRIMARY KEY ("id");


--
-- Name: studio_invitations studio_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."studio_invitations"
    ADD CONSTRAINT "studio_invitations_pkey" PRIMARY KEY ("id");


--
-- Name: studio_invitations studio_invitations_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."studio_invitations"
    ADD CONSTRAINT "studio_invitations_token_key" UNIQUE ("token");


--
-- Name: studio_memberships studio_memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."studio_memberships"
    ADD CONSTRAINT "studio_memberships_pkey" PRIMARY KEY ("id");


--
-- Name: studio_memberships studio_memberships_studio_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."studio_memberships"
    ADD CONSTRAINT "studio_memberships_studio_id_user_id_key" UNIQUE ("studio_id", "user_id");


--
-- Name: studios studios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."studios"
    ADD CONSTRAINT "studios_pkey" PRIMARY KEY ("id");


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");


--
-- Name: user_integrations user_integrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."user_integrations"
    ADD CONSTRAINT "user_integrations_pkey" PRIMARY KEY ("id");


--
-- Name: user_integrations user_integrations_user_id_provider_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."user_integrations"
    ADD CONSTRAINT "user_integrations_user_id_provider_key" UNIQUE ("user_id", "provider");


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");


--
-- Name: waitlist_entries waitlist_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."waitlist_entries"
    ADD CONSTRAINT "waitlist_entries_pkey" PRIMARY KEY ("id");


--
-- Name: waitlist waitlist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."waitlist"
    ADD CONSTRAINT "waitlist_pkey" PRIMARY KEY ("id");


--
-- Name: idx_appointments_google_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_appointments_google_event_id" ON "public"."appointments" USING "btree" ("google_event_id");


--
-- Name: idx_clients_studio_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "idx_clients_studio_email" ON "public"."clients" USING "btree" ("studio_id", "email");


--
-- Name: idx_transactions_appointment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_transactions_appointment_id" ON "public"."transactions" USING "btree" ("appointment_id");


--
-- Name: idx_transactions_artist_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_transactions_artist_id" ON "public"."transactions" USING "btree" ("artist_id");


--
-- Name: idx_user_integrations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_user_integrations_user_id" ON "public"."user_integrations" USING "btree" ("user_id");


--
-- Name: academy_attendance_logs academy_attendance_logs_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."academy_attendance_logs"
    ADD CONSTRAINT "academy_attendance_logs_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."academy_courses"("id") ON DELETE CASCADE;


--
-- Name: academy_daily_attendance academy_daily_attendance_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."academy_daily_attendance"
    ADD CONSTRAINT "academy_daily_attendance_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."academy_courses"("id") ON DELETE CASCADE;


--
-- Name: academy_enrollments academy_enrollments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."academy_enrollments"
    ADD CONSTRAINT "academy_enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."academy_courses"("id") ON DELETE CASCADE;


--
-- Name: appointments appointments_artist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: appointments appointments_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;


--
-- Name: appointments appointments_studio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_studio_id_fkey" FOREIGN KEY ("studio_id") REFERENCES "public"."studios"("id") ON DELETE CASCADE;


--
-- Name: artist_contracts artist_contracts_artist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."artist_contracts"
    ADD CONSTRAINT "artist_contracts_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: artist_contracts artist_contracts_studio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."artist_contracts"
    ADD CONSTRAINT "artist_contracts_studio_id_fkey" FOREIGN KEY ("studio_id") REFERENCES "public"."studios"("id") ON DELETE CASCADE;


--
-- Name: client_consents client_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."client_consents"
    ADD CONSTRAINT "client_consents_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE;


--
-- Name: client_consents client_consents_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."client_consents"
    ADD CONSTRAINT "client_consents_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."consent_templates"("id");


--
-- Name: clients clients_studio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_studio_id_fkey" FOREIGN KEY ("studio_id") REFERENCES "public"."studios"("id") ON DELETE CASCADE;


--
-- Name: communication_replies communication_replies_communication_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."communication_replies"
    ADD CONSTRAINT "communication_replies_communication_id_fkey" FOREIGN KEY ("communication_id") REFERENCES "public"."communications"("id") ON DELETE CASCADE;


--
-- Name: courses courses_studio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_studio_id_fkey" FOREIGN KEY ("studio_id") REFERENCES "public"."studios"("id") ON DELETE CASCADE;


--
-- Name: presence_logs presence_logs_artist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."presence_logs"
    ADD CONSTRAINT "presence_logs_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: presence_logs presence_logs_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."presence_logs"
    ADD CONSTRAINT "presence_logs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");


--
-- Name: presence_logs presence_logs_studio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."presence_logs"
    ADD CONSTRAINT "presence_logs_studio_id_fkey" FOREIGN KEY ("studio_id") REFERENCES "public"."studios"("id") ON DELETE CASCADE;


--
-- Name: studio_invitations studio_invitations_invited_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."studio_invitations"
    ADD CONSTRAINT "studio_invitations_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;


--
-- Name: studio_invitations studio_invitations_studio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."studio_invitations"
    ADD CONSTRAINT "studio_invitations_studio_id_fkey" FOREIGN KEY ("studio_id") REFERENCES "public"."studios"("id") ON DELETE CASCADE;


--
-- Name: studio_memberships studio_memberships_studio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."studio_memberships"
    ADD CONSTRAINT "studio_memberships_studio_id_fkey" FOREIGN KEY ("studio_id") REFERENCES "public"."studios"("id") ON DELETE CASCADE;


--
-- Name: studio_memberships studio_memberships_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."studio_memberships"
    ADD CONSTRAINT "studio_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: studios studios_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."studios"
    ADD CONSTRAINT "studios_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;


--
-- Name: transactions transactions_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE SET NULL;


--
-- Name: transactions transactions_artist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "public"."users"("id");


--
-- Name: transactions transactions_studio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_studio_id_fkey" FOREIGN KEY ("studio_id") REFERENCES "public"."studios"("id") ON DELETE CASCADE;


--
-- Name: user_integrations user_integrations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."user_integrations"
    ADD CONSTRAINT "user_integrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: users users_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: users users_studio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_studio_id_fkey" FOREIGN KEY ("studio_id") REFERENCES "public"."studios"("id") ON DELETE SET NULL;


--
-- Name: waitlist waitlist_studio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."waitlist"
    ADD CONSTRAINT "waitlist_studio_id_fkey" FOREIGN KEY ("studio_id") REFERENCES "public"."studios"("id") ON DELETE CASCADE;


--
-- Name: appointments Allow all access to authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all access to authenticated" ON "public"."appointments" USING (("auth"."role"() = 'authenticated'::"text"));


--
-- Name: artist_contracts Allow all access to authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all access to authenticated" ON "public"."artist_contracts" USING (("auth"."role"() = 'authenticated'::"text"));


--
-- Name: clients Allow all access to authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all access to authenticated" ON "public"."clients" USING (("auth"."role"() = 'authenticated'::"text"));


--
-- Name: courses Allow all access to authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all access to authenticated" ON "public"."courses" USING (("auth"."role"() = 'authenticated'::"text"));


--
-- Name: presence_logs Allow all access to authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all access to authenticated" ON "public"."presence_logs" USING (("auth"."role"() = 'authenticated'::"text"));


--
-- Name: studio_invitations Allow all access to authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all access to authenticated" ON "public"."studio_invitations" USING (("auth"."role"() = 'authenticated'::"text"));


--
-- Name: studio_memberships Allow all access to authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all access to authenticated" ON "public"."studio_memberships" USING (("auth"."role"() = 'authenticated'::"text"));


--
-- Name: transactions Allow all access to authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all access to authenticated" ON "public"."transactions" USING (("auth"."role"() = 'authenticated'::"text"));


--
-- Name: waitlist Allow all access to authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all access to authenticated" ON "public"."waitlist" USING (("auth"."role"() = 'authenticated'::"text"));


--
-- Name: studios Allow all for authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all for authenticated" ON "public"."studios" USING (("auth"."role"() = 'authenticated'::"text"));


--
-- Name: users Allow all for authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all for authenticated" ON "public"."users" USING (("auth"."role"() = 'authenticated'::"text"));


--
-- Name: studios Allow insert to authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow insert to authenticated" ON "public"."studios" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));


--
-- Name: users Allow insert/update specific fields to authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow insert/update specific fields to authenticated" ON "public"."users" USING (("auth"."role"() = 'authenticated'::"text"));


--
-- Name: users Allow insert/update to authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow insert/update to authenticated" ON "public"."users" USING (("auth"."role"() = 'authenticated'::"text"));


--
-- Name: studio_invitations Allow members to view studio invitations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow members to view studio invitations" ON "public"."studio_invitations" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."studio_memberships"
  WHERE (("studio_memberships"."user_id" = "auth"."uid"()) AND ("studio_memberships"."studio_id" = "studio_invitations"."studio_id")))));


--
-- Name: studio_invitations Allow owners and managers to create invitations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow owners and managers to create invitations" ON "public"."studio_invitations" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."studio_memberships"
  WHERE (("studio_memberships"."user_id" = "auth"."uid"()) AND ("studio_memberships"."studio_id" = "studio_invitations"."studio_id") AND ("lower"(("studio_memberships"."role")::"text") = ANY (ARRAY['owner'::"text", 'manager'::"text", 'artist'::"text", 'studio_admin'::"text"]))))));


--
-- Name: client_consents Allow public consent signature; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public consent signature" ON "public"."client_consents" FOR INSERT WITH CHECK (true);


--
-- Name: clients Allow public registration; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public registration" ON "public"."clients" FOR INSERT WITH CHECK (true);


--
-- Name: studio_invitations Allow public to view invitation by token; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public to view invitation by token" ON "public"."studio_invitations" FOR SELECT USING (true);


--
-- Name: waitlist_entries Allow public waitlist entry; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public waitlist entry" ON "public"."waitlist_entries" FOR INSERT WITH CHECK (true);


--
-- Name: users Allow read access to authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow read access to authenticated" ON "public"."users" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));


--
-- Name: studios Allow update to authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow update to authenticated" ON "public"."studios" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));


--
-- Name: consent_templates Authenticated create templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated create templates" ON "public"."consent_templates" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));


--
-- Name: client_consents Authenticated read consents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated read consents" ON "public"."client_consents" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));


--
-- Name: consent_templates Authenticated update templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated update templates" ON "public"."consent_templates" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));


--
-- Name: appointments Create appointments in own studio; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Create appointments in own studio" ON "public"."appointments" FOR INSERT WITH CHECK (("auth"."uid"() IN ( SELECT "studio_memberships"."user_id"
   FROM "public"."studio_memberships"
  WHERE ("studio_memberships"."studio_id" = "appointments"."studio_id"))));


--
-- Name: appointments Delete own studio appointments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Delete own studio appointments" ON "public"."appointments" FOR DELETE USING (("auth"."uid"() IN ( SELECT "studio_memberships"."user_id"
   FROM "public"."studio_memberships"
  WHERE ("studio_memberships"."studio_id" = "appointments"."studio_id"))));


--
-- Name: academy_attendance_logs Enable all access for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable all access for authenticated users" ON "public"."academy_attendance_logs" USING (("auth"."role"() = 'authenticated'::"text"));


--
-- Name: communication_replies Enable all access for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable all access for authenticated users" ON "public"."communication_replies" USING (("auth"."role"() = 'authenticated'::"text"));


--
-- Name: studio_invitations Enable all access for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable all access for authenticated users" ON "public"."studio_invitations" USING (("auth"."role"() = 'authenticated'::"text"));


--
-- Name: transactions Enable all access for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable all access for authenticated users" ON "public"."transactions" TO "authenticated" USING (true);


--
-- Name: users Enable update for users own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable update for users own profile" ON "public"."users" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id"));


--
-- Name: studio_memberships Hotfix: Manage own memberships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Hotfix: Manage own memberships" ON "public"."studio_memberships" USING (true);


--
-- Name: users Hotfix: Update own user; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Hotfix: Update own user" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id"));


--
-- Name: appointments Hotfix: View all appointments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Hotfix: View all appointments" ON "public"."appointments" FOR SELECT USING (true);


--
-- Name: clients Hotfix: View all clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Hotfix: View all clients" ON "public"."clients" FOR SELECT USING (true);


--
-- Name: studio_memberships Hotfix: View all memberships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Hotfix: View all memberships" ON "public"."studio_memberships" FOR SELECT USING (true);


--
-- Name: users Hotfix: View all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Hotfix: View all users" ON "public"."users" FOR SELECT USING (true);


--
-- Name: clients Manage clients in own studio; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Manage clients in own studio" ON "public"."clients" USING (("auth"."uid"() IN ( SELECT "studio_memberships"."user_id"
   FROM "public"."studio_memberships"
  WHERE ("studio_memberships"."studio_id" = "clients"."studio_id"))));


--
-- Name: artist_contracts Manage contracts (Managers/Owners); Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Manage contracts (Managers/Owners)" ON "public"."artist_contracts" USING (("auth"."uid"() IN ( SELECT "studio_memberships"."user_id"
   FROM "public"."studio_memberships"
  WHERE (("studio_memberships"."studio_id" = "artist_contracts"."studio_id") AND ("studio_memberships"."role" = ANY (ARRAY['owner'::"public"."user_role", 'manager'::"public"."user_role"]))))));


--
-- Name: academy_courses Manage own studio courses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Manage own studio courses" ON "public"."academy_courses" USING (("auth"."uid"() IN ( SELECT "studio_memberships"."user_id"
   FROM "public"."studio_memberships"
  WHERE (("studio_memberships"."studio_id" = "academy_courses"."studio_id") AND ("studio_memberships"."role" = ANY (ARRAY['owner'::"public"."user_role", 'manager'::"public"."user_role"]))))));


--
-- Name: academy_enrollments Manage own studio enrollments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Manage own studio enrollments" ON "public"."academy_enrollments" USING ((EXISTS ( SELECT 1
   FROM "public"."academy_courses" "ac"
  WHERE (("ac"."id" = "academy_enrollments"."course_id") AND ("auth"."uid"() IN ( SELECT "studio_memberships"."user_id"
           FROM "public"."studio_memberships"
          WHERE (("studio_memberships"."studio_id" = "ac"."studio_id") AND ("studio_memberships"."role" = ANY (ARRAY['owner'::"public"."user_role", 'manager'::"public"."user_role"])))))))));


--
-- Name: recurring_expenses Manage recurring_expenses in own studio; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Manage recurring_expenses in own studio" ON "public"."recurring_expenses" USING (("auth"."uid"() IN ( SELECT "studio_memberships"."user_id"
   FROM "public"."studio_memberships"
  WHERE ("studio_memberships"."studio_id" = "recurring_expenses"."studio_id"))));


--
-- Name: academy_daily_attendance Manage studio attendance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Manage studio attendance" ON "public"."academy_daily_attendance" USING ((EXISTS ( SELECT 1
   FROM "public"."academy_courses" "ac"
  WHERE (("ac"."id" = "academy_daily_attendance"."course_id") AND ("auth"."uid"() IN ( SELECT "studio_memberships"."user_id"
           FROM "public"."studio_memberships"
          WHERE (("studio_memberships"."studio_id" = "ac"."studio_id") AND ("studio_memberships"."role" = ANY (ARRAY['owner'::"public"."user_role", 'manager'::"public"."user_role", 'artist'::"public"."user_role"])))))))));


--
-- Name: communications Manage studio communications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Manage studio communications" ON "public"."communications" USING (("auth"."uid"() IN ( SELECT "studio_memberships"."user_id"
   FROM "public"."studio_memberships"
  WHERE ("studio_memberships"."studio_id" = "communications"."studio_id"))));


--
-- Name: transactions Manage transactions in own studio; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Manage transactions in own studio" ON "public"."transactions" USING (("auth"."uid"() IN ( SELECT "studio_memberships"."user_id"
   FROM "public"."studio_memberships"
  WHERE ("studio_memberships"."studio_id" = "transactions"."studio_id"))));


--
-- Name: waitlist_entries Manage waitlist in own studio; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Manage waitlist in own studio" ON "public"."waitlist_entries" USING (("auth"."uid"() IN ( SELECT "studio_memberships"."user_id"
   FROM "public"."studio_memberships"
  WHERE ("studio_memberships"."studio_id" = "waitlist_entries"."studio_id"))));


--
-- Name: recurring_expenses Owners and managers can delete recurring expenses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners and managers can delete recurring expenses" ON "public"."recurring_expenses" FOR DELETE USING (("auth"."uid"() IN ( SELECT "studio_memberships"."user_id"
   FROM "public"."studio_memberships"
  WHERE (("studio_memberships"."studio_id" = "recurring_expenses"."studio_id") AND ("studio_memberships"."role" = ANY (ARRAY['owner'::"public"."user_role", 'manager'::"public"."user_role"]))))));


--
-- Name: recurring_expenses Owners and managers can insert recurring expenses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners and managers can insert recurring expenses" ON "public"."recurring_expenses" FOR INSERT WITH CHECK (("auth"."uid"() IN ( SELECT "studio_memberships"."user_id"
   FROM "public"."studio_memberships"
  WHERE (("studio_memberships"."studio_id" = "recurring_expenses"."studio_id") AND ("studio_memberships"."role" = ANY (ARRAY['owner'::"public"."user_role", 'manager'::"public"."user_role"]))))));


--
-- Name: recurring_expenses Owners and managers can update recurring expenses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners and managers can update recurring expenses" ON "public"."recurring_expenses" FOR UPDATE USING (("auth"."uid"() IN ( SELECT "studio_memberships"."user_id"
   FROM "public"."studio_memberships"
  WHERE (("studio_memberships"."studio_id" = "recurring_expenses"."studio_id") AND ("studio_memberships"."role" = ANY (ARRAY['owner'::"public"."user_role", 'manager'::"public"."user_role"]))))));


--
-- Name: recurring_expenses Owners and managers can view recurring expenses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners and managers can view recurring expenses" ON "public"."recurring_expenses" FOR SELECT USING (("auth"."uid"() IN ( SELECT "studio_memberships"."user_id"
   FROM "public"."studio_memberships"
  WHERE (("studio_memberships"."studio_id" = "recurring_expenses"."studio_id") AND ("studio_memberships"."role" = ANY (ARRAY['owner'::"public"."user_role", 'manager'::"public"."user_role"]))))));


--
-- Name: studios Owners can update their studio; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners can update their studio" ON "public"."studios" FOR UPDATE USING (("auth"."uid"() IN ( SELECT "studio_memberships"."user_id"
   FROM "public"."studio_memberships"
  WHERE (("studio_memberships"."studio_id" = "studios"."id") AND ("studio_memberships"."role" = 'owner'::"public"."user_role"))))) WITH CHECK (("auth"."uid"() IN ( SELECT "studio_memberships"."user_id"
   FROM "public"."studio_memberships"
  WHERE (("studio_memberships"."studio_id" = "studios"."id") AND ("studio_memberships"."role" = 'owner'::"public"."user_role")))));


--
-- Name: client_consents Public create consents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public create consents" ON "public"."client_consents" FOR INSERT WITH CHECK (true);


--
-- Name: consent_templates Public read active templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read active templates" ON "public"."consent_templates" FOR SELECT USING (("is_active" = true));


--
-- Name: appointments Update own studio appointments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Update own studio appointments" ON "public"."appointments" FOR UPDATE USING (("auth"."uid"() IN ( SELECT "studio_memberships"."user_id"
   FROM "public"."studio_memberships"
  WHERE ("studio_memberships"."studio_id" = "appointments"."studio_id"))));


--
-- Name: users Update self; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Update self" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id"));


--
-- Name: user_integrations Users can delete their own integrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own integrations" ON "public"."user_integrations" FOR DELETE USING (("auth"."uid"() = "user_id"));


--
-- Name: user_integrations Users can insert their own integrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own integrations" ON "public"."user_integrations" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));


--
-- Name: user_integrations Users can update their own integrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own integrations" ON "public"."user_integrations" FOR UPDATE USING (("auth"."uid"() = "user_id"));


--
-- Name: user_integrations Users can view their own integrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own integrations" ON "public"."user_integrations" FOR SELECT USING (("auth"."uid"() = "user_id"));


--
-- Name: appointments View appointments from own studio; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "View appointments from own studio" ON "public"."appointments" FOR SELECT USING (("auth"."uid"() IN ( SELECT "studio_memberships"."user_id"
   FROM "public"."studio_memberships"
  WHERE ("studio_memberships"."studio_id" = "appointments"."studio_id"))));


--
-- Name: clients View clients from own studio; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "View clients from own studio" ON "public"."clients" FOR SELECT USING (("auth"."uid"() IN ( SELECT "studio_memberships"."user_id"
   FROM "public"."studio_memberships"
  WHERE ("studio_memberships"."studio_id" = "clients"."studio_id"))));


--
-- Name: artist_contracts View own contract or studio contracts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "View own contract or studio contracts" ON "public"."artist_contracts" FOR SELECT USING ((("auth"."uid"() = "artist_id") OR ("auth"."uid"() IN ( SELECT "studio_memberships"."user_id"
   FROM "public"."studio_memberships"
  WHERE (("studio_memberships"."studio_id" = "artist_contracts"."studio_id") AND ("studio_memberships"."role" = ANY (ARRAY['owner'::"public"."user_role", 'manager'::"public"."user_role"])))))));


--
-- Name: academy_courses View own studio courses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "View own studio courses" ON "public"."academy_courses" FOR SELECT USING (("auth"."uid"() IN ( SELECT "studio_memberships"."user_id"
   FROM "public"."studio_memberships"
  WHERE ("studio_memberships"."studio_id" = "academy_courses"."studio_id"))));


--
-- Name: academy_enrollments View own studio enrollments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "View own studio enrollments" ON "public"."academy_enrollments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."academy_courses" "ac"
  WHERE (("ac"."id" = "academy_enrollments"."course_id") AND ("auth"."uid"() IN ( SELECT "studio_memberships"."user_id"
           FROM "public"."studio_memberships"
          WHERE ("studio_memberships"."studio_id" = "ac"."studio_id")))))));


--
-- Name: studios View own studios; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "View own studios" ON "public"."studios" FOR SELECT USING (("auth"."uid"() IN ( SELECT "studio_memberships"."user_id"
   FROM "public"."studio_memberships"
  WHERE ("studio_memberships"."studio_id" = "studios"."id"))));


--
-- Name: academy_daily_attendance View studio attendance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "View studio attendance" ON "public"."academy_daily_attendance" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."academy_courses" "ac"
  WHERE (("ac"."id" = "academy_daily_attendance"."course_id") AND ("auth"."uid"() IN ( SELECT "studio_memberships"."user_id"
           FROM "public"."studio_memberships"
          WHERE ("studio_memberships"."studio_id" = "ac"."studio_id")))))));


--
-- Name: communications View studio communications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "View studio communications" ON "public"."communications" FOR SELECT USING (("auth"."uid"() IN ( SELECT "studio_memberships"."user_id"
   FROM "public"."studio_memberships"
  WHERE ("studio_memberships"."studio_id" = "communications"."studio_id"))));


--
-- Name: transactions View transactions from own studio; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "View transactions from own studio" ON "public"."transactions" FOR SELECT USING (("auth"."uid"() IN ( SELECT "studio_memberships"."user_id"
   FROM "public"."studio_memberships"
  WHERE ("studio_memberships"."studio_id" = "transactions"."studio_id"))));


--
-- Name: academy_attendance_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."academy_attendance_logs" ENABLE ROW LEVEL SECURITY;

--
-- Name: academy_courses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."academy_courses" ENABLE ROW LEVEL SECURITY;

--
-- Name: academy_daily_attendance; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."academy_daily_attendance" ENABLE ROW LEVEL SECURITY;

--
-- Name: academy_enrollments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."academy_enrollments" ENABLE ROW LEVEL SECURITY;

--
-- Name: appointments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."appointments" ENABLE ROW LEVEL SECURITY;

--
-- Name: artist_contracts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."artist_contracts" ENABLE ROW LEVEL SECURITY;

--
-- Name: client_consents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."client_consents" ENABLE ROW LEVEL SECURITY;

--
-- Name: clients; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."clients" ENABLE ROW LEVEL SECURITY;

--
-- Name: communication_replies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."communication_replies" ENABLE ROW LEVEL SECURITY;

--
-- Name: communications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."communications" ENABLE ROW LEVEL SECURITY;

--
-- Name: consent_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."consent_templates" ENABLE ROW LEVEL SECURITY;

--
-- Name: courses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."courses" ENABLE ROW LEVEL SECURITY;

--
-- Name: presence_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."presence_logs" ENABLE ROW LEVEL SECURITY;

--
-- Name: recurring_expenses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."recurring_expenses" ENABLE ROW LEVEL SECURITY;

--
-- Name: studio_invitations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."studio_invitations" ENABLE ROW LEVEL SECURITY;

--
-- Name: studio_memberships; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."studio_memberships" ENABLE ROW LEVEL SECURITY;

--
-- Name: studios; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."studios" ENABLE ROW LEVEL SECURITY;

--
-- Name: transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;

--
-- Name: user_integrations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."user_integrations" ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

--
-- Name: waitlist; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."waitlist" ENABLE ROW LEVEL SECURITY;

--
-- Name: waitlist_entries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."waitlist_entries" ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


