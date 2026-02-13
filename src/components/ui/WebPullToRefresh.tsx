import React, { useRef, useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { theme } from '../../lib/theme';

interface WebPullToRefreshProps {
  onRefresh: () => void;
  refreshing: boolean;
  children: React.ReactNode;
}

const THRESHOLD = 80;

/**
 * Pull-to-refresh wrapper for web. Uses raw DOM touch events so it
 * doesn't conflict with horizontal scrolling (e.g. leaderboard ticker).
 * On native platforms it renders children as-is (use RefreshControl instead).
 */
export function WebPullToRefresh({ onRefresh, refreshing, children }: WebPullToRefreshProps) {
  const containerRef = useRef<View>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const pulling = useRef(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const el = (containerRef.current as any)?._nativeTag ?? (containerRef.current as any);
    // On RNW, the ref gives us the DOM node directly or via __nativeNode
    const node: HTMLElement | null =
      el instanceof HTMLElement ? el : el?.__nativeNode ?? null;
    if (!node) return;

    function getScrollTop(): number {
      // Walk up to find the scrollable FlatList container
      let current: HTMLElement | null = node;
      while (current) {
        const { overflowY } = window.getComputedStyle(current);
        if (overflowY === 'auto' || overflowY === 'scroll') {
          return current.scrollTop;
        }
        current = current.parentElement;
      }
      return 0;
    }

    function onTouchStart(e: TouchEvent) {
      if (getScrollTop() <= 0) {
        startY.current = e.touches[0].clientY;
        pulling.current = true;
      }
    }

    function onTouchMove(e: TouchEvent) {
      if (!pulling.current) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy < 0) {
        // Scrolling up, not pulling
        pulling.current = false;
        setPullDistance(0);
        return;
      }
      const dampened = Math.min(dy * 0.4, THRESHOLD * 1.5);
      setPullDistance(dampened);
      if (dampened > 10) {
        e.preventDefault(); // prevent native scroll while pulling
      }
    }

    function onTouchEnd() {
      if (!pulling.current) return;
      pulling.current = false;
      if (pullDistance >= THRESHOLD) {
        onRefresh();
      }
      setPullDistance(0);
    }

    node.addEventListener('touchstart', onTouchStart, { passive: true });
    node.addEventListener('touchmove', onTouchMove, { passive: false });
    node.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      node.removeEventListener('touchstart', onTouchStart);
      node.removeEventListener('touchmove', onTouchMove);
      node.removeEventListener('touchend', onTouchEnd);
    };
  }, [onRefresh, pullDistance]);

  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  const showSpinner = refreshing || pullDistance >= THRESHOLD;
  const indicatorHeight = refreshing ? 40 : Math.min(pullDistance, THRESHOLD) * (40 / THRESHOLD);

  return (
    <View ref={containerRef} style={styles.container}>
      {(indicatorHeight > 0 || refreshing) && (
        <View style={[styles.indicator, { height: indicatorHeight }]}>
          {showSpinner && (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          )}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  indicator: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
