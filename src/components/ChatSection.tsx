import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useMessages, useSendMessage, useMessagesRealtime } from '../hooks/use-messages';
import { formatRelativeTime } from '../lib/utils';
import { theme } from '../lib/theme';

interface ChatSectionProps {
  requestId: string;
  currentUserId: string;
}

export function ChatSection({ requestId, currentUserId }: ChatSectionProps) {
  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const { data: messages = [], isLoading } = useMessages(requestId);
  const sendMessage = useSendMessage();

  useMessagesRealtime(requestId);

  const handleSend = useCallback(() => {
    const body = messageText.trim();
    if (!body) return;

    sendMessage.mutate(
      { requestId, body },
      {
        onSuccess: () => {
          setMessageText('');
        },
      }
    );
  }, [messageText, requestId, sendMessage]);

  // On web: reverse data instead of using inverted prop (known RN Web bug)
  const isWeb = Platform.OS === 'web';
  const displayMessages = useMemo(() => {
    if (isWeb) {
      return [...messages].reverse();
    }
    return messages;
  }, [messages, isWeb]);

  const renderMessage = useCallback(
    ({ item }: { item: (typeof messages)[number] }) => {
      const isOwn = item.sender_id === currentUserId;
      const senderName = item.sender?.name ?? 'Unknown';

      return (
        <View
          style={[
            styles.bubbleWrapper,
            isOwn ? styles.bubbleWrapperRight : styles.bubbleWrapperLeft,
          ]}
        >
          <View
            style={[
              styles.bubble,
              isOwn ? styles.bubbleOwn : styles.bubbleOther,
            ]}
          >
            {!isOwn && (
              <Text style={styles.senderName}>{senderName}</Text>
            )}
            <Text
              style={[
                styles.messageText,
                isOwn ? styles.messageTextOwn : styles.messageTextOther,
              ]}
            >
              {item.body}
            </Text>
            <Text
              style={[
                styles.messageTime,
                isOwn ? styles.messageTimeOwn : styles.messageTimeOther,
              ]}
            >
              {formatRelativeTime(item.created_at)}
            </Text>
          </View>
        </View>
      );
    },
    [currentUserId]
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <FlatList
        ref={flatListRef}
        data={displayMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        inverted={!isWeb}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          if (!isWeb) {
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          }
        }}
        ListEmptyComponent={
          isLoading ? null : (
            <View style={[styles.emptyContainer, !isWeb && { transform: [{ scaleY: -1 }] }]}>
              <Text style={styles.emptyText}>
                No messages yet. Start the conversation!
              </Text>
            </View>
          )
        }
      />

      {/* Input row */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          placeholderTextColor={theme.colors.gray400}
          multiline
          maxLength={1000}
        />
        <Pressable
          onPress={handleSend}
          disabled={!messageText.trim() || sendMessage.isPending}
          style={({ pressed }) => [
            styles.sendButton,
            (!messageText.trim() || sendMessage.isPending) &&
              styles.sendButtonDisabled,
            pressed && styles.sendButtonPressed,
          ]}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexGrow: 1,
  },
  bubbleWrapper: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  bubbleWrapperRight: {
    alignSelf: 'flex-end',
  },
  bubbleWrapperLeft: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleOwn: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: theme.colors.gray100,
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.gray500,
    marginBottom: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextOwn: {
    color: theme.colors.white,
  },
  messageTextOther: {
    color: theme.colors.gray900,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
  },
  messageTimeOwn: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  messageTimeOther: {
    color: theme.colors.gray400,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.gray400,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray200,
    backgroundColor: theme.colors.white,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: theme.colors.gray100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: theme.colors.gray900,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonPressed: {
    opacity: 0.8,
  },
  sendButtonText: {
    color: theme.colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
