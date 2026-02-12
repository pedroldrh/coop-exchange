import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './use-auth';
import { useProfile } from './use-profile';

/**
 * Automatically generates a DALL-E avatar when a user has a nickname
 * but no avatar_url yet. Runs once after login.
 */
export function useAvatarGeneration() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const generating = useRef(false);

  useEffect(() => {
    if (!user || !profile || profile.avatar_url || generating.current) return;
    if (!profile.name) return;

    generating.current = true;

    fetch('/api/generate-avatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        nickname: profile.name,
      }),
    })
      .then((res) => {
        if (res.ok) {
          queryClient.invalidateQueries({ queryKey: ['profile'] });
        }
      })
      .catch(() => {})
      .finally(() => {
        generating.current = false;
      });
  }, [user, profile, queryClient]);
}
