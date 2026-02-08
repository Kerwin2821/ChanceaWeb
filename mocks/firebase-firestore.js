const firestore = () => {
    const mockDoc = (id) => ({
        id: id || 'mock-id',
        get: async () => ({
            exists: true,
            data: () => ({}),
            id: id || 'mock-id'
        }),
        set: async () => { },
        update: async () => { },
        delete: async () => { },
        onSnapshot: (cb) => {
            if (typeof cb === 'function') {
                cb({ exists: true, data: () => ({}), docs: [] });
            } else if (cb && typeof cb.next === 'function') {
                cb.next({ exists: true, data: () => ({}), docs: [] });
            }
            return () => { };
        },
        collection: (path) => mockCollection(path),
    });

    const mockCollection = (path) => ({
        doc: (id) => mockDoc(id),
        add: async (data) => mockDoc('new-id'),
        limitToLast: () => mockCollection(path),
        orderBy: () => mockCollection(path),
        where: () => mockCollection(path),
        get: async () => ({
            forEach: (cb) => { },
            docs: [],
        }),
        onSnapshot: (cb) => {
            if (typeof cb === 'function') {
                cb({ docs: [] });
            } else if (cb && typeof cb.next === 'function') {
                cb.next({ docs: [] });
            }
            return () => { };
        },
    });

    return {
        collection: (path) => mockCollection(path),
        doc: (id) => mockDoc(id),
    };
};

export const firebase = {
    firestore: {
        FieldValue: {
            serverTimestamp: () => new Date().toISOString(),
        }
    }
};

export default firestore;
