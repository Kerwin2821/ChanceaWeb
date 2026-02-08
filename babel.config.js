module.exports = function (api) {
  const isWeb = api.caller((caller) => caller && caller.platform === 'web');
  api.cache(false);

  const plugins = [
    [
      "module:react-native-dotenv",
      {
        envName: "APP_ENV",
        moduleName: "@env",
        path: ".env",
        blocklist: null,
        allowlist: null,
        blacklist: null, // DEPRECATED
        whitelist: null, // DEPRECATED
        safe: false,
        allowUndefined: true,
        verbose: false,
      },
    ],
    "transform-inline-environment-variables",
    "react-native-reanimated/plugin",
  ];

  if (isWeb) {
    plugins.push([
      "module-resolver",
      {
        alias: {
          "react-native-maps": "./mocks/react-native-maps.js",
          "react-native-simple-toast": "./mocks/react-native-simple-toast.js",
          "react-native-share": "./mocks/react-native-share.js",
          "react-native-video-trim": "./mocks/react-native-video-trim.js",
          "react-native-compressor": "./mocks/react-native-compressor.js",
          "@react-native-firebase/app": "./mocks/firebase-app.js",
          "@react-native-firebase/messaging": "./mocks/firebase-messaging.js",
          "@react-native-firebase/firestore": "./mocks/firebase-firestore.js",
          "@react-native-firebase/database": "./mocks/firebase-database.js",
          "@react-native-google-signin/google-signin": "./src/utils/GoogleSignin.web.ts",
          "@stripe/stripe-react-native": "react-native-web",
        },
      },
    ]);
  }

  return {
    presets: [
      [
        "babel-preset-expo",
        {
          jsxImportSource: "nativewind",
        },
      ],
      "nativewind/babel",
    ],
    plugins,
  };
};
