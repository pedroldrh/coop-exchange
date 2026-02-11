import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { formatRelativeTime, truncateText } from '../lib/utils';
import { STATUS_LABELS } from '../lib/constants';
import type { Request, Profile } from '../types/database';
import type { RequestStatus } from '../lib/constants';

const STATUS_COLORS: Record<string, string> = {
  requested: '#6B7280',
  accepted: '#3B82F6',
  paid: '#8B5CF6',
  ordered: '#F59E0B',
  picked_up: '#F97316',
  completed: '#10B981',
  cancelled: '#EF4444',
  disputed: '#DC2626',
};

const colors = {
  primary: '#4F46E5',
  primaryLight: '#818CF8',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray700: '#374151',
  gray900: '#111827',
  white: '#FFFFFF',
};

type RequestWithProfiles = Request & {
  buyer: Profile;
  seller: Profile;
};

interface RequestCardProps {
  request: RequestWithProfiles;
  currentUserId: string;
  onPress: () => void;
}

export function RequestCard({
  request,
  currentUserId,
  onPress,
}: RequestCardProps) {
  const isBuyer = currentUserId === request.buyer_id;
  const roleLabel = isBuyer ? "You're requesting" : "You're fulfilling";
  const otherParty = isBuyer ? request.seller : request.buyer;
  const otherName = otherParty?.name ?? 'Anonymous';

  const statusColor = STATUS_COLORS[request.status] ?? colors.gray500;
  const statusLabel = STATUS_LABELS[request.status as RequestStatus] ?? request.status;

  return (
    <Card onPress={onPress} style={styles.card}>
      {/* Role label */}
      <View style={styles.header}>
        <View
          style={[
            styles.roleBadge,
            { backgroundColor: isBuyer ? colors.primaryLight : colors.primary },
          ]}
        >
          <Text style={styles.roleText}>{roleLabel}</Text>
        </View>
        <Text style={styles.timeAgo}>
          {formatRelativeTime(request.created_at)}
        </Text>
      </View>

      {/* Other party name */}
      <Text style={styles.otherName}>{otherName}</Text>

      {/* Items text */}
      {request.items_text && (
        <Text style={styles.itemsText} numberOfLines={2}>
          {truncateText(request.items_text, 100)}
        </Text>
      )}

      {/* Status badge */}
      <View style={styles.footer}>
        <Badge label={statusLabel} color={statusColor} size="sm" />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleBadge: {
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.white,
  },
  timeAgo: {
    fontSize: 12,
    color: colors.gray400,
  },
  otherName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 4,
  },
  itemsText: {
    fontSize: 14,
    color: colors.gray700,
    lineHeight: 20,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
