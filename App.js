// App.js (persistent bottom tabs with Teacher & Student support)
import React, { useState } from 'react';
import { StatusBar, Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CameraScanScreen from './src/screens/CameraScanScreen';

import useSimpleNavigation from './src/navigation/SimpleNav';

// Teacher Screens
import HomeScreen from './src/screens/HomeScreen';
import EvaluationsScreen from './src/screens/EvaluationsScreen';
import NewEvaluationScreen from './src/screens/NewEvaluationScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import QuestionAnalysisScreen from './src/screens/QuestionAnalysisScreen';

// Student Screens
import StudentHomeScreen from './src/screens/StudentHomeScreen';
import StudentResultsScreen from './src/screens/StudentResultsScreen';
import StudentResultDetailScreen from './src/screens/StudentResultDetailScreen';
import StudentSheetsScreen from './src/screens/StudentSheetsScreen';

// Shared Screens
import RoleSelectionScreen from './src/screens/RoleSelectionScreen';
import LoginScreen from './src/screens/LoginScreen';
import ProfileScreen from './src/screens/ProfileScreen';

export default function App() {
  // global nav stack - start with RoleSelection
  const nav = useSimpleNavigation(['RoleSelection']);
  const route = nav.current;

  // Track user type (teacher or student)
  const [userType, setUserType] = useState(nav.params.userType || 'teacher');

  // mainTab controls which main screen is shown
  const [mainTab, setMainTab] = useState('Home');

  // Update userType when route changes
  React.useEffect(() => {
    if (nav.params.userType) {
      setUserType(nav.params.userType);
    }
  }, [nav.params.userType]);

  // navigation helpers passed into screens
  const navigation = {
    ...nav,
    push: (name, params) => nav.push(name, params),
    pop: () => nav.pop(),
    replace: (name, params) => nav.replace(name, params),
    resetTo: (name, params) => nav.resetTo(name, params),
    // switch to a main tab AND ensure the app is inside the Main container
    switchTab: (tabName) => {
      setMainTab(tabName);
      // If user is not in appropriate Main screen, bring them there
      if (userType === 'student' && nav.current !== 'StudentMain') {
        nav.replace('StudentMain', { userType: 'student' });
      } else if (userType === 'teacher' && nav.current !== 'Main') {
        nav.replace('Main', { userType: 'teacher' });
      }
    },
  };

  // Main area - shows the current main tab screen based on user type
  const renderMainArea = () => {
    if (userType === 'student') {
      // Student tabs
      if (mainTab === 'Home') return <StudentHomeScreen nav={navigation} />;
      if (mainTab === 'Results') return <StudentResultsScreen nav={navigation} />;
      if (mainTab === 'Sheets') return <StudentSheetsScreen nav={navigation} />;
      if (mainTab === 'Profile') return <ProfileScreen nav={navigation} userType="student" />;
      return <StudentHomeScreen nav={navigation} />;
    } else {
      // Teacher tabs
      if (mainTab === 'Home') return <HomeScreen nav={navigation} />;
      if (mainTab === 'Evaluations') return <EvaluationsScreen nav={navigation} />;
      if (mainTab === 'Analytics') return <AnalyticsScreen nav={navigation} />;
      if (mainTab === 'Profile') return <ProfileScreen nav={navigation} userType="teacher" />;
      return <HomeScreen nav={navigation} />;
    }
  };

  // Whether to show the bottom tabs
  const shouldShowTabs = route !== 'Login' && route !== 'RoleSelection';

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'default'} />

      {/* Top-level route rendering */}
      {route === 'RoleSelection' && <RoleSelectionScreen nav={navigation} />}
      {route === 'Login' && <LoginScreen nav={navigation} />}
      {route === 'CameraScan' && <CameraScanScreen nav={navigation} />}

      {/* Teacher Main container */}
      {route === 'Main' && (
        <SafeAreaView style={{ flex: 1 }}>
          {renderMainArea()}
        </SafeAreaView>
      )}

      {/* Student Main container */}
      {route === 'StudentMain' && (
        <SafeAreaView style={{ flex: 1 }}>
          {renderMainArea()}
        </SafeAreaView>
      )}

      {/* Other teacher-specific pages */}
      {route === 'NewEvaluation' && <NewEvaluationScreen nav={navigation} />}
      {route === 'Results' && <ResultsScreen nav={navigation} />}
      {route === 'QuestionAnalysis' && <QuestionAnalysisScreen nav={navigation} />}

      {/* Student-specific pages */}
      {route === 'StudentResultDetail' && <StudentResultDetailScreen nav={navigation} />}

      {/* Persistent bottom tabs (show for all routes except Login and RoleSelection) */}
      {shouldShowTabs && (
        <View style={styles.bottomTabsContainer}>
          <SafeAreaView edges={['bottom']} style={styles.bottomTabsSafe}>
            <View style={styles.bottomTabs}>
              {userType === 'student' ? (
                <>
                  <TabButton
                    label="Home"
                    active={mainTab === 'Home'}
                    onPress={() => navigation.switchTab('Home')}
                  />
                  <TabButton
                    label="Results"
                    active={mainTab === 'Results'}
                    onPress={() => navigation.switchTab('Results')}
                  />
                  <TabButton
                    label="Sheets"
                    active={mainTab === 'Sheets'}
                    onPress={() => navigation.switchTab('Sheets')}
                  />
                  <TabButton
                    label="Profile"
                    active={mainTab === 'Profile'}
                    onPress={() => navigation.switchTab('Profile')}
                  />
                </>
              ) : (
                <>
                  <TabButton
                    label="Home"
                    active={mainTab === 'Home'}
                    onPress={() => navigation.switchTab('Home')}
                  />
                  <TabButton
                    label="Evaluations"
                    active={mainTab === 'Evaluations'}
                    onPress={() => navigation.switchTab('Evaluations')}
                  />
                  <TabButton
                    label="Analytics"
                    active={mainTab === 'Analytics'}
                    onPress={() => navigation.switchTab('Analytics')}
                  />
                  <TabButton
                    label="Profile"
                    active={mainTab === 'Profile'}
                    onPress={() => navigation.switchTab('Profile')}
                  />
                </>
              )}
            </View>
          </SafeAreaView>
        </View>
      )}
    </SafeAreaView>
  );
}

/* Small tab button component */
function TabButton({ label, active, onPress }) {
  return (
    <TouchableOpacity style={styles.tabButton} onPress={onPress}>
      <Text style={active ? styles.tabActiveText : styles.tabText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bottomTabsContainer: {
    // keep the tab bar visually above content
    borderTopWidth: 1,
    borderColor: '#eef2f7',
    backgroundColor: '#fff',
  },
  bottomTabsSafe: {
    // ensures safe area padding on devices with home indicator
  },
  bottomTabs: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  tabButton: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabText: { color: '#6b7280' },
  tabActiveText: { color: '#2563eb', fontWeight: '700' },
});
