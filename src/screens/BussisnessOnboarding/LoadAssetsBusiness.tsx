import { useEffect, useState } from "react";
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Platform } from "react-native";
import { Colors } from "../../utils";
import { CommonActions, useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { Avatar } from "@rn-vui/themed";
import { Image } from "expo-image";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import Button from "../../components/ButtonComponent/Button";
import { width, height, GetHeader, ToastCall } from "../../utils/Helpers";
import { useAuth, useRender } from "../../context";
import { HttpService } from "../../services";
import OnboardingValidateBusiness from "../../utils/OnboardingValidateBusiness";
import { useSesionBusinessStore } from "../../context/AuthBusinessHooks/useAuthBusinessHooks";
import { useStoreBusiness } from "../../context/storeBusinessHooks/useStoreBusiness";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface File {
  uri: string;
  type: any;
  name: string;
}
interface ImageBusinessType {
  imagen: string;
  imagenContentType: string;
  collectionTypeId: number;
}

function LoadAssetsBusiness() {
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const { TokenAuthApi, SesionToken } = useAuth();
  const { sesionBusiness, setSesionBusiness } = useSesionBusinessStore();
  const { Stores } = useStoreBusiness();
  const { setLoader } = useRender();

  const [photoURL, setPhotoURL] = useState<File | null>();
  const [photoURLPDF, setPhotoURLPDF] = useState<File | null>();

  const getPresignedUrl = async (fileName: string) => {
    try {
      const host = process.env.APP_BASE_API;
      const url: string = `/api/generate-presigned-url-business/${fileName}/${SesionToken}`;
      const headers = GetHeader(TokenAuthApi, "multipart/form-data");
      const response = await HttpService("get", host, url, {}, headers);

      const data = response.url;
      return data; // URL prefirmada
    } catch (error) {
      console.error("Error obteniendo URL prefirmada: ", error);
    }
  };

  const createObjSend = async (data: File) => {
    const urlS3 = await getPresignedUrl(data.name);
    const imgData = await uploadToS3(data, urlS3 as string);

    return imgData;
  };

  // Helper function to update images in the store

  const handleImagePicker = async (isLogo: boolean) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.1,
      aspect: isLogo ? [1, 1] : [3, 4],
    });

    if (!result.canceled && result.assets?.[0]) {
      const fileData = getPhoto(result);
      if (isLogo) {
        setPhotoURL(fileData);
      } else {
        setPhotoURLPDF(fileData);
      }
    }
  };

  const getPhoto = (file: ImagePicker.ImagePickerResult): File | null => {
    if (!file?.assets?.[0]) return null;

    const name = file.assets[0].uri.split("/");
    return {
      uri: file.assets[0].uri,
      type: file.assets[0].type + "/jpeg",
      name: name[name.length - 1],
    };
  };
  const sendImages = async () => {
    let counter = 0;

    if (!sesionBusiness) return;

    if (!photoURL) {
      ToastCall("warning", "Falta cargar el logo de tu negocio", "ES");
      return;
    }

    if (!photoURLPDF) {
      ToastCall("warning", "Falta cargar el Rif de tu negocio", "ES");
      return;
    }

    try {
      setLoader(true);

      const urlLogo = await createObjSend(photoURL);
      const urlRif = await createObjSend(photoURLPDF);

      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/businesses/update?sessionToken=${SesionToken}`;
      const header = await GetHeader(TokenAuthApi, "application/json");

      const response = await HttpService(
        "put",
        host,
        url,
        {
          ...sesionBusiness,
          password: null,
          token: SesionToken,
          fileRifUrl: urlRif,
          fileLogo: urlLogo,
        },
        header
      );

      setSesionBusiness(response.business);
      await AsyncStorage.setItem("SesionBusiness", JSON.stringify(response.business));

      const validate = await OnboardingValidateBusiness(response.business, navigation, setSesionBusiness, Stores);

      if (!validate) return;
      
      navigation.replace("HomeBusiness");
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "HomeBusiness" }],
        })
      );
    } catch (error: any) {
      console.error(JSON.stringify(error));
      if (error && error?.status) {
        ToastCall("error", "error de conexión en con el Servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
    } finally {
      setLoader(false);
    }
  };

   
  useEffect(() => {
    const logoImage = sesionBusiness?.urlLogo;
    const rifImage = sesionBusiness?.urlRif;

    if (logoImage) {
      setPhotoURL({
        uri: logoImage,
        type: sesionBusiness.imagenLogoContentType,
        name: 'logo.png'
      });
    }

    if (rifImage) {
      setPhotoURLPDF({
        uri: rifImage,
        type: sesionBusiness.imagenRifContentType,
        name: 'rif.png'
      });
    }
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white" }} contentContainerStyle={styles.container}>
      <View style={styles.containerForm}>
        <Text style={styles.instructions}>
          Estos documentos nos ayudarán a verificar tu identidad y la autenticidad de tu negocio, lo que contribuirá a
          crear un entorno más seguro y confiable para todos en nuestra plataforma.
        </Text>

        {/* Logo Section */}
        <View className="justify-center items-center">
          <View className="my-2">
            <Text className="text-sm text-center">
              {photoURL?.uri ? "Actualiza tu logo" : "Te pedimos que adjuntes una foto de tu logo"}
            </Text>
          </View>
          {photoURL?.uri ? (
            <Avatar
              size={width / 2}
              source={{ uri: photoURL.uri }}
            >
              {/* <Avatar.Accessory size={width / 7.5} onPress={() => handleImagePicker(true)} /> */}
            </Avatar>
          ) : (
            <View className="w-full flex-row justify-between px-5">
              <View className="w-[60%] items-center">
                <Button text={"Adjuntar Logo"} typeButton={"white"} onPress={() => handleImagePicker(true)} />
              </View>
            </View>
          )}
        </View>

        {/* RIF Section */}
        <View className="justify-center items-center">
          <View className="my-2">
            <Text className="text-sm text-center">
              {photoURLPDF?.uri
                ? "Actualiza tu RIF"
                : "Te pedimos que adjuntes una foto de tu RIF (Registro de Información Fiscal)"}
            </Text>
          </View>

          {photoURLPDF?.uri ? (
            <TouchableOpacity
              onPress={() => handleImagePicker(false)}
              style={{ marginHorizontal: width * 0.1, alignItems: "center" }}
            >
              <Image source={{ uri: photoURLPDF.uri }} style={{ width: 150, height: 200 }} />
            </TouchableOpacity>
          ) : (
            <View className="w-full flex-row justify-between px-5">
              <View className="w-[60%] items-center">
                <Button text={"Adjuntar RIF"} typeButton={"white"} onPress={() => handleImagePicker(false)} />
              </View>
            </View>
          )}
        </View>

        {/* Navigation Buttons */}
        <View className="w-full flex-row justify-between px-5">
          <View className="w-[45%] items-center">
            <Button text={"Volver"} onPress={() => navigation.goBack()} typeButton="white" />
          </View>
          <View className="w-[45%] items-center">
            <Button
              text={"Siguiente"}
              onPress={() => {
                sendImages()
              }}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

export default LoadAssetsBusiness;

const uploadToS3 = async (image: File, url: string) => {
  try {
    const response = await fetch(image.uri);
    const blob = await response.blob();

    const result = await fetch(url, {
      method: "PUT",
      body: blob,
      headers: {
        "Content-Type": blob.type,
      },
    });

    return url.split("?")[0];
  } catch (error) {
    console.error("Error uploading image", JSON.stringify(error));
    throw error;
  }
};

const styles = StyleSheet.create({
  container: {
    height,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  containerForm: {
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingHorizontal: width * 0.05,
    flex: 1,
  },
  instructions: {
    color: Colors.blackBackground,
    fontSize: 10,
    fontFamily: "DosisMedium",
    marginHorizontal: 10,
    marginVertical: 10,
    textAlign: "center",
    borderColor: Colors.primary,
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
  },
});
