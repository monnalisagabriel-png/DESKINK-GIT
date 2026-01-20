import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../features/auth/AuthContext';

export const useRealtime = (
    table: string,
    onChange: () => void,
    filter?: string
) => {
    const { user } = useAuth();
    const studioId = user?.studio_id;

    // Use a ref to store the latest callback.
    // This allows the effect to run only when table/filter/studioId changes,
    // not every time the parent component renders and creates a new 'onChange' function.
    const onChangeRef = useRef(onChange);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        if (!studioId) return;

        // Unique channel name to avoid collisions
        const channelName = `public:${table}:${studioId}`;

        // console.log(`[Realtime] Subscribing to ${table} for studio ${studioId}`);

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: table,
                    filter: filter || `studio_id=eq.${studioId}` // Default filter by studio
                },
                (_payload) => {
                    // console.log(`[Realtime] Change received on ${table}:`, payload);
                    if (onChangeRef.current) {
                        onChangeRef.current();
                    }
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    // console.log(`[Realtime] Subscribed to ${table}`);
                } else if (status === 'CHANNEL_ERROR') {
                    console.error(`[Realtime] Error subscribing to ${table}`);
                }
            });

        return () => {
            // console.log(`[Realtime] Unsubscribing from ${table}`);
            supabase.removeChannel(channel);
        };
    }, [table, studioId, filter]); // Removed onChange from dependencies
};
