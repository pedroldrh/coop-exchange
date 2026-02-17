import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';
import type { PostWithSeller } from '../types/models';
import { useAuth } from './use-auth';

export function usePosts() {
  return useQuery<PostWithSeller[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, seller:profiles!seller_id(*)')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PostWithSeller[];
    },
  });
}

export function usePost(postId: string) {
  return useQuery<PostWithSeller>({
    queryKey: ['post', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, seller:profiles!seller_id(*)')
        .eq('id', postId)
        .single();

      if (error) throw error;
      return data as PostWithSeller;
    },
    enabled: !!postId,
  });
}

export function useMyPosts() {
  const { user } = useAuth();

  return useQuery<PostWithSeller[]>({
    queryKey: ['posts', 'mine'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, seller:profiles!seller_id(*)')
        .eq('seller_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PostWithSeller[];
    },
    enabled: !!user,
  });
}

export function usePostsRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('posts-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      post: Omit<
        Database['public']['Tables']['posts']['Row'],
        'id' | 'created_at' | 'updated_at' | 'seller_id' | 'status'
      >
    ) => {
      const { data, error } = await supabase
        .from('posts')
        .insert({ ...post, seller_id: user!.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
