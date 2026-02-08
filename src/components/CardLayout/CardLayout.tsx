import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Colors } from "../../utils";
import { Props } from "./CardLayoutInterfaces";
import { Image } from "expo-image";
import { AntDesign } from "@expo/vector-icons";
import { Images } from "../../../assets/img";
import { useChat } from "../../context/ChatContext/ChatProvider";
import { useEffect, useState } from "react";
import db, { FirebaseDatabaseTypes, firebase } from "@react-native-firebase/database";
import CacheImage from "../CacheImage/CacheImage";

const CardLayout = (props: Props) => {

  const [Status, setStatus] = useState<"online" | "offline">("offline")

  useEffect(() => {
    const onValueChange = db()
      .ref(`/status/${props.idUser}`)
      .on('value', (snapshot: any) => {
        console.log('User data: ', snapshot.val());
        console.log(props.idUser);
        if (snapshot.val()) setStatus(snapshot.val().status)
      });

    // Stop listening for updates when no longer required
    return () => db().ref(`/status/${props.idUser}`).off('value', onValueChange);
  }, [props.idUser]);
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        props?.onPress && props?.onPress();
      }}
      onLongPress={
        () => {
          props?.onLongPress && props?.onLongPress();
        }
      }
      disabled={props.disable}
    >
      <View
        style={[
          styles.containerPhoto,
          {
            backgroundColor: Colors.white,
            borderRadius: 50,
            opacity: props.disable ? 0.5 : undefined
          },
        ]}
      >
        {!props.photo && !props.svgComponent && (
          <Image
            source={require("../../../assets/adaptive-icon.png")}
            style={{
              width: props?.ImageCircle ? 40 : 50,
              height: props?.ImageCircle ? 40 : 50,
            }}
          />
        )}
        {props.photo && (
          <CacheImage
            source={props?.photo ? (props?.photo as any).uri : Images.Profile.uri}
            styleImage={{
              width: "100%",
              height: "100%",
              shadowColor: Colors.black,
              shadowOffset: {
                width: 0,
                height: 3,
              },
              shadowOpacity: 0.29,
              shadowRadius: 4.65,
            }}
          />
        )}
        {props.svgComponent && props.svgComponent}
      </View>
      {
        Status === "online"
          ?
          <View className=" w-5 h-5 absolute z-10 left-10 rounded-full bottom-1 bg-green-600 "></View>
          :
          <View className=" w-5 h-5 absolute z-10 left-10 rounded-full bottom-1 bg-gray-600 "></View>
      }
      <View style={styles.bar} />
      <View style={{ width: "100%" }}>
        {props?.children ? props?.children : null}
      </View>
    </TouchableOpacity>
  );
};

export default CardLayout;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 80,
    marginBottom: 0,
    position: 'relative',
    paddingLeft: 75,
    paddingRight: 10,
    borderBottomColor: '#f8f8f8',
    borderStyle: 'solid',
    borderBottomWidth: 1,
  },
  containerPhoto: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    overflow: 'hidden',
    left: 15,
    zIndex: 10,
    width: 50,
    height: 50,
  },
  containerChildren: {
    width: '100%',
  },
  containerIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 8,
    zIndex: 10,
  },
  icon: {
    tintColor: 'rgba(66, 66, 66, .5)',
    width: 20,
    height: 20,
  },
  bar: {
    display: 'none',
  },
});
