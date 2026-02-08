const database = () => ({
    ref: (path) => ({
        update: async () => { },
        on: (event, cb) => cb,
        off: (event, cb) => { },
        once: async () => ({ val: () => ({}) }),
        onDisconnect: () => ({
            update: async () => { },
        }),
    }),
    getServerTime: () => ({
        toISOString: () => new Date().toISOString(),
    }),
});

export const FirebaseDatabaseTypes = {};
export const firebase = {};
export default database;
