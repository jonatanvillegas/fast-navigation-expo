# fast-navigation

Reusable drawer and floating quick-tabs navigation components for React Native and Expo apps.

## Expo SDK 54 Install

Use `expo install` for native Expo/RN packages so your project receives versions compatible with the SDK.

```sh
npm install fast-navigation @react-navigation/native @react-navigation/drawer @react-navigation/native-stack
npx expo install @expo/vector-icons react-native-gesture-handler react-native-reanimated react-native-worklets react-native-safe-area-context react-native-screens
```

For Expo SDK 54, the expected native versions include:

```txt
react-native-reanimated ~4.1.1
react-native-worklets 0.5.1
react-native-safe-area-context ~5.6.0
react-native-screens ~4.16.0
react-native-gesture-handler ~2.28.0
```

## Babel

The library is published without JSX, so it does not need a special Babel plugin.

Expo SDK 54 automatically configures Reanimated through `babel-preset-expo`. If your app does not have `babel.config.js`, you usually do not need to create one.

If your app does need `babel.config.js`, use this:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

For Expo SDK 54, install the matching preset if Babel cannot resolve it:

```sh
npm install --save-dev babel-preset-expo@54.0.12
```

Do not install the latest `babel-preset-expo` manually in an SDK 54 app. A newer preset can emit code that your SDK 54 Hermes version cannot compile.

## Entry File

Place `import 'react-native-gesture-handler';` at the top of your entry file, commonly `index.js`.

```js
import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
```

## App Example

```jsx
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import {
  FastDrawerNavigator,
  FastQuickTabsBar,
  FastStackNavigator,
  QuickTabsVisibilityProvider,
} from 'fast-navigation';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const navigationRef = createNavigationContainerRef();

function Screen({ title }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>{title}</Text>
    </View>
  );
}

function HomeScreen() {
  return <Screen title="Home" />;
}

function ClientsScreen() {
  return <Screen title="Clients" />;
}

function PaymentsScreen() {
  return <Screen title="Payments" />;
}

const drawerRoutes = [
  { name: 'Home', component: HomeScreen, icon: 'home-outline' },
  { name: 'Clients', component: ClientsScreen, icon: 'account-group-outline' },
  { name: 'Payments', component: PaymentsScreen, icon: 'cash-clock' },
];

const quickTabs = [
  { screen: 'Clients', icon: 'account-group-outline' },
  { screen: 'Home', icon: 'home', center: true },
  { screen: 'Payments', icon: 'cash-clock' },
];

function DrawerNavigator() {
  return <FastDrawerNavigator color="#0D9A69" routes={drawerRoutes} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QuickTabsVisibilityProvider>
        <NavigationContainer ref={navigationRef}>
          <FastStackNavigator drawerComponent={DrawerNavigator} />
          <FastQuickTabsBar
            color="#0D9A69"
            navigationRef={navigationRef}
            tabs={quickTabs}
          />
        </NavigationContainer>
      </QuickTabsVisibilityProvider>
    </SafeAreaProvider>
  );
}
```

You can also use `FastNavigationProvider` if you prefer a shorter wrapper. It includes `SafeAreaProvider` and `QuickTabsVisibilityProvider` internally.

```jsx
import { FastNavigationProvider } from 'fast-navigation';
```

## Color

The tabs and drawer use green by default. You can send a custom color with `color` or `primaryColor`:

```jsx
<FastDrawerNavigator color="#2563EB" routes={drawerRoutes} />
<FastQuickTabsBar color="#2563EB" navigationRef={navigationRef} tabs={quickTabs} />
```

For full control, pass a `colors` object with `primary`, `primaryDark`, `primarySoft`, `surface`, `surfaceMuted`, `textMuted`, and `shadow`.

## Hide Tabs On Scroll

Use `handleScroll` in scrollable screens:

```jsx
import { ScrollView } from 'react-native';
import { useQuickTabsVisibility } from 'fast-navigation';

export function ClientsScreen() {
  const { handleScroll } = useQuickTabsVisibility();

  return (
    <ScrollView onScroll={handleScroll} scrollEventThrottle={16}>
      {/* content */}
    </ScrollView>
  );
}
```
