import React, { useState, useEffect, useCallback } from 'react';
/* import { Image } from 'react-native'; */
import { View, StyleProp } from 'react-native';
import { getCachedImage as getCachedImageService, prefetchImage } from './CacheImageService';
import { Colors } from '../../utils';
import { useImageCacheStore } from '../../context/ImageCacheHook/imageCacheStore';
import { Image, ImageStyle } from 'expo-image';


interface CustomImageProps {
  userId: string;
  imageUrl: string;
  containerClassName?: string;
  onLoadEnd?: () => void;
  styleImage?: StyleProp<ImageStyle>;
  classNameImage?: string
}

const CacheImageCard: React.FC<CustomImageProps> = ({
  userId,
  imageUrl,
  containerClassName,
  styleImage,
  classNameImage,
  onLoadEnd
}) => {
  const [imageSource, setImageSource] = useState<string | null>(null);
  const { imageCache, setImageCache } = useImageCacheStore();
  const [IsCached, setIsCached] = useState(false)

  // Función para obtener la imagen de la caché
  const getCachedImage = useCallback(
    (userId: string, imageUrl: string): string | undefined => {
      if (!userId || !imageUrl) return undefined;
      const userCache = imageCache[userId] || [];
      return userCache.find((e) => e.url === imageUrl)?.base64;
    },
    [imageCache]
  );

  // Efecto para cargar la imagen
  useEffect(() => {
    let isMounted = true;
    const loadImage = async () => {
      try {
        const cachedImage = getCachedImage(userId, imageUrl);

        if (cachedImage) {
          if (isMounted) {
            setIsCached(true)
            setImageSource(cachedImage);
          }
        } else {
          // Si no está en caché, setear URL normal y pre-cargar
          if (isMounted) setImageSource(imageUrl);
          // Intentar cachear para la próxima (solo afectará mobile donde prefetchImage funciona)
          const downloaded = await prefetchImage(userId, imageUrl, imageCache, setImageCache);
          if (downloaded && downloaded.base64 && isMounted) {
            // Opcional: actualizar source a local una vez descargado, o dejarlo para la próxima render
            // setImageSource(downloaded.base64); 
            // setIsCached(true);
          }
        }
      } catch (error) {
        console.error('Error loading image:', error);
        if (isMounted) setImageSource(imageUrl);
      }
    };

    loadImage();
    return () => { isMounted = false };
  }, [userId, imageUrl, imageCache, setImageCache]); // dependencias

  return (
    <View className={` relative w-full ${containerClassName || ''}`}>
      {imageSource && (
        <>
          {
            IsCached &&
            <View className='border border-primary border-t-5 w-full '></View>
          }
          <Image
            className={classNameImage}
            style={styleImage}
            source={{ uri: imageSource }}
            onLoadEnd={() => {
              onLoadEnd && onLoadEnd();
            }}
            cachePolicy="memory"
            priority={"high"}
            contentFit="cover"
          />

        </>
      )}
    </View>
  );
};

export default CacheImageCard;

