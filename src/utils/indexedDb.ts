/**
 * IndexedDB helper to store custom audio recordings for KLOVIBE stand greeting
 * Includes base64 localStorage fallback for maximum compatibility.
 */

const DB_NAME = 'KlovibeStandAudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'audio_blobs';
const AUDIO_KEY = 'custom_welcome_greeting';
const LS_FALLBACK_KEY = 'klovibe_custom_audio_base64';

export function openAudioDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this browser'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function base64ToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'audio/webm';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export async function saveAudioRecording(blob: Blob): Promise<void> {
  // Always save base64 to localStorage for instant fallback
  try {
    const base64 = await blobToBase64(blob);
    localStorage.setItem(LS_FALLBACK_KEY, base64);
  } catch (err) {
    console.warn('Could not store base64 audio in localStorage:', err);
  }

  // Try to save to IndexedDB
  try {
    const db = await openAudioDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, AUDIO_KEY);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB write failed, fallback used:', err);
  }
}

export async function getAudioRecording(): Promise<Blob | null> {
  // Try IndexedDB first
  try {
    const db = await openAudioDB();
    const blob = await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(AUDIO_KEY);

      req.onsuccess = () => {
        const result = req.result;
        resolve(result instanceof Blob ? result : null);
      };
      req.onerror = () => reject(req.error);
    });

    if (blob) return blob;
  } catch (err) {
    console.warn('IndexedDB get failed, checking localStorage fallback:', err);
  }

  // Check localStorage base64 fallback
  try {
    const base64 = localStorage.getItem(LS_FALLBACK_KEY);
    if (base64) {
      return base64ToBlob(base64);
    }
  } catch (err) {
    console.warn('LocalStorage audio read failed:', err);
  }

  return null;
}

export async function deleteAudioRecording(): Promise<void> {
  try {
    localStorage.removeItem(LS_FALLBACK_KEY);
  } catch {
    // ignore
  }

  try {
    const db = await openAudioDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(AUDIO_KEY);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to delete audio from IndexedDB:', err);
  }
}

