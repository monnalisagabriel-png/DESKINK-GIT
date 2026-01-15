import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../features/auth/AuthContext';

export const useRealtime = (
    table: string,
    onChange: () => void,
    filter?: string
) => {
    const { user } = useAuth();
    const studioId = user?.studio_id;

    useEffect(() => {
        if (!studioId) return;

        // Unique channel name to avoid collisions
        const channelName = `public:${table}:${studioId}`;

        console.log(`[Realtime] Subscribing to ${table} for studio ${studioId}`);

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
                (payload) => {
                    console.log(`[Realtime] Change received on ${table}:`, payload);
                    onChange();
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    // console.log(`[Realtime] Subscribed to ${table}`);
                }
            });

        return () => {
            console.log(`[Realtime] Unsubscribing from ${table}`);
            supabase.removeChannel(channel);
        };
    }, [table, studioId, filter, onChange]);
};
