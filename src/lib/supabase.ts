import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { Database } from '../types/database';

const extra = Constants.expoConfig?.extra ?? {};
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL || extra.supabaseUrl || '';
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || extra.supabaseAnonKey || '';

export const supabaseConfigured = supabaseUrl.length > 0 && supabaseAnonKey.length > 0;

const isWeb = Platform.OS === 'web';

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: isWeb,
      flowType: isWeb ? 'implicit' : 'pkce',
    },
  },
);
