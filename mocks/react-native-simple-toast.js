const Toast = {
    show: (message, duration, options) => {
        console.log('Mock Toast:', message);
    },
    showWithGravity: (message, duration, gravity, options) => {
        console.log('Mock Toast:', message);
    },
    showWithGravityAndOffset: (message, duration, gravity, xOffset, yOffset, options) => {
        console.log('Mock Toast:', message);
    },
    LONG: 3.5,
    SHORT: 2.0,
    TOP: 'top',
    BOTTOM: 'bottom',
    CENTER: 'center',
};

export default Toast;
