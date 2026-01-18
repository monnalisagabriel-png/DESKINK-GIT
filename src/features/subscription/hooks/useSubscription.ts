import { useQuery } from '@tanstack/react-query';
import { api } from '../../../services/api';
import type { SaasSubscription } from '../../../services/types';

export const useSubscription = () => {
    return useQuery<SaasSubscription | null>({
        queryKey: ['subscription'],
        queryFn: async () => {
            return await api.subscription.getSubscription();
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
};
