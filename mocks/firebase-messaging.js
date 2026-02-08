const messaging = () => ({
    onNotificationOpenedApp: (cb) => {
        return () => { };
    },
    getInitialNotification: async () => null,
    setBackgroundMessageHandler: (cb) => { },
    onMessage: (cb) => {
        return () => { };
    },
    requestPermission: async () => 1,
    getToken: async () => 'mock-token',
    onTokenRefresh: (cb) => {
        return () => { };
    },
});

export default messaging;
