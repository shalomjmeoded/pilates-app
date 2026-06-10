import * as Crypto from 'expo-crypto';

import { preferencesStorage } from '@/storage/mmkv';

const DEVICE_INSTALL_ID_KEY = 'device_install_id';

export async function getDeviceInstallId(): Promise<string> {
  const cached = preferencesStorage.getCachedFlags()[DEVICE_INSTALL_ID_KEY];
  if (typeof cached === 'string' && cached.length > 0) {
    return cached;
  }

  const id = Crypto.randomUUID();
  preferencesStorage.setCachedFlag(DEVICE_INSTALL_ID_KEY, id);
  return id;
}
