import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { RequestStatus } from '../lib/constants';
import { STATUS_LABELS } from '../lib/constants';

const STATUS_FLOW: RequestStatus[] = [
  'requested',
  'accepted',
  'ordered',
  'picked_up',
  'completed',
];

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
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray700: '#374151',
  white: '#FFFFFF',
};

interface StatusTimelineProps {
  currentStatus: string;
}

export function StatusTimeline({ currentStatus }: StatusTimelineProps) {
  const isCancelled = currentStatus === 'cancelled';
  const isDisputed = currentStatus === 'disputed';
  const isTerminal = isCancelled || isDisputed;

  // Find the index of the current status in the normal flow
  const currentIndex = STATUS_FLOW.indexOf(currentStatus as RequestStatus);
  // If the status is terminal, figure out where in the flow it broke off
  // by showing all steps up to wherever it was before the terminal state
  const activeIndex = isTerminal ? -1 : currentIndex;

  return (
    <View style={styles.container}>
      <View style={styles.timeline}>
        {STATUS_FLOW.map((status, index) => {
          const isCompleted = !isTerminal && activeIndex > index;
          const isCurrent = !isTerminal && activeIndex === index;
          const isFuture = isTerminal || activeIndex < index;

          const dotColor = isCompleted || isCurrent
            ? STATUS_COLORS[status]
            : colors.gray300;

          const lineColor =
            index < STATUS_FLOW.length - 1
              ? isCompleted
                ? STATUS_COLORS[status]
                : colors.gray300
              : 'transparent';

          return (
            <View key={status} style={styles.step}>
              <View style={styles.dotRow}>
                {/* Dot */}
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: dotColor },
                    isCurrent && styles.currentDot,
                    isCurrent && { borderColor: dotColor },
                  ]}
                />
                {/* Connecting line (not after last dot) */}
                {index < STATUS_FLOW.length - 1 && (
                  <View style={[styles.line, { backgroundColor: lineColor }]} />
                )}
              </View>
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

        {/* Terminal status dot (cancelled / disputed) */}
        {isTerminal && (
          <View style={styles.step}>
            <View style={styles.dotRow}>
              <View
                style={[
                  styles.dot,
                  styles.currentDot,
                  {
                    backgroundColor: STATUS_COLORS[currentStatus],
                    borderColor: STATUS_COLORS[currentStatus],
                  },
                ]}
              />
            </View>
            <Text style={[styles.label, styles.terminalLabel]}>
              {STATUS_LABELS[currentStatus as RequestStatus]}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  timeline: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  step: {
    flex: 1,
    alignItems: 'center',
  },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  currentDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  line: {
    height: 3,
    flex: 1,
    borderRadius: 1.5,
  },
  label: {
    fontSize: 11,
    color: colors.gray700,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
  currentLabel: {
    fontWeight: '700',
  },
  futureLabel: {
    color: colors.gray400,
  },
  terminalLabel: {
    color: '#EF4444',
    fontWeight: '700',
  },
});
