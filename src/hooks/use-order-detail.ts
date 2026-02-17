import { useState, useCallback, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import {
  useRequest,
  useRequestRealtime,
  useAcceptRequest,
  useDeclineRequest,
  useMarkOrdered,
  useMarkPickedUp,
  useMarkCompleted,
  useCancelRequest,
} from './use-requests';
import { useRequestRating, useSubmitRating } from './use-ratings';
import { useRequestDispute, useOpenDispute } from './use-disputes';
import { useImageUpload } from './use-image-upload';
import { showAlert } from '../lib/utils';

export function useOrderDetailState(requestId: string, userId: string | undefined) {
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

  const isBuyer = userId === request?.buyer_id;
  const isSeller = userId === request?.seller_id;
  const roleLabel = isBuyer ? 'Requester' : isSeller ? 'Sharer' : '';
  const hasRated = ratings?.some((r) => r.rater_id === userId) ?? false;

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
      if (!request || !userId) return;
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
            const emailPrefix = (request.seller?.email ?? '').split('@')[0];
            const autoInitials = emailPrefix.length >= 2
              ? (emailPrefix[0] + emailPrefix[1]).toUpperCase()
              : emailPrefix.toUpperCase();
            await markOrdered.mutateAsync({
              requestId,
              orderedProofPath: '',
              orderIdText: autoInitials,
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
      userId,
      requestId,
      acceptRequest,
      declineRequest,
      markOrdered,
      markPickedUp,
      markCompleted,
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

  return {
    // Data
    request,
    isLoading,
    refetch,
    isRefetching,
    ratings,
    dispute,

    // Derived state
    isBuyer,
    isSeller,
    roleLabel,
    hasRated,

    // Loading states
    actionLoading,
    uploading,

    // Modal visibility
    showDisputeModal,
    setShowDisputeModal,
    showRatingModal,
    setShowRatingModal,
    showCancelModal,
    setShowCancelModal,
    showFizzShareModal,
    setShowFizzShareModal,

    // Modal form state
    disputeReason,
    setDisputeReason,
    disputeDescription,
    setDisputeDescription,
    cancelReason,
    setCancelReason,

    // Mutation pending states
    cancelRequestPending: cancelRequest.isPending,
    openDisputePending: openDispute.isPending,
    submitRatingPending: submitRating.isPending,

    // Handlers
    handleAction,
    handleSubmitCancel,
    handleSubmitDispute,
    handleSubmitRating,
    chainFizzModal,
  };
}
