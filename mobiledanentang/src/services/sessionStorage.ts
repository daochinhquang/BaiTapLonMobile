import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_USER_ID_KEY = 'app-ban-bong-chuyen:auth-user-id';

export async function getStoredUserId() {
  return AsyncStorage.getItem(AUTH_USER_ID_KEY);
}

export async function saveStoredUserId(userId: string) {
  await AsyncStorage.setItem(AUTH_USER_ID_KEY, userId);
}

export async function clearStoredUserId() {
  await AsyncStorage.removeItem(AUTH_USER_ID_KEY);
}
