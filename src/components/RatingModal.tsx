import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

const colors = {
  gold: '#F59E0B',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray700: '#374151',
  gray900: '#111827',
  white: '#FFFFFF',
};

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (stars: number, comment: string) => void;
  loading: boolean;
}

export function RatingModal({
  visible,
  onClose,
  onSubmit,
  loading,
}: RatingModalProps) {
  const [selectedStars, setSelectedStars] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (selectedStars === 0) return;
    onSubmit(selectedStars, comment.trim());
  };

  const handleClose = () => {
    setSelectedStars(0);
    setComment('');
    onClose();
  };

  return (
    <Modal visible={visible} onClose={handleClose} title="Leave a Rating">
      <View style={styles.content}>
        {/* Star selector */}
        <Text style={styles.prompt}>How was your experience?</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable
              key={star}
              onPress={() => setSelectedStars(star)}
              hitSlop={4}
              style={({ pressed }) => [pressed && styles.starPressed]}
            >
              <Text
                style={[
                  styles.star,
                  {
                    color:
                      star <= selectedStars ? colors.gold : colors.gray300,
                  },
                ]}
              >
                {star <= selectedStars ? '\u2605' : '\u2606'}
              </Text>
            </Pressable>
          ))}
        </View>

        {selectedStars > 0 && (
          <Text style={styles.ratingLabel}>
            {selectedStars} / 5
          </Text>
        )}

        {/* Comment input */}
        <Text style={styles.commentLabel}>Comment (optional)</Text>
        <TextInput
          style={styles.commentInput}
          value={comment}
          onChangeText={setComment}
          placeholder="Share your experience..."
          placeholderTextColor={colors.gray400}
          multiline
          numberOfLines={3}
          maxLength={500}
          textAlignVertical="top"
        />

        {/* Submit button */}
        <View style={styles.submitRow}>
          <Button
            title="Submit Rating"
            onPress={handleSubmit}
            variant="primary"
            loading={loading}
            disabled={selectedStars === 0}
            fullWidth
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
  },
  prompt: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray700,
    marginBottom: 16,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  star: {
    fontSize: 36,
  },
  starPressed: {
    opacity: 0.7,
  },
  ratingLabel: {
    fontSize: 14,
    color: colors.gray500,
    fontWeight: '500',
    marginBottom: 20,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray700,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  commentInput: {
    width: '100%',
    minHeight: 80,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.gray900,
    backgroundColor: colors.white,
    marginBottom: 20,
  },
  submitRow: {
    width: '100%',
  },
});
