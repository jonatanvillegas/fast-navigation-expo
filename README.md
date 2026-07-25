# fast-navigation

Reusable drawer and floating quick-tabs navigation components for React Native apps.

## Install

```sh
npm install fast-navigation
```

Install the React Navigation peer dependencies required by your app:

```sh
npm install @react-navigation/native @react-navigation/drawer @react-navigation/native-stack react-native-safe-area-context react-native-screens react-native-gesture-handler react-native-reanimated
```

`@expo/vector-icons` is included by this package so MaterialCommunityIcons are available out of the box.

## Usage

```jsx
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import {
  FastDrawerNavigator,
  FastQuickTabsBar,
  FastStackNavigator,
  QuickTabsVisibilityProvider,
} from 'fast-navigation';

const navigationRef = createNavigationContainerRef();

const drawerRoutes = [
  { name: 'Home', component: HomeScreen, icon: 'home-outline' },
  { name: 'Clients', component: ClientsScreen, icon: 'account-group-outline' },
];

const stackRoutes = [
  { name: 'ClientForm', component: ClientFormScreen },
];

const tabs = [
  { screen: 'Clients', icon: 'account-group-outline' },
  { screen: 'Home', icon: 'home', center: true },
];

function DrawerNavigator() {
  return <FastDrawerNavigator routes={drawerRoutes} />;
}

export default function App() {
  return (
    <QuickTabsVisibilityProvider>
      <NavigationContainer ref={navigationRef}>
        <FastStackNavigator drawerComponent={DrawerNavigator} screens={stackRoutes} />
        <FastQuickTabsBar navigationRef={navigationRef} tabs={tabs} />
      </NavigationContainer>
    </QuickTabsVisibilityProvider>
  );
}
```

Use `useQuickTabsVisibility().handleScroll` on scrollable screens to hide the tabs while scrolling down and show them when scrolling up.
