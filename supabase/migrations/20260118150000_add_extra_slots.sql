-- Add extra_slots column to studios
ALTER TABLE public.studios
ADD COLUMN IF NOT EXISTS extra_slots INTEGER DEFAULT 0;

COMMENT ON COLUMN public.studios.extra_slots IS 'Number of additional member slots purchased via subscription';

-- Function to check if a studio can add a new member
CREATE OR REPLACE FUNCTION public.check_studio_capacity()
RETURNS TRIGGER AS $$
DECLARE
    v_plan_id TEXT;
    v_max_artists INT;
    v_max_managers INT;
    v_extra_slots INT;
    v_current_count INT;
    v_total_limit INT;
    v_studio_id UUID;
BEGIN
    v_studio_id := NEW.studio_id;

    -- 1. Get Studio's Plan and Extra Slots
    -- We join with saas_subscriptions (active) or fallback to studio's cached fields if we rely on them.
    -- Better to rely on the active subscription plan.
    
    SELECT 
        p.max_artists,
        p.max_managers,
        COALESCE(s.extra_slots, 0)
    INTO
        v_max_artists,
        v_max_managers,
        v_extra_slots
    FROM public.studios s
    LEFT JOIN public.saas_subscriptions sub ON sub.studio_id = s.id AND sub.status = 'active'
    LEFT JOIN public.saas_plans p ON p.id = sub.plan_id
    WHERE s.id = v_studio_id;

    -- If no active subscription found, we might want to default to Basic or strict.
    -- For now, if no plan found, let's assume loose limits or strict 1/1 based on 'starter' defaults?
    -- Let's query the plan directly if we can't find subscription, via studio.subscription_tier if we maintain it.
    
    IF v_max_artists IS NULL THEN
        -- Fallback to checking studio's cached subscription_tier if available
        SELECT 
            p.max_artists,
            p.max_managers
        INTO
            v_max_artists,
            v_max_managers
        FROM public.studios s
        JOIN public.saas_plans p ON p.id = s.subscription_tier -- Assuming 'basic', 'pro', 'plus' match IDs
        WHERE s.id = v_studio_id;
    END IF;

    -- Defaults if still null (shouldn't happen with constraints)
    v_max_artists := COALESCE(v_max_artists, 1);
    v_max_managers := COALESCE(v_max_managers, 1);
    v_extra_slots := COALESCE(v_extra_slots, 0);

    -- 2. Calculate Total Allowed
    -- Rules:
    -- -1 means unlimited.
    -- Otherwise: base + extra.
    -- Wait, limits are per role usually. "1 Artist, 1 Manager".
    -- "Extra Slot" implies generic +1? Or specific?
    -- Request says: "adds +1 member total (manager or tatuatore)"
    -- So we should check TOTAL sum of Artist + Manager? 
    -- Or check specific roles?
    
    -- Interpretation: The base limits are specific (e.g. 2 Artists, 2 Managers). 
    -- The extra slots add a "wildcard" capacity.
    -- Total Capacity = (Base Artists + Base Managers) + Extra Slots.
    -- Current Usage = (Current Artists + Current Managers).
    
    -- IF base is -1 (unlimited), then check PASS.
    IF v_max_artists = -1 OR v_max_managers = -1 THEN
        -- Check logic: If ONE is unlimited, does it mean ALL roles are unlimited?
        -- Usually 'Plus' has unlimited Artists. Managers might still be limited.
        -- If the role being added corresponds to an unlimited limit, allow it.
        -- BUT "Extra Slot" adds generic capacity.
        
        -- Let's simplify:
        -- If Role is Artist and MaxArtists is -1 -> OK.
        -- If Role is Manager and MaxManagers is -1 -> OK.
        -- Else, we need to check the count.
        
        IF NEW.role = 'artist' AND v_max_artists = -1 THEN RETURN NEW; END IF;
        IF NEW.role = 'manager' AND v_max_managers = -1 THEN RETURN NEW; END IF;
    END IF;

    -- 3. Get Current Counts
    SELECT COUNT(*) INTO v_current_count
    FROM public.studio_memberships
    WHERE studio_id = v_studio_id
    AND role IN ('artist', 'manager'); -- Only count quota-consuming roles (Owners might be exempt or counted as manager?)

    -- NOTE: Owner is usually outside this quota or counts as 1 manager?
    -- Let's assume Owner is exempt or separate. The prompt focuses on "Manager" and "Artist".
    -- Let's count only 'artist' and 'manager' for now.
    
    -- Calculate generic limit
    -- This is tricky: changing schema from "Specific Params" to "Pooled Capacity" is hard.
    -- If Plan is: 2 Artists + 2 Managers. Total = 4.
    -- If I have 2 Artists, I can't add a 3rd Artist unless I have an Extra Slot.
    -- Even if I have 0 Managers.
    
    -- "Modifiche richieste: ... limite_piano + extra_slots" suggests pooling?
    -- "Aggiunge +1 membro totale (manager o tatuatore)"
    -- This implies the extra slot is a wildcard.
    
    -- Logic:
    -- Can I add this specific role?
    -- YES if: (Current Role Count < Base Role Limit)
    -- OR
    -- YES if: (We are using an Extra Slot).
    -- How to track "Using an extra slot"?
    -- We count the "Overflow".
    
    -- Algorithm:
    -- Count Artists. Overflow_Artists = MAX(0, Count_Artists - Base_Limit_Artists).
    -- Count Managers. Overflow_Managers = MAX(0, Count_Managers - Base_Limit_Managers).
    -- Total_Overflow = Overflow_Artists + Overflow_Managers.
    -- IF Total_Overflow < Extra_Slots -> ALLOW INSERT.
    -- ELSE -> REJECT.
    
    -- Re-calculating with the NEW row included is easier if we do AFTER trigger, but BEFORE is cleaner for rejection.
    -- We act as if the row is added (Count + 1).
    
    DECLARE
        v_count_artists INT;
        v_count_managers INT;
        v_overflow_artists INT;
        v_overflow_managers INT;
        v_total_overflow INT;
    BEGIN
        SELECT 
            COUNT(*) FILTER (WHERE role = 'artist'),
            COUNT(*) FILTER (WHERE role = 'manager')
        INTO
            v_count_artists,
            v_count_managers
        FROM public.studio_memberships
        WHERE studio_id = v_studio_id;

        -- Add the NEW one to the counts
        IF NEW.role = 'artist' THEN v_count_artists := v_count_artists + 1; END IF;
        IF NEW.role = 'manager' THEN v_count_managers := v_count_managers + 1; END IF;
        
        -- Calculate Overflow
        v_overflow_artists := 0;
        IF v_max_artists != -1 THEN
            v_overflow_artists := GREATEST(0, v_count_artists - v_max_artists);
        END IF;

        v_overflow_managers := 0;
        IF v_max_managers != -1 THEN
            v_overflow_managers := GREATEST(0, v_count_managers - v_max_managers);
        END IF;

        v_total_overflow := v_overflow_artists + v_overflow_managers;

        IF v_total_overflow > v_extra_slots THEN
            RAISE EXCEPTION 'Plan limit reached. Upgrade plan or buy extra slots.';
        END IF;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS check_studio_capacity_trigger ON public.studio_memberships;
CREATE TRIGGER check_studio_capacity_trigger
BEFORE INSERT ON public.studio_memberships
FOR EACH ROW
EXECUTE FUNCTION public.check_studio_capacity();
