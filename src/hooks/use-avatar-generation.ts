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
  const attempted = useRef(false);

  useEffect(() => {
    if (!user || !profile) return;
    if (profile.avatar_url) return;
    if (!profile.name) return;
    if (attempted.current) return;

    attempted.current = true;

    console.log('[Avatar] Generating avatar for', profile.name);

    fetch('/api/generate-avatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        nickname: profile.name,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        console.log('[Avatar] Response:', res.status, data);
        if (res.ok) {
          queryClient.invalidateQueries({ queryKey: ['profile'] });
        } else {
          // Allow retry on next mount
          attempted.current = false;
        }
      })
      .catch((err) => {
        console.error('[Avatar] Error:', err);
        attempted.current = false;
      });
  }, [user, profile, queryClient]);
}
