
/**
 * Helper utilities for mobile-specific functionality
 */

import { Capacitor } from '@capacitor/core';

/**
 * Checks if the app is running on a mobile device through Capacitor
 */
export const isNativeMobile = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Handles file saving based on platform (web vs. mobile)
 * This is a placeholder - actual implementation would require
 * a native file system plugin
 */
export const saveFile = async (blob: Blob, fileName: string): Promise<void> => {
  if (isNativeMobile()) {
    // In a real implementation, you would use the Filesystem plugin
    // This is a placeholder for the concept
    console.log(`Would save file "${fileName}" to mobile device storage`);
    
    // Future implementation would use Capacitor plugins like:
    // import { Filesystem, Directory } from '@capacitor/filesystem';
    // await Filesystem.writeFile({
    //   path: fileName,
    //   data: await blobToBase64(blob),
    //   directory: Directory.Documents
    // });
  } else {
    // For web browsers, use the standard download approach
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

/**
 * Helper to convert a Blob to base64 string
 * (Would be used in the mobile implementation)
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix and just get the base64 part
      resolve(base64String.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
