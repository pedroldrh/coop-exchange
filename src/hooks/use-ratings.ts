import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';

type Rating = Database['public']['Tables']['ratings']['Row'];

export function useRatings(userId: string) {
  return useQuery<Rating[]>({
    queryKey: ['ratings', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('ratee_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useRequestRating(requestId: string) {
  return useQuery<Rating[]>({
    queryKey: ['ratings', 'request', requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('request_id', requestId);

      if (error) throw error;
      return data;
    },
    enabled: !!requestId,
  });
}

export function useSubmitRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      stars,
      comment,
    }: {
      requestId: string;
      stars: number;
      comment?: string;
    }) => {
      const { data, error } = await supabase.rpc('submit_rating', {
        p_request_id: requestId,
        p_stars: stars,
        p_comment: comment ?? undefined,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['ratings', 'request', variables.requestId],
      });
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
    },
  });
}
