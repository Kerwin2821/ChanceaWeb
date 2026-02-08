import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import ScreenContainer from "../../components/ScreenContainer";
import { font } from "../../../styles";
import Carousel from "react-native-snap-carousel";
import { GetHeader, ToastCall, height, width } from "../../utils/Helpers";
import { Image } from "expo-image";
import { Colors } from "../../utils";
import { useNavigation } from "@react-navigation/native";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import { useAuth, useRender } from "../../context";
import { HttpService } from "../../services";
import CustomImageViewer from "../../components/CustomImageViewer";
import CacheImage from "../../components/CacheImage/CacheImage";

export interface Advertisements {
  id: number;
  name: string;
  description: string;
  imgSrc: string;
  imgBlog: any;
  imgBlogContentType: string;
  countView: any;
  advertisement: any;
  advertisementContentType: any;
  advertisementUrl: any;
}

export default function Promotions() {
  const [visible, setIsVisible] = useState(false);
  const [IndexImage, setIndexImage] = useState(0);
  const { TokenAuthApi, SesionToken } = useAuth();
  const { setLoader } = useRender();

  const [Data, setData] = useState<Advertisements[]>([]);

  async function GetIntereses() {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/advertisements/${SesionToken}?page=0&size=100`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response = await HttpService(
        "get",
        host,
        url,
        {},
        header,
        setLoader
      );

      setData(response);
    } catch (err: any) {
      console.error(JSON.stringify(err));
      if (err && err?.status) {
        ToastCall("error", "error de conexión en con el Servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
    }
  }

  const itemCard = (
    { item, index }: { item: Advertisements; index: number },
  ) => {
    console.log(item);
    return (
      <TouchableOpacity key={index} onPress={() => { setIsVisible(true), setIndexImage(index) }} className=" w-full  bg-primary rounded-2xl">
        <CacheImage
          styleImage={{
            width: "100%",
            height: "100%",
            borderRadius: 16,
            backgroundColor: Colors.transparent,
          }}
          source={item.imgSrc}
        />
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    GetIntereses();
  }, []);

  return (
    <ScreenContainer>
      <View className=" px-5 py-2 mb-2">
        <Text className=" text-2xl text-primary" style={font.Bold}>
          Promociones
        </Text>
      </View>

      <Carousel
        data={Data}
        autoplay
        renderItem={itemCard}
        sliderWidth={width}
        firstItem={0}
        autoplayInterval={4000}
        itemWidth={width - 70}
      />

      <View className=" h-[56%] mt-5 px-4 mb-16 ">
        <FlatList
          data={Data}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ index, item }) => (
            <GridItem item={item} index={index} setIsVisible={setIsVisible} setIndexImage={setIndexImage} />
          )}
        />
      </View>
      <CustomImageViewer images={Data.map(e => ({ uri: e.imgSrc }))} imageIndex={IndexImage} visible={visible} onRequestClose={() => setIsVisible(false)} FooterComponent={(props: { imageIndex: number }) => <Text style={font.SemiBold} className=' text-white text-xl  p-5 text-center'>{props.imageIndex + 1}/{Data.length}</Text>} />
    </ScreenContainer>
  );
}

const GridItem = ({ item, index, setIsVisible, setIndexImage }: { item: Advertisements, index: number, setIsVisible: (e: boolean) => void, setIndexImage: (e: number) => void }) => {

  return (
    <TouchableOpacity key={index} onPress={() => {
      setIsVisible(true)
      setIndexImage(index)
    }} style={[style.gridItem]}>

      <View style={[style.innerContainer]}>
        <CacheImage
          styleImage={{
            width: "100%",
            height: "100%",
            borderRadius: 12
          }}
          source={item.imgSrc}

        />
      </View>
    </TouchableOpacity>
  );
};

const style = StyleSheet.create({
  textStyling: {
    fontSize: 20,
    fontStyle: "italic",
    color: "black",
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 12,
    borderColor: Colors.primary
  },
  button: {
    flex: 1,
  },
  gridItem: {
    margin: 5,
    height: width * 0.43,
    width: width * 0.43,
    backgroundColor: "white",
    borderRadius: 16,
  },
});
