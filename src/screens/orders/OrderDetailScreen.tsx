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
import { showAlert } from '../../lib/utils';
import { theme } from '../../lib/theme';

type Props = NativeStackScreenProps<FeedStackParamList, 'OrderDetail'>;

export function OrderDetailScreen({ route }: Props) {
  const { requestId } = route.params;
  const { user } = useAuth();

  const {
    data: request,
    isLoading,
    refetch,
    isRefetching,
  } = useRequest(requestId);
  const { data: ratings } = useRequestRating(requestId);
  const { data: dispute } = useRequestDispute(requestId);

  useRequestRealtime(requestId);

  const acceptRequest = useAcceptRequest();
  const declineRequest = useDeclineRequest();
  const markOrdered = useMarkOrdered();
  const markPickedUp = useMarkPickedUp();
  const markCompleted = useMarkCompleted();
  const cancelRequest = useCancelRequest();
  const openDispute = useOpenDispute();
  const submitRating = useSubmitRating();
  const { pickImage, takePhoto, uploadImage, uploading } = useImageUpload();

  const [actionLoading, setActionLoading] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showFizzShareModal, setShowFizzShareModal] = useState(false);

  const isBuyer = user?.id === request?.buyer_id;
  const isSeller = user?.id === request?.seller_id;
  const roleLabel = isBuyer ? 'Requester' : isSeller ? 'Sharer' : '';

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

  const selectImage = useCallback((): Promise<string | null> => {
    if (Platform.OS === 'web') {
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
      markOrdered,
      markPickedUp,
      markCompleted,
      cancelRequest,
      selectImage,
      uploadImage,
    ],
  );

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

  const chainFizzModal = useCallback(() => {
    setTimeout(() => setShowFizzShareModal(true), 300);
  }, []);

  const handleSubmitRating = useCallback(
    async (stars: number, comment?: string) => {
      try {
        await submitRating.mutateAsync({
          requestId,
          stars,
          comment,
        });
        setShowRatingModal(false);
        chainFizzModal();
      } catch (err: any) {
        showAlert('Error', err?.message ?? 'Failed to submit rating');
      }
    },
    [requestId, submitRating, chainFizzModal],
  );

  if (isLoading || !request) {
    return <Loading message="Loading order..." />;
  }

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
              refreshing={isRefetching}
              onRefresh={refetch}
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
                label={`You are the ${roleLabel}`}
                color={isBuyer ? theme.colors.primaryLight : theme.colors.primary}
                variant="soft"
              />
              <Badge label={statusLabel} color={statusColor} variant="soft" />
            </View>
          </Card>

          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Progress</Text>
            <StatusTimeline currentStatus={request.status} />
          </Card>

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

          {request.ordered_proof_path && (
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Order Proof</Text>
              <View style={styles.proofContainer}>
                <ProofImage path={request.ordered_proof_path} label="Order Proof" />
              </View>
            </Card>
          )}

          {request.status === 'accepted' && isSeller && (
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

          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Messages</Text>
            <ChatSection requestId={requestId} currentUserId={user!.id} />
          </Card>
        </ScrollView>

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

        <RatingModal
          visible={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            chainFizzModal();
          }}
          onSubmit={handleSubmitRating}
          loading={submitRating.isPending}
        />

        <FizzShareModal
          visible={showFizzShareModal}
          onClose={() => setShowFizzShareModal(false)}
          requestId={requestId}
          role={isSeller ? 'giver' : 'receiver'}
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
