import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';
import { useAuth } from './use-auth';

type Message = Database['public']['Tables']['messages']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

type MessageWithSender = Message & {
  sender: Profile;
};

export function useMessages(requestId: string) {
  return useQuery<MessageWithSender[]>({
    queryKey: ['messages', requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:profiles!sender_id(*)')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as MessageWithSender[];
    },
    enabled: !!requestId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      requestId,
      body,
    }: {
      requestId: string;
      body: string;
    }) => {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          request_id: requestId,
          sender_id: user!.id,
          body,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['messages', variables.requestId],
      });
    },
  });
}

export function useMessagesRealtime(requestId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!requestId) return;

    const channel = supabase
      .channel(`messages-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `request_id=eq.${requestId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message;

          // Fetch the sender profile for the new message
          const { data: sender } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', newMessage.sender_id)
            .single();

          const messageWithSender: MessageWithSender = {
            ...newMessage,
            sender: sender as Profile,
          };

          queryClient.setQueryData<MessageWithSender[]>(
            ['messages', requestId],
            (old) => {
              if (!old) return [messageWithSender];
              // Avoid duplicates
              const exists = old.some((m) => m.id === newMessage.id);
              if (exists) return old;
              return [...old, messageWithSender];
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId, queryClient]);
}
