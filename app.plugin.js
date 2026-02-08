// app.plugin.js

const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withCustomNotificationColor(config) {
  return withAndroidManifest(config, (config) => {
    const appManifest = config.modResults.manifest.application?.[0];
    if (!appManifest) return config;

    // Asegúrate de que el atributo tools:replace se incluye correctamente
    appManifest['meta-data'] = appManifest['meta-data'] || [];

    // Elimina si ya existe el atributo duplicado para evitar errores
    appManifest['meta-data'] = appManifest['meta-data'].filter(
      (item) => item.$['android:name'] !== 'com.google.firebase.messaging.default_notification_color'
    );

    appManifest['meta-data'].push({
      $: {
        'android:name': 'com.google.firebase.messaging.default_notification_color',
        'android:resource': '@color/notification_icon_color',
        'tools:replace': 'android:resource',
      },
    });

    return config;
  });
};
