import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';

type Dispute = Database['public']['Tables']['disputes']['Row'];

export function useDisputes() {
  return useQuery<Dispute[]>({
    queryKey: ['disputes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('disputes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useRequestDispute(requestId: string) {
  return useQuery<Dispute | null>({
    queryKey: ['disputes', 'request', requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('disputes')
        .select('*')
        .eq('request_id', requestId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!requestId,
  });
}

export function useOpenDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      reason,
      description,
    }: {
      requestId: string;
      reason: string;
      description: string;
    }) => {
      const { data, error } = await supabase.rpc('open_dispute', {
        p_request_id: requestId,
        p_reason: reason,
        p_description: description,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['disputes', 'request', variables.requestId],
      });
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
      queryClient.invalidateQueries({
        queryKey: ['request', variables.requestId],
      });
    },
  });
}

export function useResolveDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      disputeId,
      resolution,
    }: {
      disputeId: string;
      resolution: string;
    }) => {
      const { data, error } = await supabase.rpc('resolve_dispute', {
        p_dispute_id: disputeId,
        p_resolution: resolution,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
    },
  });
}
