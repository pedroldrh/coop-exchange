import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  RefreshControl,
  Linking,
  Pressable,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { FeedStackParamList } from '../../types/navigation';
import { useAuth } from '../../hooks/use-auth';
import {
  useRequest,
  useRequestRealtime,
  useAcceptRequest,
  useDeclineRequest,
  useMarkPaid,
  useMarkOrdered,
  useMarkPickedUp,
  useMarkCompleted,
  useCancelRequest,
} from '../../hooks/use-requests';
import { useRequestRating, useSubmitRating } from '../../hooks/use-ratings';
import { useRequestDispute, useOpenDispute } from '../../hooks/use-disputes';
import { useImageUpload } from '../../hooks/use-image-upload';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loading } from '../../components/ui/Loading';
import { Modal } from '../../components/ui/Modal';
import { StatusTimeline } from '../../components/StatusTimeline';
import { OrderActions } from '../../components/OrderActions';
import { ProofImage } from '../../components/ProofImage';
import { ChatSection } from '../../components/ChatSection';
import { RatingModal } from '../../components/RatingModal';
import { STATUS_LABELS } from '../../lib/constants';
import type { RequestStatus } from '../../lib/constants';
import { showAlert } from '../../lib/utils';

type Props = NativeStackScreenProps<FeedStackParamList, 'OrderDetail'>;

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
  gray800: '#1F2937',
  gray900: '#111827',
  white: '#FFFFFF',
};

export function OrderDetailScreen({ route }: Props) {
  const { requestId } = route.params;
  const { user } = useAuth();

  // Data hooks
  const {
    data: request,
    isLoading,
    refetch,
    isRefetching,
  } = useRequest(requestId);
  const { data: ratings } = useRequestRating(requestId);
  const { data: dispute } = useRequestDispute(requestId);

  // Realtime
  useRequestRealtime(requestId);

  // Mutation hooks
  const acceptRequest = useAcceptRequest();
  const declineRequest = useDeclineRequest();
  const markPaid = useMarkPaid();
  const markOrdered = useMarkOrdered();
  const markPickedUp = useMarkPickedUp();
  const markCompleted = useMarkCompleted();
  const cancelRequest = useCancelRequest();
  const openDispute = useOpenDispute();
  const submitRating = useSubmitRating();
  const { pickImage, takePhoto, uploadImage, uploading } = useImageUpload();

  // Local state
  const [actionLoading, setActionLoading] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Determine user role
  const isBuyer = user?.id === request?.buyer_id;
  const isSeller = user?.id === request?.seller_id;
  const roleLabel = isBuyer ? 'Requester' : isSeller ? 'Sharer' : '';

  // Auto-show rating modal after completion
  const hasRated =
    ratings?.some((r) => r.rater_id === user?.id) ?? false;

  useEffect(() => {
    if (
      request?.status === 'completed' &&
      !hasRated &&
      (isBuyer || isSeller)
    ) {
      const timer = setTimeout(() => setShowRatingModal(true), 500);
      return () => clearTimeout(timer);
    }
  }, [request?.status, hasRated, isBuyer, isSeller]);

  // Image selection helper (cross-platform)
  const selectImage = useCallback((): Promise<string | null> => {
    if (Platform.OS === 'web') {
      // On web, skip the action sheet and go straight to file picker
      return pickImage().catch(() => null);
    }

    return new Promise((resolve) => {
      Alert.alert('Upload Proof', 'Choose a method', [
        {
          text: 'Take Photo',
          onPress: async () => {
            try {
              const uri = await takePhoto();
              resolve(uri);
            } catch {
              resolve(null);
            }
          },
        },
        {
          text: 'Choose from Library',
          onPress: async () => {
            try {
              const uri = await pickImage();
              resolve(uri);
            } catch {
              resolve(null);
            }
          },
        },
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
      ]);
    });
  }, [pickImage, takePhoto]);

  // Action handler
  const handleAction = useCallback(
    async (actionName: string) => {
      if (!request || !user) return;
      setActionLoading(true);

      try {
        switch (actionName) {
          case 'accept':
            await acceptRequest.mutateAsync(requestId);
            break;

          case 'decline':
            await declineRequest.mutateAsync(requestId);
            break;

          case 'mark_paid': {
            const paidUri = await selectImage();
            if (!paidUri) {
              setActionLoading(false);
              return;
            }
            const paidPath = await uploadImage(paidUri, requestId, 'paid');
            await markPaid.mutateAsync({
              requestId,
              paidProofPath: paidPath,
              paidReference: '',
            });
            break;
          }

          case 'mark_ordered': {
            const orderedUri = await selectImage();
            if (!orderedUri) {
              setActionLoading(false);
              return;
            }
            const orderedPath = await uploadImage(
              orderedUri,
              requestId,
              'ordered',
            );
            await markOrdered.mutateAsync({
              requestId,
              orderedProofPath: orderedPath,
              orderIdText: '',
            });
            break;
          }

          case 'mark_picked_up':
            await markPickedUp.mutateAsync(requestId);
            break;

          case 'mark_completed':
            await markCompleted.mutateAsync(requestId);
            break;

          case 'cancel':
            setShowCancelModal(true);
            setActionLoading(false);
            return;

          case 'open_dispute':
            setShowDisputeModal(true);
            setActionLoading(false);
            return;

          default:
            break;
        }
      } catch (err: any) {
        showAlert('Error', err?.message ?? 'Action failed');
      } finally {
        setActionLoading(false);
      }
    },
    [
      request,
      user,
      requestId,
      acceptRequest,
      declineRequest,
      markPaid,
      markOrdered,
      markPickedUp,
      markCompleted,
      cancelRequest,
      selectImage,
      uploadImage,
    ],
  );

  // Cancel submission
  const handleSubmitCancel = useCallback(async () => {
    if (!cancelReason.trim()) {
      showAlert('Error', 'Please provide a reason');
      return;
    }
    try {
      await cancelRequest.mutateAsync({
        requestId,
        reason: cancelReason.trim(),
      });
      setShowCancelModal(false);
      setCancelReason('');
    } catch (err: any) {
      showAlert('Error', err?.message ?? 'Failed to cancel');
    }
  }, [requestId, cancelReason, cancelRequest]);

  // Dispute submission
  const handleSubmitDispute = useCallback(async () => {
    if (!disputeReason.trim()) {
      showAlert('Error', 'Please provide a reason');
      return;
    }

    try {
      await openDispute.mutateAsync({
        requestId,
        reason: disputeReason.trim(),
        description: disputeDescription.trim(),
      });
      setShowDisputeModal(false);
      setDisputeReason('');
      setDisputeDescription('');
    } catch (err: any) {
      showAlert('Error', err?.message ?? 'Failed to open dispute');
    }
  }, [requestId, disputeReason, disputeDescription, openDispute]);

  // Rating submission
  const handleSubmitRating = useCallback(
    async (stars: number, comment?: string) => {
      try {
        await submitRating.mutateAsync({
          requestId,
          stars,
          comment,
        });
        setShowRatingModal(false);
      } catch (err: any) {
        showAlert('Error', err?.message ?? 'Failed to submit rating');
      }
    },
    [requestId, submitRating],
  );

  if (isLoading || !request) {
    return <Loading message="Loading order..." />;
  }

  const statusColor = STATUS_COLORS[request.status] ?? colors.gray500;
  const statusLabel =
    STATUS_LABELS[request.status as RequestStatus] ?? request.status;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={styles.headerParty}>
              <Text style={styles.headerPartyLabel}>Requester</Text>
              <Text style={styles.headerPartyName}>
                {request.buyer.name ?? 'Anonymous'}
              </Text>
            </View>
            <View style={styles.headerDivider} />
            <View style={styles.headerParty}>
              <Text style={styles.headerPartyLabel}>Sharer</Text>
              <Text style={styles.headerPartyName}>
                {request.seller.name ?? 'Anonymous'}
              </Text>
            </View>
          </View>
          <View style={styles.roleRow}>
            <Badge
              label={`You are the ${roleLabel}`}
              color={isBuyer ? colors.primaryLight : colors.primary}
            />
            <Badge label={statusLabel} color={statusColor} />
          </View>
        </Card>

        {/* Status Timeline */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Progress</Text>
          <StatusTimeline currentStatus={request.status} />
        </Card>

        {/* Order Info */}
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

        {/* Order Proof */}
        {request.ordered_proof_path && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Order Proof</Text>

            {request.ordered_proof_path && (
              <View style={styles.proofContainer}>
                <Text style={styles.proofLabel}>Order Proof</Text>
                <ProofImage path={request.ordered_proof_path} label="Order Proof" />
              </View>
            )}
          </Card>
        )}

        {/* Mobile Order Link — shown to sharer after accepting */}
        {request.status === 'accepted' && isSeller && (
          <Card style={styles.sectionCard}>
            <Pressable
              style={({ pressed }) => [
                styles.mobileOrderButton,
                pressed && styles.mobileOrderButtonPressed,
              ]}
              onPress={async () => {
                const deepLink = 'transactmobileorder://';
                const supported = await Linking.canOpenURL(deepLink);
                if (supported) {
                  await Linking.openURL(deepLink);
                } else {
                  const storeUrl = Platform.OS === 'ios'
                    ? 'https://apps.apple.com/us/app/transact-mobile-ordering/id1494719529'
                    : 'https://play.google.com/store/apps/details?id=com.blackboard.mobileorder';
                  await Linking.openURL(storeUrl);
                }
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
                onAction={handleAction}
                loading={actionLoading || uploading}
              />
            </Card>
          )}

        {/* Dispute Info */}
        {dispute && (
          <Card
            style={[
              styles.sectionCard,
              {
                borderLeftWidth: 4,
                borderLeftColor: colors.danger,
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Dispute</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status</Text>
              <Badge
                label={dispute.status === 'open' ? 'Open' : 'Resolved'}
                color={
                  dispute.status === 'open' ? colors.danger : colors.success
                }
                size="sm"
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

        {/* Chat */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Messages</Text>
          <ChatSection requestId={requestId} currentUserId={user!.id} />
        </Card>
      </ScrollView>

      {/* Cancel Modal */}
      <Modal
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Order"
      >
        <Input
          label="Reason *"
          placeholder="Why are you cancelling?"
          value={cancelReason}
          onChangeText={setCancelReason}
          multiline
          numberOfLines={3}
        />
        <View style={styles.modalActions}>
          <Button
            title="Cancel Order"
            onPress={handleSubmitCancel}
            variant="danger"
            loading={cancelRequest.isPending}
            fullWidth
          />
        </View>
      </Modal>

      {/* Dispute Modal */}
      <Modal
        visible={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        title="Open Dispute"
      >
        <Input
          label="Reason *"
          placeholder="Brief reason for the dispute"
          value={disputeReason}
          onChangeText={setDisputeReason}
        />
        <Input
          label="Description"
          placeholder="Provide more details..."
          value={disputeDescription}
          onChangeText={setDisputeDescription}
          multiline
          numberOfLines={4}
        />
        <View style={styles.modalActions}>
          <Button
            title="Submit Dispute"
            onPress={handleSubmitDispute}
            variant="danger"
            loading={openDispute.isPending}
            fullWidth
          />
        </View>
      </Modal>

      {/* Rating Modal */}
      <RatingModal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleSubmitRating}
        loading={submitRating.isPending}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerCard: {
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerParty: {
    flex: 1,
    alignItems: 'center',
  },
  headerPartyLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.gray400,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  headerPartyName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
    textAlign: 'center',
  },
  headerDivider: {
    width: 12,
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionCard: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 10,
  },
  infoRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray400,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: colors.gray700,
    lineHeight: 20,
  },
  infoValueHighlight: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  proofContainer: {
    marginBottom: 12,
  },
  proofLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.gray500,
    marginBottom: 6,
  },
  modalActions: {
    marginTop: 8,
  },
  mobileOrderButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
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
    color: colors.white,
    marginBottom: 4,
  },
  mobileOrderHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
});
