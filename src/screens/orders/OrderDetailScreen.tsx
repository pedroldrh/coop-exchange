import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Linking,
  Pressable,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { FeedStackParamList } from '../../types/navigation';
import { useAuth } from '../../hooks/use-auth';
import { useOrderDetailState } from '../../hooks/use-order-detail';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loading } from '../../components/ui/Loading';
import { Modal } from '../../components/ui/Modal';
import { WebContainer } from '../../components/ui/WebContainer';
import { StatusTimeline } from '../../components/StatusTimeline';
import { OrderActions } from '../../components/OrderActions';
import { ProofImage } from '../../components/ProofImage';
import { ChatSection } from '../../components/ChatSection';
import { RatingModal } from '../../components/RatingModal';
import { FizzShareModal } from '../../components/FizzShareModal';
import { Avatar } from '../../components/Avatar';
import { STATUS_LABELS } from '../../lib/constants';
import type { RequestStatus } from '../../lib/constants';
import { theme } from '../../lib/theme';

type Props = NativeStackScreenProps<FeedStackParamList, 'OrderDetail'>;

export function OrderDetailScreen({ route }: Props) {
  const { requestId } = route.params;
  const { user } = useAuth();
  const state = useOrderDetailState(requestId, user?.id);

  if (state.isLoading || !state.request) {
    return <Loading message="Loading order..." />;
  }

  const { request, dispute } = state;
  const statusColor = theme.statusColors[request.status] ?? theme.colors.gray500;
  const statusLabel =
    STATUS_LABELS[request.status as RequestStatus] ?? request.status;

  return (
    <WebContainer>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={state.isRefetching}
              onRefresh={state.refetch}
              tintColor={theme.colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Header with accent bar */}
          <Card style={styles.headerCard}>
            <View style={[styles.headerAccent, { backgroundColor: statusColor }]} />
            <View style={styles.headerRow}>
              <View style={styles.headerParty}>
                <Avatar name={request.buyer.name} avatarUrl={request.buyer.avatar_url} size={44} />
                <Text style={styles.headerPartyLabel}>Requester</Text>
                <Text style={styles.headerPartyName}>
                  {request.buyer.name ?? 'Anonymous'}
                </Text>
              </View>
              <View style={styles.headerDivider} />
              <View style={styles.headerParty}>
                <Avatar name={request.seller.name} avatarUrl={request.seller.avatar_url} size={44} />
                <Text style={styles.headerPartyLabel}>Sharer</Text>
                <Text style={styles.headerPartyName}>
                  {request.seller.name ?? 'Anonymous'}
                </Text>
              </View>
            </View>
            <View style={styles.roleRow}>
              <Badge
                label={`You are the ${state.roleLabel}`}
                color={state.isBuyer ? theme.colors.primaryLight : theme.colors.primary}
                variant="soft"
              />
              <Badge label={statusLabel} color={statusColor} variant="soft" />
            </View>
          </Card>

          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Progress</Text>
            <StatusTimeline currentStatus={request.status} />
          </Card>

          {/* Request Details */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Request Details</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Items</Text>
              <Text style={styles.infoValue}>{request.items_text}</Text>
            </View>
            {request.instructions && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Instructions</Text>
                <Text style={styles.infoValue}>{request.instructions}</Text>
              </View>
            )}
          </Card>

          {/* Pickup Info */}
          {request.order_id_text && state.isBuyer && (
            <Card style={styles.pickupCard}>
              <Text style={styles.pickupTitle}>Pickup Info</Text>
              <Text style={styles.pickupInitials}>{request.order_id_text}</Text>
              <Text style={styles.pickupHint}>
                Look for this name/initials on the ticket at the Coop pickup area
              </Text>
            </Card>
          )}

          {/* Order Proof */}
          {request.ordered_proof_path && (
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Order Proof</Text>
              <View style={styles.proofContainer}>
                <ProofImage path={request.ordered_proof_path} label="Order Proof" />
              </View>
            </Card>
          )}

          {/* Mobile Order Link */}
          {request.status === 'accepted' && state.isSeller && (
            <Card style={styles.sectionCard}>
              <Pressable
                style={({ pressed }) => [
                  styles.mobileOrderButton,
                  pressed && styles.mobileOrderButtonPressed,
                ]}
                onPress={() => {
                  Linking.openURL('https://apps.apple.com/us/app/transact-mobile-ordering/id1494719529');
                }}
              >
                <Text style={styles.mobileOrderButtonText}>
                  Open W&L Mobile Order App
                </Text>
                <Text style={styles.mobileOrderHint}>
                  Order food for this request
                </Text>
              </Pressable>
            </Card>
          )}

          {/* Actions */}
          {request.status !== 'completed' &&
            request.status !== 'cancelled' &&
            request.status !== 'disputed' && (
              <Card style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Actions</Text>
                <OrderActions
                  request={request}
                  currentUserId={user!.id}
                  onAction={state.handleAction}
                  loading={state.actionLoading || state.uploading}
                />
              </Card>
            )}

          {/* Dispute Card */}
          {dispute && (
            <Card
              style={[
                styles.sectionCard,
                {
                  borderLeftWidth: 4,
                  borderLeftColor: theme.colors.danger,
                },
              ]}
            >
              <Text style={styles.sectionTitle}>Dispute</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status</Text>
                <Badge
                  label={dispute.status === 'open' ? 'Open' : 'Resolved'}
                  color={
                    dispute.status === 'open' ? theme.colors.danger : theme.colors.success
                  }
                  size="sm"
                  variant="soft"
                />
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Reason</Text>
                <Text style={styles.infoValue}>{dispute.reason}</Text>
              </View>
              {dispute.description && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Description</Text>
                  <Text style={styles.infoValue}>{dispute.description}</Text>
                </View>
              )}
              {dispute.resolution && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Resolution</Text>
                  <Text style={styles.infoValue}>{dispute.resolution}</Text>
                </View>
              )}
            </Card>
          )}

          {/* Messages */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Messages</Text>
            <ChatSection requestId={requestId} currentUserId={user!.id} />
          </Card>
        </ScrollView>

        {/* Cancel Modal */}
        <Modal
          visible={state.showCancelModal}
          onClose={() => state.setShowCancelModal(false)}
          title="Cancel Order"
        >
          <Input
            label="Reason *"
            placeholder="Why are you cancelling?"
            value={state.cancelReason}
            onChangeText={state.setCancelReason}
            multiline
            numberOfLines={3}
          />
          <View style={styles.modalActions}>
            <Button
              title="Cancel Order"
              onPress={state.handleSubmitCancel}
              variant="danger"
              loading={state.cancelRequestPending}
              fullWidth
            />
          </View>
        </Modal>

        {/* Dispute Modal */}
        <Modal
          visible={state.showDisputeModal}
          onClose={() => state.setShowDisputeModal(false)}
          title="Open Dispute"
        >
          <Input
            label="Reason *"
            placeholder="Brief reason for the dispute"
            value={state.disputeReason}
            onChangeText={state.setDisputeReason}
          />
          <Input
            label="Description"
            placeholder="Provide more details..."
            value={state.disputeDescription}
            onChangeText={state.setDisputeDescription}
            multiline
            numberOfLines={4}
          />
          <View style={styles.modalActions}>
            <Button
              title="Submit Dispute"
              onPress={state.handleSubmitDispute}
              variant="danger"
              loading={state.openDisputePending}
              fullWidth
            />
          </View>
        </Modal>

        <RatingModal
          visible={state.showRatingModal}
          onClose={() => {
            state.setShowRatingModal(false);
            state.chainFizzModal();
          }}
          onSubmit={state.handleSubmitRating}
          loading={state.submitRatingPending}
        />

        <FizzShareModal
          visible={state.showFizzShareModal}
          onClose={() => state.setShowFizzShareModal(false)}
          requestId={requestId}
          role={state.isSeller ? 'giver' : 'receiver'}
        />
      </View>
    </WebContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray50,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerCard: {
    marginBottom: 16,
    overflow: 'hidden',
    padding: 0,
  },
  headerAccent: {
    height: 3,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerParty: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  headerPartyLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.gray400,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerPartyName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.gray900,
    textAlign: 'center',
  },
  headerDivider: {
    width: 12,
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.gray900,
    marginBottom: 10,
  },
  infoRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray100,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.gray400,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.gray700,
    lineHeight: 20,
  },
  proofContainer: {
    marginBottom: 12,
  },
  pickupCard: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.successSurface,
    borderWidth: 1,
    borderColor: theme.colors.successBorder,
  },
  pickupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.successDark,
    marginBottom: 8,
  },
  pickupInitials: {
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.successDark,
    letterSpacing: 4,
    marginBottom: 8,
  },
  pickupHint: {
    fontSize: 13,
    color: theme.colors.successMedium,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalActions: {
    marginTop: 8,
  },
  mobileOrderButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  mobileOrderButtonPressed: {
    opacity: 0.85,
  },
  mobileOrderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: 4,
  },
  mobileOrderHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
});
