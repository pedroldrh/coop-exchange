import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from './ui/Button';
import type { RequestWithProfiles } from '../types/models';

interface OrderActionsProps {
  request: RequestWithProfiles;
  currentUserId: string;
  onAction: (actionName: string, data?: Record<string, unknown>) => void;
  loading: boolean;
}

export function OrderActions({
  request,
  currentUserId,
  onAction,
  loading,
}: OrderActionsProps) {
  const isBuyer = currentUserId === request.buyer_id;
  const isSeller = currentUserId === request.seller_id;
  const { status } = request;

  const canCancel =
    status === 'requested' || status === 'accepted';
  const canDispute =
    status === 'ordered' || status === 'picked_up' || status === 'completed';

  return (
    <View style={styles.container}>
      {/* Requested + Seller: Accept or Decline */}
      {status === 'requested' && isSeller && (
        <View style={styles.row}>
          <View style={styles.flex}>
            <Button
              title="Accept"
              onPress={() => onAction('accept')}
              variant="primary"
              loading={loading}
              fullWidth
            />
          </View>
          <View style={styles.gap} />
          <View style={styles.flex}>
            <Button
              title="Decline"
              onPress={() => onAction('decline')}
              variant="danger"
              loading={loading}
              fullWidth
            />
          </View>
        </View>
      )}

      {/* Accepted + Seller (Sharer): Mark as Ordered */}
      {status === 'accepted' && isSeller && (
        <Button
          title="Mark as Ordered"
          onPress={() => onAction('mark_ordered')}
          variant="primary"
          loading={loading}
          fullWidth
        />
      )}

      {/* Ordered + Buyer: Mark Picked Up */}
      {status === 'ordered' && isBuyer && (
        <Button
          title="Mark Picked Up"
          onPress={() => onAction('mark_picked_up')}
          variant="primary"
          loading={loading}
          fullWidth
        />
      )}

      {/* Picked Up + Either: Mark Completed */}
      {status === 'picked_up' && (isBuyer || isSeller) && (
        <Button
          title="Mark Completed"
          onPress={() => onAction('mark_completed')}
          variant="primary"
          loading={loading}
          fullWidth
        />
      )}

      {/* Secondary actions row */}
      <View style={styles.secondaryRow}>
        {/* Cancel button */}
        {canCancel && (isBuyer || isSeller) && (
          <View style={styles.flex}>
            <Button
              title="Cancel"
              onPress={() => onAction('cancel')}
              variant="secondary"
              loading={loading}
              fullWidth
            />
          </View>
        )}

        {/* Open Dispute button */}
        {canDispute && (isBuyer || isSeller) && (
          <View style={styles.flex}>
            <Button
              title="Open Dispute"
              onPress={() => onAction('open_dispute')}
              variant="ghost"
              loading={loading}
              fullWidth
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  flex: {
    flex: 1,
  },
  gap: {
    width: 10,
  },
});
