import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  Modal as RNModal,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { theme } from '../lib/theme';

interface ProofImageProps {
  path: string | null;
  label: string;
  bucket?: string;
}

export function ProofImage({
  path,
  label,
  bucket = 'proofs',
}: ProofImageProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [fullScreenVisible, setFullScreenVisible] = useState(false);

  useEffect(() => {
    if (!path) {
      setSignedUrl(null);
      setError(false);
      return;
    }

    let cancelled = false;

    async function fetchUrl() {
      setLoading(true);
      setError(false);
      try {
        const { data, error: urlError } = await supabase.storage
          .from(bucket)
          .createSignedUrl(path!, 3600);

        if (cancelled) return;

        if (urlError || !data) {
          setError(true);
          setSignedUrl(null);
        } else {
          setSignedUrl(data.signedUrl);
        }
      } catch {
        if (!cancelled) {
          setError(true);
          setSignedUrl(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchUrl();

    return () => {
      cancelled = true;
    };
  }, [path, bucket]);

  if (!path) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>No proof uploaded</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      ) : error ? (
        <Pressable
          onPress={() => {
            setError(false);
            setLoading(true);
            supabase.storage
              .from(bucket)
              .createSignedUrl(path!, 3600)
              .then(({ data, error: retryError }) => {
                if (retryError || !data) {
                  setError(true);
                } else {
                  setSignedUrl(data.signedUrl);
                }
              })
              .catch(() => setError(true))
              .finally(() => setLoading(false));
          }}
          style={styles.placeholder}
        >
          <Text style={styles.placeholderText}>Failed to load image</Text>
          <Text style={styles.retryText}>Tap to retry</Text>
        </Pressable>
      ) : signedUrl ? (
        <Pressable
          onPress={() => setFullScreenVisible(true)}
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          <Image
            source={{ uri: signedUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        </Pressable>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>No image available</Text>
        </View>
      )}

      <RNModal
        visible={fullScreenVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFullScreenVisible(false)}
        statusBarTranslucent
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setFullScreenVisible(false)}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <Pressable
                onPress={() => setFullScreenVisible(false)}
                hitSlop={12}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.closeButtonPressed,
                ]}
              >
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
            </View>

            {signedUrl && (
              <Image
                source={{ uri: signedUrl }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            )}
          </Pressable>
        </SafeAreaView>
      </RNModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.gray700,
    marginBottom: 6,
  },
  placeholder: {
    width: 150,
    height: 150,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 13,
    color: theme.colors.gray400,
    textAlign: 'center',
  },
  retryText: {
    fontSize: 12,
    color: theme.colors.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  loadingContainer: {
    width: 150,
    height: 150,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: 150,
    height: 150,
    borderRadius: theme.radius.md,
  },
  pressed: {
    opacity: 0.8,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.white,
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  closeButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  closeText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.white,
  },
  fullImage: {
    flex: 1,
    width: '100%',
  },
});
