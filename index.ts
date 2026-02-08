import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

// Polyfill to prevent "e.persist is not a function" errors on Web
if (Platform.OS === 'web' && typeof Event !== 'undefined') {
    // @ts-ignore
    if (!Event.prototype.persist) {
        // @ts-ignore
        Event.prototype.persist = function () { };
    }
}

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
