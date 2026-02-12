// App.js (persistent bottom tabs)
import React, { useState } from 'react';
import { StatusBar, Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CameraScanScreen from './src/screens/CameraScanScreen';

import useSimpleNavigation from './src/navigation/SimpleNav';

import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import EvaluationsScreen from './src/screens/EvaluationsScreen';
import NewEvaluationScreen from './src/screens/NewEvaluationScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import QuestionAnalysisScreen from './src/screens/QuestionAnalysisScreen';

export default function App() {
  // global nav stack
  const nav = useSimpleNavigation(['Login']);
  const route = nav.current;

  // mainTab controls which main screen is shown
  const [mainTab, setMainTab] = useState('Home');

  // navigation helpers passed into screens
  const navigation = {
    push: (name) => nav.push(name),
    pop: () => nav.pop(),
    replace: (name) => nav.replace(name),
    resetTo: (name) => nav.resetTo(name),
    // switch to a main tab AND ensure the app is inside the Main container
    switchTab: (tabName) => {
      setMainTab(tabName);
      // If user is not in Main, bring them into Main container
      if (nav.current !== 'Main') nav.replace('Main');
    },
  };

  // Main area - shows the current main tab screen
  const renderMainArea = () => {
    if (mainTab === 'Home') return <HomeScreen nav={navigation} />;
    if (mainTab === 'Evaluations') return <EvaluationsScreen nav={navigation} />;
    if (mainTab === 'Analytics') return <AnalyticsScreen nav={navigation} />;
    if (mainTab === 'Profile') return <ProfileScreen nav={navigation} />;
    // fallback
    return <HomeScreen nav={navigation} />;
  };

  // Whether to show the bottom tabs. Current behavior: show on every screen except Login.
  // Change this to hide on specific routes if you prefer (e.g., hide on 'Login' only).
  const shouldShowTabs = route !== 'Login';

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'default'} />

      {/* Top-level route rendering */}
      {route === 'Login' && <LoginScreen nav={navigation} />}
      {route === 'CameraScan' && <CameraScanScreen nav={navigation} />}

      {/* Main container: when route is 'Main' render the selected tab's screen */}
      {route === 'Main' && (
        <SafeAreaView style={{ flex: 1 }}>
          {renderMainArea()}
        </SafeAreaView>
      )}

      {/* Other top-level pages (they will render above the main area) */}
      {route === 'NewEvaluation' && <NewEvaluationScreen nav={navigation} />}
      {route === 'Results' && <ResultsScreen nav={navigation} />}
      {route === 'QuestionAnalysis' && <QuestionAnalysisScreen nav={navigation} />}

      {/* Persistent bottom tabs (show for all routes except Login). */}
      {shouldShowTabs && (
        <View style={styles.bottomTabsContainer}>
          <SafeAreaView edges={['bottom']} style={styles.bottomTabsSafe}>
            <View style={styles.bottomTabs}>
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
