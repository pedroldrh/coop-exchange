import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { formatRelativeTime, truncateText } from '../lib/utils';
import { STATUS_LABELS } from '../lib/constants';
import { theme } from '../lib/theme';
import type { RequestStatus } from '../lib/constants';
import type { RequestWithProfiles } from '../types/models';

interface RequestCardProps {
  request: RequestWithProfiles;
  currentUserId: string;
  onPress: () => void;
}

export const RequestCard = React.memo(function RequestCard({
  request,
  currentUserId,
  onPress,
}: RequestCardProps) {
  const isBuyer = currentUserId === request.buyer_id;
  const roleLabel = isBuyer ? "You're requesting" : "You're fulfilling";
  const otherParty = isBuyer ? request.seller : request.buyer;
  const otherName = otherParty?.name ?? 'Anonymous';

  const statusColor = theme.statusColors[request.status] ?? theme.colors.gray500;
  const statusLabel = STATUS_LABELS[request.status as RequestStatus] ?? request.status;

  return (
    <Card onPress={onPress} style={styles.card}>
      {/* Role label */}
      <View style={styles.header}>
        <Badge
          label={roleLabel}
          color={isBuyer ? theme.colors.primaryLight : theme.colors.primary}
          size="sm"
          variant="soft"
        />
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

      {/* Divider */}
      <View style={styles.divider} />

      {/* Status badge */}
      <View style={styles.footer}>
        <Badge label={statusLabel} color={statusColor} size="sm" variant="soft" />
      </View>
    </Card>
  );
});

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
  timeAgo: {
    fontSize: 12,
    color: theme.colors.gray400,
  },
  otherName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.gray900,
    marginBottom: 4,
  },
  itemsText: {
    fontSize: 14,
    color: theme.colors.gray700,
    lineHeight: 20,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.gray100,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
