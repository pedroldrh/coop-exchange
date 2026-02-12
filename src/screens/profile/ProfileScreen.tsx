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
import { StarDisplay } from '../../components/StarDisplay';
import { PostCard } from '../../components/PostCard';
import { BadgeDisplay } from '../../components/BadgeDisplay';
import { Avatar } from '../../components/Avatar';
import { showAlert, showConfirm } from '../../lib/utils';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

const colors = {
  primary: '#4F46E5',
  primaryLight: '#818CF8',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray900: '#111827',
  white: '#FFFFFF',
};

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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={{ marginBottom: 12 }}>
          <Avatar name={profile.name} size={80} />
        </View>
        <Text style={styles.userName}>{profile.name ?? 'Anonymous'}</Text>
        <Text style={styles.userEmail}>{profile.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{roleLabel}</Text>
        </View>
      </View>

      {/* Stats Card */}
      <Card style={styles.statsCard}>
        <Text style={styles.sectionTitle}>Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Rating</Text>
            <StarDisplay
              rating={profile.rating_avg}
              size={18}
              showValue
            />
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Swipes Shared</Text>
            <Text style={[styles.statValue, styles.statPrimary]}>
              {profile.completed_count}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Cancelled</Text>
            <Text style={[styles.statValue, styles.statDanger]}>
              {profile.cancel_count}
            </Text>
          </View>
        </View>
      </Card>

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

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="ghost"
          fullWidth
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: colors.gray500,
    marginBottom: 8,
  },
  roleBadge: {
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  statsCard: {
    margin: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray400,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.gray900,
  },
  statDanger: {
    color: colors.danger,
  },
  statPrimary: {
    color: colors.primary,
  },
  badgesCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  venmoCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  venmoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  venmoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray500,
  },
  venmoHandle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
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
    color: colors.primary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray400,
    textAlign: 'center',
    paddingVertical: 20,
  },
  actions: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  actionGap: {
    height: 10,
  },
});
