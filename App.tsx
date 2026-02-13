import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/providers/AuthProvider';
import { QueryProvider } from './src/providers/QueryProvider';
import { RootNavigator } from './src/navigation/RootNavigator';
import { supabaseConfigured } from './src/lib/supabase';
import { theme } from './src/lib/theme';

function SetupScreen() {
  return (
    <View style={setupStyles.container}>
      <Text style={setupStyles.icon}>&#9881;</Text>
      <Text style={setupStyles.title}>Coop Exchange</Text>
      <Text style={setupStyles.subtitle}>Supabase Not Configured</Text>
      <View style={setupStyles.card}>
        <Text style={setupStyles.step}>1. Create a Supabase project</Text>
        <Text style={setupStyles.step}>2. Run the SQL migrations in supabase/migrations/</Text>
        <Text style={setupStyles.step}>3. Create a "proofs" storage bucket</Text>
        <Text style={setupStyles.step}>4. Copy .env.example to .env</Text>
        <Text style={setupStyles.step}>5. Add your EXPO_PUBLIC_SUPABASE_URL</Text>
        <Text style={setupStyles.step}>6. Add your EXPO_PUBLIC_SUPABASE_ANON_KEY</Text>
        <Text style={setupStyles.step}>7. Restart the dev server</Text>
      </View>
    </View>
  );
}

const setupStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.gray50,
    padding: 24,
  },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: theme.colors.primary, marginBottom: 4 },
  subtitle: { fontSize: 16, color: theme.colors.gray500, marginBottom: 24 },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    ...theme.shadow.sm,
  },
  step: { fontSize: 14, color: theme.colors.gray700, lineHeight: 28 },
});

// Inject web overflow fix immediately (outside component lifecycle)
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  // CSS layer
  const id = '__foodie_no_scroll';
  if (!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      html, body {
        overflow: hidden !important;
        overscroll-behavior: none !important;
      }
      body {
        position: fixed !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        background-color: #E5E7EB !important;
      }
    `;
    document.head.appendChild(style);
  }

  // JS layer — snap window scroll back to 0 whenever anything causes drift
  window.addEventListener('scroll', () => window.scrollTo(0, 0), true);

  // Ensure viewport meta prevents zooming/scaling
  let vp = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
  if (vp) {
    vp.content = 'width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no';
  }
}

const webClip = Platform.OS === 'web'
  ? {
      overflow: 'hidden' as const,
      maxWidth: theme.layout.maxContentWidth,
      alignSelf: 'center' as const,
      width: '100%' as any,
    }
  : {};

export default function App() {
  if (!supabaseConfigured) {
    return (
      <SafeAreaProvider>
        <SetupScreen />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    );
  }

  return (
    <View style={[{ flex: 1 }, webClip]}>
      <SafeAreaProvider>
        <QueryProvider>
          <AuthProvider>
            <NavigationContainer
              documentTitle={{
                formatter: () => 'Foodie - Eat for Free',
              }}
            >
              <RootNavigator />
              <StatusBar style="auto" />
            </NavigationContainer>
          </AuthProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </View>
  );
}
