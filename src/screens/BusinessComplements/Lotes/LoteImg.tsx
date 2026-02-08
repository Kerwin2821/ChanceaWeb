import { useEffect, useState } from 'react';
import { Text, View, StyleSheet, ScrollView, Touchable, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Avatar } from '@rn-vui/themed';
import { Image } from 'expo-image';
import * as FileSystem from 'expo-file-system';
import { RegisterLoginScreenNavigationType } from '../../../navigation/StackNavigation';
import { useAuth, useRender } from '../../../context';
import { Colors } from '../../../utils';
import { GetHeader, height, ToastCall, width } from '../../../utils/Helpers';
import Button from '../../../components/ButtonComponent/Button';
import { HttpService } from '../../../services';
import { Entypo, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { label } from '../../../../styles';
import { useStoreBusiness } from '../../../context/storeContextBusiness/StoreBusinessState';
import {decode as atob, encode as btoa} from 'base-64'

interface File {
  uri: string | undefined | null;
  type: string;
  name: string | undefined;
}

function LoteImg() {
  const { language } = useRender();
  /* const {
    registerNegociosReq,
    registerNegociosReq: { imagenBusinesses },
    setRegisterNegociosReq
  } = useFormRegister(); */
  const { TokenAuthApi } = useAuth();
  const navigation = useNavigation<RegisterLoginScreenNavigationType>();
  const [photoURL1, setPhotoURL1] = useState<File | null>();
  const [photoURL2, setPhotoURL2] = useState<File | null>();
  const [photoURL3, setPhotoURL3] = useState<File | null>();
  const [photosURL, setPhotosURL] = useState<File[]>([]);
  const [photosURLIndex, setPhotosURLIndex] = useState<number[]>([]);
  const { FormCreateLote, setFormCreateLote, Stores, setStores } = useStoreBusiness();

  const convertBase64ToByteArray = (base64:string) => {
    const binaryString = atob(base64);
    const byteArray = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      byteArray[i] = binaryString.charCodeAt(i);
    }
    return Array.from(byteArray);
  };


  const sendImage = () => {
    setFormCreateLote({...FormCreateLote,imagenCupons:photosURL.map(e => {
      const base64 = e.uri as string
      const byteArray = convertBase64ToByteArray(base64)
      return {imagen:byteArray,imagenContentType:e.type}
    })})
  }

  const changePhoto = async (number: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      base64: true,
      aspect: [20, 8]
    });

    if (!result.canceled) {
      if (!result) return;
      if (!result?.assets) return;

      console.log(result.assets[0].width);

      if (result.assets[0].width < 756) {
        ToastCall('warning', 'Esta imagen no es del ancho ideal, tiene que ser 756x303.', 'ES');
        return;
      }
      if (result.assets[0].height < 303) {
        ToastCall('warning', 'Esta imagen no es del alto ideal, tiene que ser 756x303.', 'ES');
        return;
      }

      const foto = getPhoto(result);
      console.log(number - 1);

      if (number === 1) {
        setPhotoURL1(foto);
      }
      if (number === 2) {
        setPhotoURL2(foto);
      }
      if (number === 3) {
        setPhotoURL3(foto);
      }
      if (!photosURLIndex.includes(number - 1)) {
        console.log(photosURLIndex);
        setPhotosURLIndex([...photosURLIndex, number - 1]);
      }
      if (foto) {
        if (photosURL[0] && number === 1) {
          setPhotosURL(
            photosURL.map((e, index) => {
              if (index == number - 1) {
                console.log(foto);
                return foto;
              }
              return e;
            })
          );
          return;
        }
        if (photosURL[1] && number === 2) {
          setPhotosURL(
            photosURL.map((e, index) => {
              if (index === number - 1) {
                return foto;
              }
              return e;
            })
          );
          return;
        }
        if (photosURL[2] && number === 3) {
          setPhotosURL(
            photosURL.map((e, index) => {
              if (index === number - 1) {
                return foto;
              }
              return e;
            })
          );
          return;
        }

        setPhotosURL([...photosURL, foto]);
      }
    }
  };


  const getPhoto = (file: ImagePicker.ImagePickerResult | undefined): File | null => {
    if (!file) return null;
    if (!file?.assets) return null;

    const name = file?.assets[0]?.uri.split('/');

    const data: File = {
      uri:  file?.assets[0]?.base64,
      type: file?.assets[0]?.type + '/jpeg',
      name: file?.assets[0]?.uri.split('/')[name.length - 1]
    };
    console.log(data);
    return data;
  };

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 px-5 ">
        <TouchableOpacity className=" flex-row items-center z-10" onPress={() => navigation.goBack()}>
          <FontAwesome5 name="chevron-left" size={28} color="black" />
        </TouchableOpacity>
        <View style={styles.containerForm}>
        <Text
            style={{
              color: Colors.blackBackground,
              fontSize: 10,
              fontFamily: 'Regular',
              textAlign: 'center',
              borderColor: Colors.primary,
              borderWidth: 1,
              borderRadius: 12,
              padding: 15
            }}
          >
            A medida de que vayas subiendo imagen por imagen se iran desbloqueando los espacios.
          </Text>
          <View className="  w-full flex-col justify-between">
            <View className="h-[23%]">
              <Text style={label.label}>Sube la imagen de portada de tu lote de cupones</Text>
              <View className="w-full  justify-center items-center border-2 rounded-xl">
                <TouchableOpacity
                  onPress={() => changePhoto(1)}
                  style={{
                    marginHorizontal: width * 0.1,
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center'
                  }}
                >
                  {photoURL1?.uri ? (
                    <Image
                      source={{
                        uri: `data:image/jpeg;base64,${photoURL1?.uri}`
                      }}
                      className="w-full h-full rounded-lg"
                    />
                  ) : (
                    <Entypo name="plus" size={24} color={Colors.black} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
            <View className=" h-[23%] mt-4">
              <Text style={label.label}>Segunda imagen</Text>
              <View className="w-full justify-center items-center border-2 rounded-xl ">
                <TouchableOpacity
                  onPress={() => changePhoto(2)}
                  disabled={!photoURL1?.uri}
                  style={{
                    marginHorizontal: width * 0.1,
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center'
                  }}
                >
                  {photoURL2?.uri ? (
                    <Image
                      source={{
                        uri:`data:image/jpeg;base64,${photoURL2?.uri}` 
                      }}
                      className="w-full h-full rounded-lg"
                    />
                  ) : photoURL1?.uri ? (
                    <Entypo name="plus" size={24} color={Colors.black} />
                  ) : (
                    <View className=" h-full w-full rounded-lg bg-gray-400"></View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
            <View className="h-[23%]">
              <Text style={label.label}>Tercera imagen</Text>
              <View className="w-full justify-center items-center border-2 rounded-xl">
                <TouchableOpacity
                  onPress={() => changePhoto(3)}
                  disabled={!photoURL2?.uri}
                  style={{
                    marginHorizontal: width * 0.1,
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center'
                  }}
                >
                  {photoURL3?.uri ? (
                    <Image
                      source={{
                        uri: `data:image/jpeg;base64,${photoURL3?.uri}` 
                      }}
                      className="w-full h-full rounded-lg"
                    />
                  ) : photoURL2?.uri ? (
                    <Entypo name="plus" size={24} color={Colors.black} />
                  ) : (
                    <View className=" h-full w-full rounded-lg bg-gray-400"></View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
            <View className="w-full flex-row justify-center">
            <View className="w-[45%] items-center">
              <Button
                text={'Siguiente'}
                disabled={photosURLIndex.length < 2}
                onPress={() => {
                  sendImage()
                  navigation.navigate('LoteForm');
                }}
              />
            </View>
          </View>
          </View>
          
        </View>
      </View>
    </SafeAreaView>
  );
}

export default LoteImg;

const styles = StyleSheet.create({
  containerForm: {
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flex: 1
  }
});
