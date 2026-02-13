import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../../types/navigation';
import { useAuth } from '../../hooks/use-auth';
import { useProfile } from '../../hooks/use-profile';
import { useMyPosts } from '../../hooks/use-posts';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loading } from '../../components/ui/Loading';
import { WebContainer } from '../../components/ui/WebContainer';
import { StarDisplay } from '../../components/StarDisplay';
import { PostCard } from '../../components/PostCard';
import { BadgeDisplay } from '../../components/BadgeDisplay';
import { Avatar } from '../../components/Avatar';
import { showAlert, showConfirm } from '../../lib/utils';
import { theme } from '../../lib/theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

export function ProfileScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const { data: myPosts } = useMyPosts();

  const displayPosts = myPosts?.slice(0, 5) ?? [];
  const hasMorePosts = (myPosts?.length ?? 0) > 5;

  const handleSignOut = useCallback(async () => {
    const confirmed = await showConfirm(
      'Sign Out',
      'Are you sure you want to sign out?',
    );
    if (!confirmed) return;

    try {
      await signOut();
    } catch (err: any) {
      showAlert('Error', err?.message ?? 'Failed to sign out');
    }
  }, [signOut]);

  if (isLoading || !profile) {
    return <Loading message="Loading profile..." />;
  }

  const roleLabel =
    profile.role_preference === 'admin'
      ? 'Admin'
      : 'Member';

  return (
    <WebContainer>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Colored background strip */}
        <View style={styles.profileHeaderBg}>
          <View style={styles.profileHeader}>
            <View style={{ marginBottom: 12 }}>
              <Avatar name={profile.name} avatarUrl={profile.avatar_url} size={80} />
            </View>
            <Text style={styles.userName}>{profile.name ?? 'Anonymous'}</Text>
            <Text style={styles.userEmail}>{profile.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{roleLabel}</Text>
            </View>
          </View>
        </View>

        {/* Stats mini-cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statMiniCard, { backgroundColor: theme.colors.warningLight }]}>
            <Text style={styles.statLabel}>Rating</Text>
            <StarDisplay
              rating={profile.rating_avg}
              size={16}
              showValue
            />
          </View>
          <View style={[styles.statMiniCard, { backgroundColor: theme.colors.primarySurface }]}>
            <Text style={styles.statLabel}>Swipes</Text>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
              {profile.completed_count}
            </Text>
          </View>
          <View style={[styles.statMiniCard, { backgroundColor: theme.colors.dangerLight }]}>
            <Text style={styles.statLabel}>Cancelled</Text>
            <Text style={[styles.statValue, { color: theme.colors.danger }]}>
              {profile.cancel_count}
            </Text>
          </View>
        </View>

        {/* Badges */}
        <Card style={styles.badgesCard}>
          <Text style={styles.sectionTitle}>Badges</Text>
          <BadgeDisplay completedCount={profile.completed_count} />
        </Card>

        {/* My Swipe Shares */}
        <View style={styles.postsSection}>
          <View style={styles.postsSectionHeader}>
            <Text style={styles.sectionTitle}>My Swipe Shares</Text>
            {hasMorePosts && (
              <Pressable onPress={() => {}}>
                <Text style={styles.seeAllText}>See all</Text>
              </Pressable>
            )}
          </View>

          {displayPosts.length > 0 ? (
            displayPosts.map((post) => (
              <PostCard key={post.id} post={post} onPress={() => {}} />
            ))
          ) : (
            <Text style={styles.emptyText}>No posts yet</Text>
          )}
        </View>

        <View style={styles.actions}>
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="ghost"
            fullWidth
          />
        </View>
      </ScrollView>
    </WebContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray50,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  profileHeaderBg: {
    backgroundColor: theme.colors.primarySurface,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.gray900,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.gray500,
    marginBottom: 8,
  },
  roleBadge: {
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primaryLight,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: -16,
    marginBottom: 12,
  },
  statMiniCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: theme.radius.lg,
    gap: 4,
    ...theme.shadow.sm,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.gray900,
    marginBottom: 12,
  },
  badgesCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  postsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  postsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.gray400,
    textAlign: 'center',
    paddingVertical: 20,
  },
  actions: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
});
