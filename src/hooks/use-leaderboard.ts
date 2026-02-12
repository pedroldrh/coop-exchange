import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function useLeaderboard(limit = 5) {
  return useQuery<Profile[]>({
    queryKey: ['leaderboard', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role_preference', 'seller')
        .gt('completed_count', 0)
        .order('completed_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Profile[];
    },
    staleTime: 60_000, // refresh every minute
  });
}
