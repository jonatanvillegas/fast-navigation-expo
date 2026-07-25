const React = require('react');
const { MaterialCommunityIcons } = require('@expo/vector-icons');
const { createDrawerNavigator } = require('@react-navigation/drawer');
const { createNativeStackNavigator } = require('@react-navigation/native-stack');
const { Animated, Platform, StyleSheet, TouchableOpacity, View } = require('react-native');
const {
  SafeAreaProvider,
  useSafeAreaInsets,
} = require('react-native-safe-area-context');

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

const fastNavigationColors = {
  border: '#DDEAE5',
  primary: '#0D9A69',
  primaryDark: '#006B49',
  primarySoft: '#58CFAC',
  shadow: '#0B3D2F',
  surface: '#FFFFFF',
  surfaceMuted: '#EAF4F0',
  textMuted: '#657873',
};

const QuickTabsVisibilityContext = React.createContext({
  visible: true,
  showTabs: function noop() {},
  hideTabs: function noop() {},
  handleScroll: function noop() {},
});

function FastNavigationProvider(props) {
  return React.createElement(
    SafeAreaProvider,
    null,
    React.createElement(QuickTabsVisibilityProvider, null, props.children)
  );
}

function QuickTabsVisibilityProvider(props) {
  const visibleState = React.useState(true);
  const visible = visibleState[0];
  const setVisible = visibleState[1];
  const lastOffset = React.useRef(0);

  const showTabs = React.useCallback(function showTabs() {
    setVisible(true);
  }, []);

  const hideTabs = React.useCallback(function hideTabs() {
    setVisible(false);
  }, []);

  const handleScroll = React.useCallback(function handleScroll(event) {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const diff = currentOffset - lastOffset.current;

    if (currentOffset < 24 || diff < -8) {
      setVisible(true);
    } else if (diff > 8 && currentOffset > 80) {
      setVisible(false);
    }

    lastOffset.current = currentOffset;
  }, []);

  const value = React.useMemo(
    function createValue() {
      return { visible, showTabs, hideTabs, handleScroll };
    },
    [visible, showTabs, hideTabs, handleScroll]
  );

  return React.createElement(
    QuickTabsVisibilityContext.Provider,
    { value },
    props.children
  );
}

function useQuickTabsVisibility() {
  return React.useContext(QuickTabsVisibilityContext);
}

function FastQuickTabsBar(props) {
  const colors = resolveColors(props);
  const tabs = props.tabs || [];
  const barHeight = props.barHeight || 58;
  const iconSize = props.iconSize || 25;
  const centerIconSize = props.centerIconSize || 30;
  const rootDrawerName = props.rootDrawerName || 'RootDrawer';
  const visibility = useQuickTabsVisibility();
  const insets = useSafeAreaInsets();
  const translateY = React.useRef(new Animated.Value(0)).current;
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 0);
  const computedBarHeight = barHeight + bottomInset;
  const styles = React.useMemo(
    function createStyles() {
      return createQuickTabsStyles(colors);
    },
    [colors]
  );

  React.useEffect(
    function animateVisibility() {
      Animated.timing(translateY, {
        duration: 180,
        toValue: visibility.visible ? 0 : computedBarHeight + 26,
        useNativeDriver: true,
      }).start();
    },
    [computedBarHeight, translateY, visibility.visible]
  );

  function handlePress(item) {
    if (props.onTabPress) {
      props.onTabPress(item);
      return;
    }

    navigateToDrawerScreen(props.navigationRef, item.screen, rootDrawerName);
  }

  return React.createElement(
    Animated.View,
    {
      pointerEvents: 'box-none',
      style: [styles.wrap, { transform: [{ translateY }] }],
    },
    React.createElement(
      View,
      {
        style: [
          styles.tabBar,
          { height: computedBarHeight, paddingBottom: bottomInset + 4 },
        ],
      },
      tabs.map(function renderTab(item) {
        const isCenter = Boolean(item.center);

        return React.createElement(
          TouchableOpacity,
          {
            activeOpacity: 0.78,
            key: item.key || item.screen || item.icon,
            onPress: function onPress() {
              handlePress(item);
            },
            style: isCenter ? styles.centerButtonWrap : styles.tabButton,
          },
          React.createElement(
            View,
            { style: isCenter ? styles.centerButton : styles.iconSlot },
            React.createElement(MaterialCommunityIcons, {
              name: item.icon,
              size: isCenter ? centerIconSize : iconSize,
              color: isCenter ? colors.surface : item.color || colors.textMuted,
            })
          )
        );
      })
    )
  );
}

function FastDrawerNavigator(props) {
  const colors = resolveColors(props);
  const routes = props.routes || [];
  const defaultOptions = {
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
  };
  const screenOptions =
    typeof props.screenOptions === 'function'
      ? function mergedScreenOptions(optionsProps) {
          return Object.assign({}, defaultOptions, props.screenOptions(optionsProps));
        }
      : Object.assign({}, defaultOptions, props.screenOptions || {});

  return React.createElement(
    Drawer.Navigator,
    { screenOptions },
    routes.map(function renderRoute(route) {
      return React.createElement(Drawer.Screen, {
        component: route.component,
        initialParams: route.initialParams,
        key: route.name,
        name: route.name,
        options: buildDrawerScreenOptions(route),
      });
    })
  );
}

function FastStackNavigator(props) {
  const screens = props.screens || [];
  const drawerName = props.drawerName || 'RootDrawer';
  const screenOptions = props.screenOptions || { headerShown: false };

  return React.createElement(
    Stack.Navigator,
    { screenOptions },
    React.createElement(Stack.Screen, {
      name: drawerName,
      component: props.drawerComponent,
    }),
    screens.map(function renderScreen(screen) {
      return React.createElement(Stack.Screen, {
        component: screen.component,
        initialParams: screen.initialParams,
        key: screen.name,
        name: screen.name,
        options: screen.options,
      });
    })
  );
}

function navigateToDrawerScreen(navigationRef, screen, rootDrawerName) {
  const drawerName = rootDrawerName || 'RootDrawer';

  if (navigationRef && navigationRef.isReady && navigationRef.isReady()) {
    navigationRef.navigate(drawerName, { screen });
  }
}

function buildDrawerScreenOptions(route) {
  const drawerIcon = route.icon
    ? function drawerIcon(iconProps) {
        return React.createElement(MaterialCommunityIcons, {
          name: route.icon,
          color: iconProps.color,
          size: iconProps.size,
        });
      }
    : undefined;

  if (typeof route.options === 'function') {
    return function routeOptions(optionsProps) {
      return Object.assign({ drawerIcon }, route.options(optionsProps));
    };
  }

  return Object.assign({ drawerIcon }, route.options || {});
}

function resolveColors(props) {
  const baseColors = Object.assign({}, fastNavigationColors, props.colors || {});
  const primaryColor = props.primaryColor || props.color;

  if (!primaryColor) {
    return baseColors;
  }

  return Object.assign({}, baseColors, {
    primary: primaryColor,
    primaryDark: props.primaryDarkColor || primaryColor,
    primarySoft: props.primarySoftColor || primaryColor,
  });
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

module.exports = {
  FastDrawerNavigator,
  FastNavigationProvider,
  FastQuickTabsBar,
  FastStackNavigator,
  QuickTabsVisibilityProvider,
  SemaneroDrawerNavigator: FastDrawerNavigator,
  SemaneroQuickTabsBar: FastQuickTabsBar,
  SemaneroStackNavigator: FastStackNavigator,
  fastNavigationColors,
  navigateToDrawerScreen,
  semaneroNavigationColors: fastNavigationColors,
  useQuickTabsVisibility,
};


