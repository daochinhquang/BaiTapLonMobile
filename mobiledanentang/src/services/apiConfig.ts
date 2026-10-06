import Constants from "expo-constants";
import { Platform } from "react-native";

type ExtraConfig = {
  apiUrl?: string;
};

const API_PORT = "4000";
const API_PATH = "/api";

function normalizeApiUrl(value?: string | null) {
  const trimmed = value?.trim();

  return trimmed ? trimmed.replace(/\/$/, "") : null;
}

function getHostFromUri(uri?: string | null) {
  if (!uri) return null;

  try {
    const parsed = new URL(uri.includes("://") ? uri : `http://${uri}`);

    return parsed.hostname || null;
  } catch {
    return null;
  }
}

function getDevelopmentApiUrl() {
  const host = getHostFromUri(Constants.expoConfig?.hostUri);

  return host ? `http://${host}:${API_PORT}${API_PATH}` : null;
}

const extraConfig = Constants.expoConfig?.extra as ExtraConfig | undefined;

export const API_BASE_URL =
  normalizeApiUrl(extraConfig?.apiUrl) ??
  getDevelopmentApiUrl() ??
  (Platform.OS === "android"
    ? `http://10.0.2.2:${API_PORT}${API_PATH}`
    : `http://localhost:${API_PORT}${API_PATH}`);
