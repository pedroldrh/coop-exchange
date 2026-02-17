import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../lib/supabase';
import { decode } from 'base64-arraybuffer';

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);

  const imagePickerOptions: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    quality: 0.7,
    allowsEditing: true,
  };

  const pickImage = async (): Promise<string | null> => {
    const result = await ImagePicker.launchImageLibraryAsync(imagePickerOptions);
    if (result.canceled || !result.assets[0]) return null;
    return result.assets[0].uri;
  };

  const takePhoto = async (): Promise<string | null> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Camera permission is required to take photos');
    }
    const result = await ImagePicker.launchCameraAsync(imagePickerOptions);
    if (result.canceled || !result.assets[0]) return null;
    return result.assets[0].uri;
  };

  const uploadImage = async (
    uri: string,
    requestId: string,
    type: 'paid' | 'ordered'
  ): Promise<string> => {
    setUploading(true);

    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

      const filePath = `${requestId}/${type}_${Date.now()}.jpg`;

      const { error } = await supabase.storage
        .from('proofs')
        .upload(filePath, decode(base64), {
          contentType: 'image/jpeg',
        });

      if (error) throw error;

      return filePath;
    } finally {
      setUploading(false);
    }
  };

  return { pickImage, takePhoto, uploadImage, uploading };
}
