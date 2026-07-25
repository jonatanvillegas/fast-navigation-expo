import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

export const fastNavigationColors = {
  border: '#DDEAE5',
  primary: '#0D9A69',
  primaryDark: '#006B49',
  primarySoft: '#58CFAC',
  shadow: '#0B3D2F',
  surface: '#FFFFFF',
  surfaceMuted: '#EAF4F0',
  textMuted: '#657873',
};

const QuickTabsVisibilityContext = createContext({
  visible: true,
  showTabs: () => {},
  hideTabs: () => {},
  handleScroll: () => {},
});

export function QuickTabsVisibilityProvider({ children }) {
  const [visible, setVisible] = useState(true);
  const lastOffset = useRef(0);

  const showTabs = useCallback(() => setVisible(true), []);
  const hideTabs = useCallback(() => setVisible(false), []);

  const handleScroll = useCallback((event) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const diff = currentOffset - lastOffset.current;

    if (currentOffset < 24 || diff < -8) {
      setVisible(true);
    } else if (diff > 8 && currentOffset > 80) {
      setVisible(false);
    }

    lastOffset.current = currentOffset;
  }, []);

  const value = useMemo(
    () => ({ visible, showTabs, hideTabs, handleScroll }),
    [handleScroll, hideTabs, showTabs, visible]
  );

  return (
    <QuickTabsVisibilityContext.Provider value={value}>
      {children}
    </QuickTabsVisibilityContext.Provider>
  );
}

export function useQuickTabsVisibility() {
  return useContext(QuickTabsVisibilityContext);
}

export function FastQuickTabsBar({
  barHeight = 58,
  colors = fastNavigationColors,
  iconSize = 25,
  centerIconSize = 30,
  navigationRef,
  onTabPress,
  rootDrawerName = 'RootDrawer',
  tabs = [],
}) {
  const { visible } = useQuickTabsVisibility();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(0)).current;
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 0);
  const computedBarHeight = barHeight + bottomInset;
  const styles = useMemo(() => createQuickTabsStyles(colors), [colors]);

  useEffect(() => {
    Animated.timing(translateY, {
      duration: 180,
      toValue: visible ? 0 : computedBarHeight + 26,
      useNativeDriver: true,
    }).start();
  }, [computedBarHeight, translateY, visible]);

  function handlePress(item) {
    if (onTabPress) {
      onTabPress(item);
      return;
    }

    navigateToDrawerScreen(navigationRef, item.screen, rootDrawerName);
  }

  return (
    <Animated.View pointerEvents="box-none" style={[styles.wrap, { transform: [{ translateY }] }]}>
      <View
        style={[
          styles.tabBar,
          { height: computedBarHeight, paddingBottom: bottomInset + 4 },
        ]}
      >
        {tabs.map((item) => (
          <TouchableOpacity
            activeOpacity={0.78}
            key={item.key ?? item.screen ?? item.icon}
            onPress={() => handlePress(item)}
            style={item.center ? styles.centerButtonWrap : styles.tabButton}
          >
            <View style={item.center ? styles.centerButton : styles.iconSlot}>
              <MaterialCommunityIcons
                name={item.icon}
                size={item.center ? centerIconSize : iconSize}
                color={item.center ? colors.surface : item.color ?? colors.textMuted}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
}

export function FastDrawerNavigator({
  colors = fastNavigationColors,
  routes = [],
  screenOptions,
}) {
  const defaultScreenOptions = useMemo(
    () => ({
      drawerActiveBackgroundColor: colors.surfaceMuted,
      drawerActiveTintColor: colors.primary,
      drawerInactiveTintColor: colors.textMuted,
      drawerStyle: {
        backgroundColor: colors.surface,
        width: 288,
      },
      headerTintColor: colors.surface,
      headerStyle: {
        backgroundColor: colors.primaryDark,
      },
      headerTitleStyle: {
        fontWeight: '700',
      },
      ...screenOptions,
    }),
    [colors, screenOptions]
  );

  return (
    <Drawer.Navigator screenOptions={defaultScreenOptions}>
      {routes.map((route) => (
        <Drawer.Screen
          component={route.component}
          initialParams={route.initialParams}
          key={route.name}
          name={route.name}
          options={{
            drawerIcon: route.icon
              ? ({ color, size }) => (
                  <MaterialCommunityIcons name={route.icon} color={color} size={size} />
                )
              : undefined,
            ...route.options,
          }}
        />
      ))}
    </Drawer.Navigator>
  );
}

export function FastStackNavigator({
  drawerComponent,
  drawerName = 'RootDrawer',
  screenOptions = { headerShown: false },
  screens = [],
}) {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name={drawerName} component={drawerComponent} />
      {screens.map((screen) => (
        <Stack.Screen
          component={screen.component}
          initialParams={screen.initialParams}
          key={screen.name}
          name={screen.name}
          options={screen.options}
        />
      ))}
    </Stack.Navigator>
  );
}

export const SemaneroQuickTabsBar = FastQuickTabsBar;
export const SemaneroDrawerNavigator = FastDrawerNavigator;
export const SemaneroStackNavigator = FastStackNavigator;
export const semaneroNavigationColors = fastNavigationColors;

export function navigateToDrawerScreen(navigationRef, screen, rootDrawerName = 'RootDrawer') {
  if (navigationRef?.isReady?.()) {
    navigationRef.navigate(rootDrawerName, { screen });
  }
}

function createQuickTabsStyles(colors) {
  return StyleSheet.create({
    wrap: {
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
    },
    tabBar: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      elevation: 20,
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: 18,
      paddingTop: 8,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: -8 },
      shadowOpacity: 0.12,
      shadowRadius: 18,
    },
    tabButton: {
      alignItems: 'center',
      height: 44,
      justifyContent: 'center',
      width: 50,
    },
    iconSlot: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    centerButtonWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      top: -18,
      width: 64,
    },
    centerButton: {
      alignItems: 'center',
      backgroundColor: colors.primarySoft,
      borderColor: colors.surface,
      borderRadius: 29,
      borderWidth: 6,
      elevation: 12,
      height: 58,
      justifyContent: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.28,
      shadowRadius: 12,
      width: 58,
    },
  });
}
