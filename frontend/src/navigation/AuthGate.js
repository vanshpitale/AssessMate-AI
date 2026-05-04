import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { getAuthData } from '../utils/asyncStorageHelper';
import { jwtDecode } from 'jwt-decode';
import { Colors } from '../theme';

export default function AuthGate({ nav }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const { token, role } = await getAuthData();
        
        if (!token) {
          nav.replace('RoleSelection');
          return;
        }

        // Decode token to check expiry
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          // Token expired
          nav.replace('Login', { sessionExpired: true });
          return;
        }

        // Valid token, route based on role
        if (role === 'teacher') {
          nav.replace('Main', { userType: 'teacher' });
        } else if (role === 'student') {
          nav.replace('StudentMain', { userType: 'student' });
        } else {
          // Unknown role?
          nav.replace('RoleSelection');
        }
      } catch (error) {
        console.error('AuthGate Error:', error);
        nav.replace('RoleSelection');
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Render nothing or a fallback while navigating
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
