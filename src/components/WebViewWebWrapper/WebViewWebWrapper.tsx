import React, { forwardRef } from 'react';
import { WebView, WebViewProps } from 'react-native-webview';

const WebViewWebWrapper = forwardRef<WebView, WebViewProps>((props, ref) => {
    return <WebView {...props} ref={ref} />;
});

export default WebViewWebWrapper;
