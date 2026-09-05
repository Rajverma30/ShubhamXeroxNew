import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAqmG-u86gAjkLdS2nfWAc_Y5o6V6jv4Ak',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'shubhamxerox-3ae11.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'shubhamxerox-3ae11',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'shubhamxerox-3ae11.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1077125474175',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1077125474175:web:ea7a1ede3afd7035b01c4a',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-970CZ349BW',
};

// Initialize Firebase App instance
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const storage = getStorage(app);
export default app;

/**
 * Reusable utility to upload a file to Firebase Storage.
 *
 * @param {File} file - File instance from input element or dropzone.
 * @param {Object} options - Configuration options for upload.
 * @param {string} [options.folder='uploads'] - Target folder path in Firebase Storage.
 * @param {string[]} [options.allowedTypes=[]] - Allowed MIME type patterns (e.g., ['image/*', 'application/pdf']).
 * @param {number} [options.maxSizeMB=15] - Maximum allowed file size in megabytes.
 * @param {string} [options.customFilename] - Custom filename override.
 * @param {function} [options.onProgress] - Optional progress callback function.
 * @returns {Promise<{ url: string, fullPath: string, name: string, sizeBytes: number }>}
 */
export async function uploadFileToFirebase(file, options = {}) {
  const {
    folder = 'uploads',
    allowedTypes = [],
    maxSizeMB = 15,
    customFilename = null,
    onProgress = null,
  } = options;

  if (!file) {
    throw new Error('No file provided for upload.');
  }

  // 1. File size validation
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds maximum allowed size of ${maxSizeMB} MB.`);
  }

  // 2. File type validation
  if (allowedTypes && allowedTypes.length > 0) {
    const isAllowed = allowedTypes.some((type) => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', ''));
      }
      return file.type === type;
    });
    if (!isAllowed) {
      throw new Error(`File type '${file.type}' is not supported. Allowed types: ${allowedTypes.join(', ')}`);
    }
  }

  // 3. Unique filename and path generation
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const sanitizedOriginal = (file.name || 'file').replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = customFilename || `${timestamp}_${randomSuffix}_${sanitizedOriginal}`;
  const fullPath = `${folder.replace(/\/$/, '')}/${filename}`;

  // 4. Firebase Storage reference and upload task creation
  const storageRef = ref(storage, fullPath);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (typeof onProgress === 'function') {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        }
      },
      (error) => {
        reject(error);
      },
      async () => {
        // 5. Retrieve Firebase Storage download URL
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({
          url: downloadUrl,
          fullPath,
          name: filename,
          sizeBytes: file.size,
        });
      }
    );
  });
}
