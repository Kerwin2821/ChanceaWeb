import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet } from 'react-native';

const WebViewWebWrapper = forwardRef(({ source, style, onMessage, injectedJavaScript, ...props }: any, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useImperativeHandle(ref, () => ({
        reload: () => {
            if (iframeRef.current) {
                iframeRef.current.src = iframeRef.current.src;
            }
        },
        injectJavaScript: (script: string) => {
            console.warn('injectJavaScript is not fully supported on web iframes due to security restrictions.');
        }
    }));

    useEffect(() => {
        const handleWebMessage = (event: MessageEvent) => {
            if (onMessage && iframeRef.current && event.source === iframeRef.current.contentWindow) {
                onMessage({
                    nativeEvent: {
                        data: typeof event.data === 'string' ? event.data : JSON.stringify(event.data)
                    }
                });
            }
        };

        window.addEventListener('message', handleWebMessage);
        return () => window.removeEventListener('message', handleWebMessage);
    }, [onMessage]);

    return (
        <View style={[styles.container, style]}>
            <iframe
                ref={iframeRef}
                src={source?.uri}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="camera; microphone; fullscreen"
                {...props}
            />
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default WebViewWebWrapper;
