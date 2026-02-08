"use client"

import { View, Text, ScrollView, TouchableOpacity, Platform, Linking } from "react-native"
import { FAB } from "@rn-vui/themed"
import { width } from "../../utils/Helpers"
import { useRender } from "../../context"
import { Colors } from "../../utils"
import { useEffect, useState } from "react"
import {
  AntDesign,
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  SimpleLineIcons,
} from "@expo/vector-icons"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import { font } from "../../../styles"
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import CacheImage from "../../components/CacheImage/CacheImage"
import { useSesionBusinessStore } from "../../context/AuthBusinessHooks/useAuthBusinessHooks"
import { useStoreBusiness } from "../../context/storeBusinessHooks/useStoreBusiness"
import { Stores } from "../../context/storeBusinessHooks/StoreBusinessInterface"

export default function BusinessProfileScreen() {
  const { sesionBusiness } = useSesionBusinessStore()
  const { Stores } = useStoreBusiness()
  const { setLoader } = useRender()
  const [edit, setEdit] = useState(false)
  const isFocus = useIsFocused()
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const [stats, setStats] = useState({
    views: 1245,
    orders: 87,
    rating: 4.8,
  })

  const openMaps = () => {
    if (!sesionBusiness) return

    const lat = sesionBusiness.postionX
    const lng = sesionBusiness.postionY

    const url = Platform.select({
      ios: `http://maps.apple.com/?ll=${lat},${lng}&q=${encodeURIComponent(sesionBusiness.name)}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(sesionBusiness.name)})`,
    })

    Linking.openURL(url as string).catch((err) => console.error("Error opening maps", err))
  }

  const openStoreMaps = (store: Stores) => {
    const lat = store.positionX
    const lng = store.positionY

    const url = Platform.select({
      ios: `http://maps.apple.com/?ll=${lat},${lng}&q=${encodeURIComponent(store.name)}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(store.name)})`,
    })

    Linking.openURL(url as string).catch((err) => console.error("Error opening maps", err))
  }

  const callBusiness = () => {
    if (!sesionBusiness) return

    Linking.openURL(`tel:${sesionBusiness.phoneNumber}`).catch((err) => console.error("Error making call", err))
  }

  const callStore = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`).catch((err) => console.error("Error making call", err))
  }

  const emailBusiness = () => {
    if (!sesionBusiness) return

    Linking.openURL(`mailto:${sesionBusiness.email}`).catch((err) => console.error("Error opening email", err))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVO":
        return "#4CAF50"
      case "PENDING":
        return "#FF9800"
      case "INACTIVO":
        return "#F44336"
      default:
        return "#757575"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVO":
        return "Activo"
      case "PENDING":
        return "Pendiente"
      case "INACTIVE":
        return "Inactivo"
      default:
        return status
    }
  }

  useEffect(() => {
    if (!isFocus) {
      setEdit(false)
    }
  }, [isFocus])

  if (!sesionBusiness) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-gray-500" style={font.Bold}>
          No hay información del negocio disponible
        </Text>
      </View>
    )
  }

  return (
    <>
      <View className="flex-row justify-between items-center w-full px-2 h-[10%] bg-white">
        <View className="flex-row justify-end items-center h-16 px-5 w-full">
          <TouchableOpacity onPress={() => {navigation.navigate("ProfileOptionsBusiness")}}>
            <SimpleLineIcons name="options-vertical" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="bg-white" contentContainerStyle={{ paddingBottom: 64 }}>
        {/* Business Logo */}
        <View className="items-center">
          <View className="w-[80vw] h-[40vh] relative">
            {/* Status Badge */}
            {/* <View
              style={{ backgroundColor: getStatusColor(sesionBusiness.statusBusiness) }}
              className="absolute top-2 right-2 z-10 px-3 py-1 rounded-full"
            >
              <Text className="text-white font-bold">{getStatusText(sesionBusiness.statusBusiness)}</Text>
            </View> */}

            {/* Large Business Logo */}
            <View className="h-full w-full rounded-2xl bg-gray-100 items-center justify-center">
              {sesionBusiness.urlLogo ? (
                <CacheImage
                  classNameImage="rounded-2xl"
                  styleImage={{ width: "100%", height: "100%", resizeMode: "contain" }}
                  source={{ uri: sesionBusiness.urlLogo }}
                />
              ) : (
                <>
                  <FontAwesome5 name="store" size={80} color={Colors.primary} />
                  <Text className="mt-4 text-gray-500" style={font.Bold}>
                    Logo del Negocio
                  </Text>
                </>
              )}
            </View>

            {/* Edit Button */}
            <FAB
              onPress={() => {navigation.navigate("LoadAssetsBusiness")}}
              placement="right"
              icon={{ name: "edit", color: "white" }}
              color={Colors.primary}
            />
          </View>
        </View>

        {/* Business Name and Verification */}
        <View className="flex-row justify-center mt-3 items-center">
          <Text className="text-2xl mr-2" style={{ fontFamily: "Bold" }}>
            {sesionBusiness.name}
          </Text>
          {sesionBusiness.businessCondition === "VALIDATED" && ( <AntDesign name="checkcircle" size={24} color="green" /> )}
          
        </View>

        {/* Commercial Denomination */}
        <View className="items-center mt-1">
          <Text className="text-base text-gray-500" style={{ fontFamily: "SemiBold" }}>
            {sesionBusiness.comercialDenomination}
          </Text>
        </View>

        {/* Business Stats */}
        {/* <View className="flex-row justify-around mt-4 mx-4 bg-gray-50 rounded-xl p-3 shadow-sm">
          <View className="items-center">
            <Text className="text-2xl text-primary" style={font.Bold}>
              {stats.views}
            </Text>
            <Text className="text-xs text-gray-500">Visitas</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl text-primary" style={font.Bold}>
              {stats.orders}
            </Text>
            <Text className="text-xs text-gray-500">Pedidos</Text>
          </View>
          <View className="items-center">
            <View className="flex-row items-center">
              <Text className="text-2xl text-primary" style={font.Bold}>
                {stats.rating}
              </Text>
              <AntDesign name="star" size={16} color="#FFD700" style={{ marginLeft: 2 }} />
            </View>
            <Text className="text-xs text-gray-500">Calificación</Text>
          </View>
        </View> */}

        {/* Contact Buttons */}
        {/* <View className="flex-row justify-center mt-4 space-x-4">
          <TouchableOpacity
            className="items-center justify-center bg-primary w-14 h-14 rounded-full"
            onPress={callBusiness}
          >
            <FontAwesome name="phone" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center justify-center bg-primary w-14 h-14 rounded-full"
            onPress={emailBusiness}
          >
            <MaterialIcons name="email" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center justify-center bg-primary w-14 h-14 rounded-full"
            onPress={openMaps}
          >
            <FontAwesome5 name="map-marker-alt" size={24} color="white" />
          </TouchableOpacity>
        </View> */}

        {/* Business Information */}
        <View className="bg-white p-4 mt-4 rounded-lg">
          <View className="flex-row items-center mb-2">
            <FontAwesome6 name="circle-info" size={18} color={Colors.secondary} />
            <Text className="text-base text-secondary ml-2" style={font.Bold}>
              Información del Negocio
            </Text>
          </View>

          <View className="border border-primary rounded-xl p-4 w-full">
            {/* Identification */}
            <View className="flex-row items-center mb-3">
              <MaterialIcons name="badge" size={20} color={Colors.primary} />
              <Text className="ml-2 text-gray-700" style={font.Regular}>
                <Text style={font.Bold}>RIF: </Text>
                {sesionBusiness.conditionType}-{sesionBusiness.identificationNumber}
              </Text>
            </View>

            {/* Phone */}
            <View className="flex-row items-center mb-3">
              <FontAwesome name="phone" size={20} color={Colors.primary} />
              <Text className="ml-2 text-gray-700" style={font.Regular}>
                <Text style={font.Bold}>Teléfono: </Text>
                {sesionBusiness.phoneNumber}
              </Text>
            </View>

            {/* Email */}
            <View className="flex-row items-center mb-3">
              <MaterialIcons name="email" size={20} color={Colors.primary} />
              <Text className="ml-2 text-gray-700" style={font.Regular}>
                <Text style={font.Bold}>Email: </Text>
                {sesionBusiness.email}
              </Text>
            </View>

            {/* Condition Type */}
            {/* <View className="flex-row items-center mb-3">
              <MaterialCommunityIcons name="certificate" size={20} color={Colors.primary} />
              <Text className="ml-2 text-gray-700" style={font.Regular}>
                <Text style={font.Bold}>Tipo: </Text>
                
              </Text>
            </View> */}

            {/* Creation Date */}
            {/* <View className="flex-row items-center">
              <FontAwesome5 name="calendar-alt" size={20} color={Colors.primary} />
              <Text className="ml-2 text-gray-700" style={font.Regular}>
                <Text style={font.Bold}>Desde: </Text>
                {new Date(sesionBusiness.beginningdate).toLocaleDateString()}
              </Text>
            </View> */}
          </View>

         {/*  <TouchableOpacity
            className="p-2 bg-primary rounded-full absolute bottom-4 right-4"
            onPress={() => {navigation.navigate("UpdateBusinessProfile")}}
          >
            <FontAwesome6 name="pen" size={18} color="white" />
          </TouchableOpacity> */}
        </View>

        {/* Stores Preview */}
        <View className="bg-white p-4 mt-4 rounded-lg">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <FontAwesome5 name="store-alt" size={18} color={Colors.secondary} />
              <Text className="text-base text-secondary ml-2" style={font.Bold}>
                Mis Tiendas
              </Text>
            </View>

            <TouchableOpacity className="flex-row items-center" onPress={() => {navigation.navigate("StoreListView")}}>
              <Text className="text-primary mr-1" style={font.SemiBold}>
                Ver todas
              </Text>
              <FontAwesome5 name="chevron-right" size={14} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <View className="border border-primary rounded-xl p-2 w-full">
            {Stores && Stores.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 4 }}
              >
                {Stores.map((store, index) => (
                  <TouchableOpacity
                    key={store.id}
                    className="mr-4 bg-white rounded-lg shadow-sm w-[200px]"
                    onPress={() => {navigation.navigate("StoreShow", { storeId: store.id })}}
                  >
                    <View className="p-3">
                      <View className="flex-row justify-between items-start mb-2">
                        <Text className="text-base font-bold" numberOfLines={1} style={{ width: "80%" }}>
                          {store.name}
                        </Text>
                        <View
                          style={{ backgroundColor: getStatusColor(store.statusBusiness) }}
                          className="h-3 w-3 rounded-full"
                        />
                      </View>

                      <Text className="text-xs text-gray-500 mb-2" numberOfLines={2}>
                        {store.description || "Sin descripción"}
                      </Text>

                      <View className="flex-row items-center mb-1">
                        <FontAwesome name="phone" size={12} color={Colors.primary} />
                        <Text className="text-xs ml-1 text-gray-700" numberOfLines={1}>
                          {store.phoneNumber}
                        </Text>
                      </View>

                      <View className="flex-row items-center">
                        <MaterialIcons name="email" size={12} color={Colors.primary} />
                        <Text className="text-xs ml-1 text-gray-700" numberOfLines={1}>
                          {store.email}
                        </Text>
                      </View>

                      <View className="flex-row mt-3 justify-between">
                        <TouchableOpacity
                          className="bg-gray-100 p-2 rounded-full"
                          onPress={() => callStore(store.phoneNumber)}
                        >
                          <FontAwesome name="phone" size={16} color={Colors.primary} />
                        </TouchableOpacity>

                        <TouchableOpacity className="bg-gray-100 p-2 rounded-full" onPress={() => openStoreMaps(store)}>
                          <FontAwesome5 name="map-marker-alt" size={16} color={Colors.primary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                          className="bg-primary p-2 rounded-full"
                          onPress={() => {
                            navigation.navigate("StoreForm", { store })
                          }}
                        >
                          <FontAwesome6 name="pen" size={16} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}

                {/* Add New Store Button */}
                <TouchableOpacity
                  className="mr-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 w-[200px] items-center justify-center"
                  onPress={() => {navigation.navigate("StoreForm")}}
                >
                  <View className="p-3 items-center">
                    <View className="bg-gray-100 p-3 rounded-full mb-2">
                      <Ionicons name="add" size={24} color={Colors.primary} />
                    </View>
                    <Text className="text-primary" style={font.SemiBold}>
                      Agregar Tienda
                    </Text>
                  </View>
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <View className="items-center justify-center py-6">
                <FontAwesome5 name="store-alt-slash" size={40} color="#ccc" />
                <Text className="text-gray-500 mt-2" style={font.Regular}>
                  No hay tiendas registradas
                </Text>
                <TouchableOpacity
                  className="mt-4 bg-primary px-4 py-2 rounded-lg"
                  onPress={() => {/* navigation.navigate("AddStore") */}}
                >
                  <Text className="text-white" style={font.SemiBold}>
                    Agregar Tienda
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Business RIF Document */}
        <View className="bg-white p-4 mt-4 rounded-lg">
          <View className="flex-row items-center mb-2">
            <FontAwesome5 name="file-invoice" size={18} color={Colors.secondary} />
            <Text className="text-base text-secondary ml-2" style={font.Bold}>
              Documento RIF
            </Text>
          </View>

          <View className="border border-primary rounded-xl p-2 w-full items-center">
            <CacheImage
              classNameImage="rounded-lg"
              styleImage={{ width: width * 0.8, height: width * 0.5, resizeMode: "contain" }}
              source={{ uri: sesionBusiness.urlRif }}
            />
          </View>

          <TouchableOpacity
            className="p-2 bg-primary rounded-full absolute bottom-4 right-4"
            onPress={() => {navigation.navigate("LoadAssetsBusiness")}}
          >
            <FontAwesome6 name="pen" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  )
}

