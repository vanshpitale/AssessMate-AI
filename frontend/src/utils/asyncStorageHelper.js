import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@auth_token';
const ROLE_KEY = '@user_role';

export const storeAuthData = async (token, role) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(ROLE_KEY, role);
  } catch (error) {
    console.error('Error storing auth data:', error);
  }
};

export const getAuthData = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const role = await AsyncStorage.getItem(ROLE_KEY);
    return { token, role };
  } catch (error) {
    console.error('Error reading auth data:', error);
    return { token: null, role: null };
  }
};

export const clearAuthData = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(ROLE_KEY);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};
