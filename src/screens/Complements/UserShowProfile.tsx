"use client"

import { ActionSheetIOS, Platform, Pressable, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native"
import { useEffect, useRef, useState } from "react"
import { useNavigation } from "@react-navigation/native"
import { calcularDistancia, height } from "../../utils/Helpers"
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import { AntDesign, FontAwesome6, Ionicons, MaterialIcons } from "@expo/vector-icons"
import { font } from "../../../styles"
import { useAuth } from "../../context"
import { Chip } from "@rn-vui/themed"
import { Colors } from "../../utils"
import CacheImageCard from "../../components/CacheImageCard/CacheImageCard"
import CardComponent from "../../components/CardComponent/CardComponent"
import ScreenContainer from "../../components/ScreenContainer"



const UserShowProfile = () => {
  const { user } = useAuth()
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const [Index, setIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const swiperRef = useRef<any>(null) // Dummy ref for CardComponent prop requirements

  const Next = () => {
    if (user && user.customerProfiles.length - 1 !== Index) setIndex(Index + 1)
    if (user && user.customerProfiles.length - 1 === Index) setIndex(0)
  }

  const Previus = () => {
    if (Index !== 0) setIndex(Index - 1)
  }

  const OnSelectCustomer = (card: any) => {
    console.log("Card selected:", card)
  }

  return (
    <ScreenContainer disabledPaddingBottom backgroundColor="white">
      <View className=" flex-row  justify-start px-2 py-2 bg-primary">
        <TouchableOpacity
          className=" absolute left-3 top-3 flex-row items-center z-10 "
          onPress={() => navigation.goBack()}
        >
          <FontAwesome6 name="arrow-left" size={28} color={Colors.white} />
        </TouchableOpacity>

        <View className={"gap-x-2 flex-row items-end justify-center w-full"}>
          <Text className=" text-lg text-white" style={font.Bold}>
            {user?.firstName.split(" ")[0]},
          </Text>
          <Text className=" text-2xl text-white" style={font.Regular}>
            {user && user.age}
          </Text>
        </View>
        {/*   <TouchableOpacity className=" absolute right-3 top-3 flex-row items-center " onPress={() => setIsVisible(true)}>
          <SimpleLineIcons name="options-vertical" size={24} color={Colors.white} />
        </TouchableOpacity> */}
      </View>



      {showUserProfile ? (
        // Original user profile content
        <ScrollView>
          <View className=" h-[60vh]">
            <View className=" flex-row h-[20px] p-2 bg-gray-200">
              {user &&
                user.customerProfiles.map((e, index) => (
                  <View
                    key={index}
                    className={
                      index === Index
                        ? " flex-1  bg-white rounded-xl mx-1 "
                        : " flex-1  bg-black rounded-xl mx-1 opacity-50 shadow-lg shadow-white "
                    }
                  ></View>
                ))}
            </View>

            <View className=" h-full flex-row z-30 absolute top-0 left-0 w-full">
              <Pressable onPress={Previus} className=" h-full flex-1"></Pressable>
              <Pressable onPress={Next} className=" h-full flex-1"></Pressable>
            </View>

            {user ? (
              !user.customerProfiles.length ? null : (
                <CacheImageCard
                  userId={user.id.toString()}
                  imageUrl={user.customerProfiles[Index]?.link}
                  classNameImage="absolute top-0 h-full w-full"
                  styleImage={{ height: "100%" }}
                />
              )
            ) : null}
          </View>
          <View className=" bg-white p-2 mt-2 flex-row rounded-lg items-center">
            <Ionicons name="location-outline" size={18} color={Colors.secondary} />
            <Text className=" text-lg text-secondary ml-2" style={font.Bold}>
              {user &&
                (!calcularDistancia(user.postionX, user.postionY, Number(user?.postionX), Number(user?.postionY)) ||
                  calcularDistancia(user.postionX, user.postionY, Number(user?.postionX), Number(user?.postionY)) <= 1
                  ? "Cerca de ti"
                  : `A ${calcularDistancia(
                    user.postionX,
                    user.postionY,
                    Number(user?.postionX),
                    Number(user?.postionY),
                  )} km de distancia`)}
            </Text>
          </View>
          <View className=" bg-white p-2 mt-2 rounded-lg items-start">
            <View className="flex-row items-center">
              <FontAwesome6 name="circle-info" size={18} color={Colors.secondary} />
              <Text className=" text-base text-secondary ml-2" style={font.Bold}>
                Acerca de mi
              </Text>
            </View>

            <Text className=" border border-primary rounded-xl text-base text-primary ml-2 p-2" style={font.Bold}>
              {user && user.aboutme}
            </Text>
          </View>
          <View className=" bg-white p-2 mt-2 rounded-lg items-start">
            <View className="flex-row items-center">
              <MaterialIcons name="interests" size={18} color={Colors.secondary} />
              <Text className=" text-base text-secondary ml-2" style={font.Bold}>
                Intereses
              </Text>
            </View>

            <View className=" flex-row flex-wrap gap-x-2">
              {user &&
                user.customerInterestings.map((e) => (
                  <View className=" my-1 " key={e.id}>
                    <Chip title={e.description} iconRight type="outline" titleStyle={font.Bold} />
                  </View>
                ))}
            </View>
          </View>
          <View className=" bg-white p-2 mt-2 rounded-lg items-start">
            <View className="flex-row items-center">
              <AntDesign name="like1" size={18} color={Colors.secondary} />
              <Text className=" text-base text-secondary ml-2" style={font.Bold}>
                Le gustan personas
              </Text>
            </View>

            <View className=" flex-row flex-wrap gap-x-2">
              {user &&
                user.customerGoals.map((e) => (
                  <View className=" my-1 " key={e.id}>
                    <Chip title={e.description} iconRight type="outline" titleStyle={font.Bold} />
                  </View>
                ))}
            </View>
          </View>

          <View className=" bg-white h-[18vh] mt-2 flex-row"></View>
        </ScrollView>
      ) : (
        // CardComponent view when switch is off
        <View style={{ flex: 1, width: '100%' }}>
          {user && (
            <CardComponent
              key={user.id}
              index={0}
              focusCard={true}
              card={user as any}
              showUserProfile
              SwiperRef={swiperRef}
              selectCustomer={OnSelectCustomer}
            />
          )}
        </View>
      )}
      <View className="bg-gray-100 px-4 py-3 flex-row justify-between items-center absolute bottom-12 w-full z-30" style={{ maxWidth: Platform.OS === 'web' ? 500 : '100%' }}>
        <Text className="text-base text-gray-700" style={font.Bold}>
          {showUserProfile ? "Perfil de Usuario" : "Vista de Card"}
        </Text>
        <View className="flex-row items-center">
          <Text className="text-sm text-gray-600 mr-2" style={font.Regular}>
            Card
          </Text>
          <Switch
            value={showUserProfile}
            onValueChange={setShowUserProfile}
            trackColor={{ false: Colors.gray, true: Colors.primary }}
            thumbColor={showUserProfile ? Colors.white : Colors.white}
          />
          <Text className="text-sm text-gray-600 ml-2" style={font.Regular}>
            Perfil
          </Text>
        </View>
      </View>
    </ScreenContainer>
  )
}

export default UserShowProfile
