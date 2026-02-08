import React, { useEffect } from 'react'
import { addEventListener } from "@react-native-community/netinfo";
import { ToastCall } from '../utils/Helpers';

const CheckConnection = ({ isConnected, setIsConnected }: { isConnected: boolean | null, setIsConnected: (e: boolean) => void }) => {

  const checkConnectionSpeed = async () => {
    try {
      const startTime = Date.now();
      // Make a HEAD request to a reliable server to check latency
      // Using a random query param to prevent caching
      await fetch(`https://www.google.com?t=${startTime}`, {
        method: 'HEAD',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // If latency is greater than 2000ms (2 seconds), consider it slow
      if (duration > 2000) {
        ToastCall('warning', 'Tu conexión es lenta puede afectar tu experiencia en la aplicación.', 'ES');
      }
    } catch (error) {
      // Silent fail or optional warning for unstable connection
    }
  };

  useEffect(() => {
    const unsubscribe = addEventListener(state => {
      if (state.isConnected) {
        setIsConnected(false)

        if (state.type === "cellular") {
          // Warn if 2G or 3G
          if (state.details.cellularGeneration === "2g" || state.details.cellularGeneration === "3g") {
            ToastCall('warning', 'Tu conexión es lenta (datos) y puede afectar tu experiencia.', 'ES');
          }
        }

        // Check real latency
        checkConnectionSpeed();

      } else {
        ToastCall('error', 'No tienes conexión.', 'ES');
        setIsConnected(true)
      }
    });
    return () => {
      unsubscribe();
    }
  }, [])


  return (
    <>
    </>
  )
}

export default CheckConnection