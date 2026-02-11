import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../../hooks/use-auth';
import { useDisputes, useResolveDispute } from '../../hooks/use-disputes';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loading } from '../../components/ui/Loading';
import type { Dispute } from '../../types/database';

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

function DisputeItem({
  dispute,
  onResolve,
}: {
  dispute: Dispute;
  onResolve: (disputeId: string, resolution: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [resolution, setResolution] = useState('');
  const [resolving, setResolving] = useState(false);

  const handleResolve = async () => {
    if (!resolution.trim()) {
      Alert.alert('Error', 'Please enter a resolution');
      return;
    }

    setResolving(true);
    try {
      await onResolve(dispute.id, resolution.trim());
      setResolution('');
      setExpanded(false);
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to resolve dispute');
    } finally {
      setResolving(false);
    }
  };

  return (
    <Card style={styles.disputeCard}>
      <Pressable onPress={() => setExpanded(!expanded)}>
        <View style={styles.disputeHeader}>
          <View style={styles.disputeInfo}>
            <Badge
              label={dispute.status === 'open' ? 'Open' : 'Resolved'}
              color={dispute.status === 'open' ? colors.danger : colors.success}
              size="sm"
            />
            <Text style={styles.disputeReason} numberOfLines={expanded ? undefined : 1}>
              {dispute.reason}
            </Text>
          </View>
          <Text style={styles.expandIcon}>{expanded ? '−' : '+'}</Text>
        </View>

        <Text style={styles.disputeMeta}>
          Request: {dispute.request_id.slice(0, 8)}...
        </Text>
        <Text style={styles.disputeMeta}>
          Opened by: {dispute.opener_id.slice(0, 8)}...
        </Text>
      </Pressable>

      {expanded && (
        <View style={styles.expandedContent}>
          {dispute.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.descriptionLabel}>Description</Text>
              <Text style={styles.descriptionText}>{dispute.description}</Text>
            </View>
          )}

          {dispute.status === 'open' && (
            <View style={styles.resolveSection}>
              <Input
                label="Resolution"
                placeholder="Describe how this dispute was resolved..."
                value={resolution}
                onChangeText={setResolution}
                multiline
                numberOfLines={3}
              />
              <Button
                title="Resolve Dispute"
                onPress={handleResolve}
                variant="primary"
                loading={resolving}
                fullWidth
              />
            </View>
          )}

          {dispute.resolution && (
            <View style={styles.descriptionSection}>
              <Text style={styles.descriptionLabel}>Resolution</Text>
              <Text style={styles.descriptionText}>{dispute.resolution}</Text>
            </View>
          )}
        </View>
      )}
    </Card>
  );
}

export function AdminScreen() {
  const { isAdmin } = useAuth();
  const {
    data: disputes,
    isLoading,
    refetch,
    isRefetching,
  } = useDisputes();
  const resolveDispute = useResolveDispute();

  const openDisputes =
    disputes?.filter((d) => d.status === 'open') ?? [];

  const handleResolve = useCallback(
    async (disputeId: string, resolution: string) => {
      await resolveDispute.mutateAsync({ disputeId, resolution });
    },
    [resolveDispute],
  );

  if (!isAdmin) {
    return (
      <View style={styles.unauthorizedContainer}>
        <Text style={styles.unauthorizedIcon}>🔒</Text>
        <Text style={styles.unauthorizedTitle}>Access Denied</Text>
        <Text style={styles.unauthorizedText}>
          This area is restricted to admin users.
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return <Loading message="Loading admin panel..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Admin Panel</Text>
        <Text style={styles.subheading}>
          Manage disputes and monitor platform activity
        </Text>
      </View>

      {/* Open Disputes Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Open Disputes</Text>
          <Badge
            label={`${openDisputes.length}`}
            color={openDisputes.length > 0 ? colors.danger : colors.success}
            size="sm"
          />
        </View>

        {openDisputes.length > 0 ? (
          openDisputes.map((dispute) => (
            <DisputeItem
              key={dispute.id}
              dispute={dispute}
              onResolve={handleResolve}
            />
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No open disputes</Text>
          </Card>
        )}
      </View>

      {/* User Management Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Management</Text>
        <Card style={styles.infoCard}>
          <Text style={styles.infoText}>
            User management is available via the Supabase dashboard for this
            MVP. From there you can view user profiles, ban/unban users, and
            modify role preferences.
          </Text>
        </Card>
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
  header: {
    padding: 20,
    paddingBottom: 8,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: colors.gray500,
    marginBottom: 12,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.gray900,
  },
  disputeCard: {
    marginBottom: 10,
  },
  disputeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  disputeInfo: {
    flex: 1,
    gap: 6,
  },
  disputeReason: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.gray900,
  },
  expandIcon: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray400,
    paddingLeft: 12,
  },
  disputeMeta: {
    fontSize: 12,
    color: colors.gray400,
    marginTop: 2,
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  descriptionSection: {
    marginBottom: 12,
  },
  descriptionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray400,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.gray700,
    lineHeight: 20,
  },
  resolveSection: {
    gap: 0,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray400,
  },
  infoCard: {
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.gray600,
    lineHeight: 22,
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    padding: 24,
  },
  unauthorizedIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  unauthorizedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: 8,
  },
  unauthorizedText: {
    fontSize: 14,
    color: colors.gray500,
    textAlign: 'center',
  },
});
