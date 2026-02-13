import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native';
import { theme } from '../../lib/theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView style={styles.safeArea}>
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable style={styles.card} onPress={() => {}}>
            <View style={styles.header}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              <Pressable
                onPress={onClose}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.closeButtonPressed,
                ]}
              >
                <Text style={styles.closeText}>{'\u2715'}</Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.body}
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          </Pressable>
        </Pressable>
      </SafeAreaView>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xxl,
    ...(Platform.OS === 'web'
      ? ({ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' } as any)
      : {}),
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.xl,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
    ...theme.shadow.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.gray900,
    flex: 1,
    marginRight: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonPressed: {
    backgroundColor: theme.colors.gray200,
  },
  closeText: {
    fontSize: 16,
    color: theme.colors.gray500,
    fontWeight: '500',
  },
  body: {
    padding: 20,
  },
});
