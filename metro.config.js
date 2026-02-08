// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const { wrapWithReanimatedMetroConfig } = require("react-native-reanimated/metro-config");

let config = getDefaultConfig(__dirname);

// ADDED: Configurar alias explícitos para web
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "react-native": require.resolve("react-native-web"),
  "react-native-maps": require.resolve("./mocks/react-native-maps.js"),
  "react-native-simple-toast": require.resolve("./mocks/react-native-simple-toast.js"),
  "react-native-share": require.resolve("./mocks/react-native-share.js"),
  "react-native-video-trim": require.resolve("./mocks/react-native-video-trim.js"),
  "react-native-compressor": require.resolve("./mocks/react-native-compressor.js"),
  "@react-native-firebase/app": require.resolve("./mocks/firebase-app.js"),
  "@react-native-firebase/messaging": require.resolve("./mocks/firebase-messaging.js"),
  "@react-native-firebase/firestore": require.resolve("./mocks/firebase-firestore.js"),
  "@react-native-firebase/database": require.resolve("./mocks/firebase-database.js"),
  "@react-native-google-signin/google-signin": require.resolve("./src/utils/GoogleSignin.web.ts"),
  "@stripe/stripe-react-native": require.resolve("react-native-web"),
};

// Aplica NativeWind primero
config = withNativeWind(config, {
  input: "./global.css",
});

// Luego Reanimated (envuelve todo)
config = wrapWithReanimatedMetroConfig(config);

module.exports = config;
