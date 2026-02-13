import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { RequestStatus } from '../lib/constants';
import { STATUS_LABELS } from '../lib/constants';
import { theme } from '../lib/theme';

const STATUS_FLOW: RequestStatus[] = [
  'requested',
  'accepted',
  'ordered',
  'picked_up',
  'completed',
];

interface StatusTimelineProps {
  currentStatus: string;
}

export function StatusTimeline({ currentStatus }: StatusTimelineProps) {
  const isCancelled = currentStatus === 'cancelled';
  const isDisputed = currentStatus === 'disputed';
  const isTerminal = isCancelled || isDisputed;

  const currentIndex = STATUS_FLOW.indexOf(currentStatus as RequestStatus);
  const activeIndex = isTerminal ? -1 : currentIndex;

  return (
    <View style={styles.container}>
      {/* Line track */}
      <View style={styles.trackRow}>
        {STATUS_FLOW.map((status, index) => {
          if (index === 0) return null;
          const filled = !isTerminal && activeIndex >= index;
          return (
            <View
              key={`line-${index}`}
              style={[
                styles.segment,
                { backgroundColor: filled ? theme.statusColors[STATUS_FLOW[index - 1]] : theme.colors.gray300 },
              ]}
            />
          );
        })}
      </View>

      {/* Dots and labels */}
      <View style={styles.dotsRow}>
        {STATUS_FLOW.map((status, index) => {
          const isCompleted = !isTerminal && activeIndex > index;
          const isCurrent = !isTerminal && activeIndex === index;
          const isFuture = isTerminal || activeIndex < index;

          const dotColor = isCompleted || isCurrent
            ? theme.statusColors[status]
            : theme.colors.gray300;

          return (
            <View key={status} style={styles.step}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: dotColor },
                  isCurrent && styles.currentDot,
                  isCurrent && { borderColor: dotColor },
                ]}
              />
              <Text
                style={[
                  styles.label,
                  isCurrent && styles.currentLabel,
                  isFuture && styles.futureLabel,
                ]}
                numberOfLines={1}
              >
                {STATUS_LABELS[status]}
              </Text>
            </View>
          );
        })}
      </View>

      {isTerminal && (
        <Text style={styles.terminalLabel}>
          {STATUS_LABELS[currentStatus as RequestStatus]}
        </Text>
      )}
    </View>
  );
}

const DOT_SIZE = 16;
const CURRENT_DOT_SIZE = 20;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    position: 'relative',
  },
  trackRow: {
    position: 'absolute',
    top: 12 + DOT_SIZE / 2 - 1.5,
    left: 30,
    right: 30,
    flexDirection: 'row',
    height: 3,
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  step: {
    alignItems: 'center',
    width: 60,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: theme.colors.gray300,
  },
  currentDot: {
    width: CURRENT_DOT_SIZE,
    height: CURRENT_DOT_SIZE,
    borderRadius: CURRENT_DOT_SIZE / 2,
    borderWidth: 3,
    borderColor: theme.colors.white,
    marginTop: -(CURRENT_DOT_SIZE - DOT_SIZE) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 11,
    color: theme.colors.gray700,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
  currentLabel: {
    fontWeight: '700',
  },
  futureLabel: {
    color: theme.colors.gray400,
  },
  terminalLabel: {
    color: theme.colors.danger,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 12,
  },
});
