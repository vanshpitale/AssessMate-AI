import { clearAuthData } from './asyncStorageHelper';

export const handleLogout = async (navigation) => {
  try {
    // Clear user tokens
    await clearAuthData();
    
    // Use resetTo or replace to prevent going back to protected screens
    if (navigation && typeof navigation.resetTo === 'function') {
      navigation.resetTo('Login');
    } else if (navigation && typeof navigation.replace === 'function') {
      navigation.replace('Login');
    } else {
      console.warn("Navigation object or resetTo/replace function is not available.");
    }
  } catch (error) {
    console.error('Error during logout:', error);
  }
};
