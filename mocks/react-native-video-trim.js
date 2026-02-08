const VideoTrim = {
    showEditor: (uri, options) => {
        console.log('Mock VideoTrim: showEditor called', uri);
    },
    trimVideo: async (uri, options) => {
        console.log('Mock VideoTrim: trimVideo called');
        return uri;
    },
    compressVideo: async (uri, options) => {
        return uri;
    },
};

export default VideoTrim;
