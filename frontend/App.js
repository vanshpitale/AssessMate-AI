// App.js (persistent bottom tabs with Teacher & Student support – upgraded UI)
import React, { useState } from 'react';
import { StatusBar, Platform, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
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

import { Colors, Radius, Shadow, Spacing, Typography } from './src/theme';

const TEACHER_TABS = [
  { key: 'Home',        icon: '🏠', label: 'Home' },
  { key: 'Evaluations', icon: '📋', label: 'Evaluations' },
  { key: 'Analytics',   icon: '📊', label: 'Analytics' },
  { key: 'Profile',     icon: '👤', label: 'Profile' },
];

const STUDENT_TABS = [
  { key: 'Home',    icon: '🏠', label: 'Home' },
  { key: 'Results', icon: '📈', label: 'Results' },
  { key: 'Sheets',  icon: '📄', label: 'Sheets' },
  { key: 'Profile', icon: '👤', label: 'Profile' },
];

export default function App() {
  const nav = useSimpleNavigation(['RoleSelection']);
  const route = nav.current;
  const [userType, setUserType] = useState(nav.params.userType || 'teacher');
  const [mainTab, setMainTab] = useState('Home');

  React.useEffect(() => {
    if (nav.params.userType) {
      setUserType(nav.params.userType);
    }
  }, [nav.params.userType]);

  const navigation = {
    ...nav,
    push: (name, params) => nav.push(name, params),
    pop: () => nav.pop(),
    replace: (name, params) => nav.replace(name, params),
    resetTo: (name, params) => nav.resetTo(name, params),
    switchTab: (tabName) => {
      setMainTab(tabName);
      if (userType === 'student' && nav.current !== 'StudentMain') {
        nav.replace('StudentMain', { userType: 'student' });
      } else if (userType === 'teacher' && nav.current !== 'Main') {
        nav.replace('Main', { userType: 'teacher' });
      }
    },
  };

  const renderMainArea = () => {
    if (userType === 'student') {
      if (mainTab === 'Home')    return <StudentHomeScreen nav={navigation} />;
      if (mainTab === 'Results') return <StudentResultsScreen nav={navigation} />;
      if (mainTab === 'Sheets')  return <StudentSheetsScreen nav={navigation} />;
      if (mainTab === 'Profile') return <ProfileScreen nav={navigation} userType="student" />;
      return <StudentHomeScreen nav={navigation} />;
    } else {
      if (mainTab === 'Home')        return <HomeScreen nav={navigation} />;
      if (mainTab === 'Evaluations') return <EvaluationsScreen nav={navigation} />;
      if (mainTab === 'Analytics')   return <AnalyticsScreen nav={navigation} />;
      if (mainTab === 'Profile')     return <ProfileScreen nav={navigation} userType="teacher" />;
      return <HomeScreen nav={navigation} />;
    }
  };

  const shouldShowTabs = route !== 'Login' && route !== 'RoleSelection';
  const tabs = userType === 'student' ? STUDENT_TABS : TEACHER_TABS;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'dark-content'}
        backgroundColor={Colors.background}
      />

      {route === 'RoleSelection' && <RoleSelectionScreen nav={navigation} />}
      {route === 'Login'         && <LoginScreen nav={navigation} />}
      {route === 'CameraScan'    && <CameraScanScreen nav={navigation} />}

      {(route === 'Main' || route === 'StudentMain') && (
        <View style={{ flex: 1 }}>
          {renderMainArea()}
        </View>
      )}

      {route === 'NewEvaluation'    && <NewEvaluationScreen nav={navigation} />}
      {route === 'Results'          && <ResultsScreen nav={navigation} />}
      {route === 'QuestionAnalysis' && <QuestionAnalysisScreen nav={navigation} />}
      {route === 'StudentResultDetail' && <StudentResultDetailScreen nav={navigation} />}

      {shouldShowTabs && (
        <View style={styles.tabBar}>
          {tabs.map(tab => (
            <TabButton
              key={tab.key}
              tab={tab}
              active={mainTab === tab.key}
              onPress={() => navigation.switchTab(tab.key)}
            />
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

function TabButton({ tab, active, onPress }) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.88, useNativeDriver: true, friction: 6 }),
      Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true, friction: 6 }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity style={styles.tabItem} onPress={handlePress} activeOpacity={0.7}>
      {/* Active top indicator */}
      <View style={[styles.activeBar, active && styles.activeBarVisible]} />
      <Animated.View
        style={[
          styles.tabContent,
          active && styles.tabContentActive,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={[styles.tabIcon, active && styles.tabIconActive]}>{tab.icon}</Text>
        <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    ...Shadow.md,
    shadowOffset: { width: 0, height: -4 },
    height: 68,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 0,
  },
  activeBar: {
    height: 3,
    width: 24,
    borderRadius: Radius.full,
    backgroundColor: 'transparent',
    marginBottom: 4,
    alignSelf: 'center',
  },
  activeBarVisible: {
    backgroundColor: Colors.primary,
  },
  tabContent: {
    alignItems: 'center',
    paddingBottom: 4,
  },
  tabContentActive: {
    // subtle highlight behind active tab
  },
  tabIcon: {
    fontSize: 22,
    marginBottom: 2,
    opacity: 0.5,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: Typography.medium,
    color: Colors.textMuted,
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: Typography.bold,
  },
});
