const Share = {
    open: async (options) => {
        console.log('Mock Share: open called', options);
        return { success: true, message: 'Mocked share' };
    },
    shareSingle: async (options) => {
        console.log('Mock Share: shareSingle called', options);
        return { success: true };
    },
    isPackageInstalled: async (packageName) => {
        return { isInstalled: false, message: 'Mocked check' };
    },
    Social: {
        FACEBOOK: 'facebook',
        PAGESMANAGER: 'pagesmanager',
        TWITTER: 'twitter',
        WHATSAPP: 'whatsapp',
        INSTAGRAM: 'instagram',
        INSTAGRAM_STORIES: 'instagram-stories',
        GOOGLEPLUS: 'googleplus',
        EMAIL: 'email',
        PINTEREST: 'pinterest',
        LINKEDIN: 'linkedin',
        SMS: 'sms',
    },
};

export default Share;
