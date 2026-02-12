import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';
import { useAuth } from './use-auth';

type Request = Database['public']['Tables']['requests']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Post = Database['public']['Tables']['posts']['Row'];

type RequestWithDetails = Request & {
  buyer: Profile;
  seller: Profile;
  post: Post;
};

export function useRequest(requestId: string) {
  return useQuery<RequestWithDetails>({
    queryKey: ['request', requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('requests')
        .select(
          '*, buyer:profiles!buyer_id(*), seller:profiles!seller_id(*), post:posts!post_id(*)'
        )
        .eq('id', requestId)
        .single();

      if (error) throw error;
      return data as RequestWithDetails;
    },
    enabled: !!requestId,
  });
}

export function useMyRequests() {
  const { user } = useAuth();

  return useQuery<RequestWithDetails[]>({
    queryKey: ['requests', 'mine'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('requests')
        .select(
          '*, buyer:profiles!buyer_id(*), seller:profiles!seller_id(*), post:posts!post_id(*)'
        )
        .or(`buyer_id.eq.${user!.id},seller_id.eq.${user!.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as RequestWithDetails[];
    },
    enabled: !!user,
  });
}

export function useRequestsByPost(postId: string) {
  return useQuery<RequestWithDetails[]>({
    queryKey: ['requests', 'post', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('requests')
        .select(
          '*, buyer:profiles!buyer_id(*), seller:profiles!seller_id(*), post:posts!post_id(*)'
        )
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RequestWithDetails[];
    },
    enabled: !!postId,
  });
}

export function useHasShared() {
  const { user } = useAuth();

  return useQuery<boolean>({
    queryKey: ['has-shared', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('requests')
        .select('id', { count: 'exact', head: true })
        .eq('seller_id', user!.id)
        .eq('status', 'completed');

      if (error) throw error;
      return (count ?? 0) > 0;
    },
    enabled: !!user,
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      request: Omit<
        Database['public']['Tables']['requests']['Row'],
        'id' | 'created_at' | 'updated_at' | 'buyer_id' | 'status'
      >
    ) => {
      const { data, error } = await supabase
        .from('requests')
        .insert({ ...request, buyer_id: user!.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
}

export function useAcceptRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { data, error } = await supabase.rpc('accept_request', {
        p_request_id: requestId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, requestId) => {
      queryClient.invalidateQueries({ queryKey: ['request', requestId] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
}

export function useDeclineRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { data, error } = await supabase.rpc('decline_request', {
        p_request_id: requestId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, requestId) => {
      queryClient.invalidateQueries({ queryKey: ['request', requestId] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
}

export function useMarkOrdered() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      orderedProofPath,
      orderIdText,
    }: {
      requestId: string;
      orderedProofPath: string;
      orderIdText: string;
    }) => {
      const { data, error } = await supabase.rpc('mark_ordered', {
        p_request_id: requestId,
        p_ordered_proof_path: orderedProofPath,
        p_order_id_text: orderIdText,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['request', variables.requestId],
      });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
}

export function useMarkPickedUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { data, error } = await supabase.rpc('mark_picked_up', {
        p_request_id: requestId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, requestId) => {
      queryClient.invalidateQueries({ queryKey: ['request', requestId] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
}

export function useMarkCompleted() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { data, error } = await supabase.rpc('mark_completed', {
        p_request_id: requestId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, requestId) => {
      queryClient.invalidateQueries({ queryKey: ['request', requestId] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
}

export function useCancelRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      reason,
    }: {
      requestId: string;
      reason: string;
    }) => {
      const { data, error } = await supabase.rpc('cancel_request', {
        p_request_id: requestId,
        p_reason: reason,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['request', variables.requestId],
      });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
}

export function useRequestRealtime(requestId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!requestId) return;

    const channel = supabase
      .channel(`request-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'requests',
          filter: `id=eq.${requestId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['request', requestId] });
          queryClient.invalidateQueries({ queryKey: ['requests'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId, queryClient]);
}
