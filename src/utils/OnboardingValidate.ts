import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserData } from "../context/AuthContext/AuthInterface";
import { NavigationScreenNavigationType } from "../navigation/StackNavigator";
import { HttpService } from "../services";
import { GetHeader } from "./Helpers";
const OnboardingValidate = async (
  userData: UserData,
  navigation: NavigationScreenNavigationType,
  setUser: (e: UserData) => void,
  location: { latitude: number; longitude: number },
  auth?: { TokenAuthApi: string; SesionToken: string }
) => {

  // Ensure we have the most complete data possible
  let currentData = { ...userData };

  // Try to recover any missing data from AsyncStorage
  const sesion = await AsyncStorage.getItem("Sesion");
  if (sesion) {
    try {
      const storedUser = JSON.parse(sesion) as UserData;
      // Merge: storedUser provides baseline, currentData (fresher) overwrites it
      currentData = { ...storedUser, ...currentData };
    } catch (e) {
      console.error("Error parsing session in OnboardingValidate", e);
    }
  }

  //Paso 1
  if (!currentData.aboutme || currentData.aboutme === "N/A" || currentData.aboutme === "NA") {
    const updatedUser = {
      ...currentData,
      nickname: currentData.nickname || undefined,
      postionX: currentData.postionX || location.longitude,
      postionY: currentData.postionY || location.latitude,
    };
    setUser(updatedUser);
    await AsyncStorage.setItem("Sesion", JSON.stringify(updatedUser));
    navigation.navigate("AboutMe");
    return false;
  }

  // Always update global state and storage with merged data
  setUser(currentData);
  await AsyncStorage.setItem("Sesion", JSON.stringify(currentData));

  //Paso 2
  if (!currentData?.customerProfiles || !currentData.customerProfiles.length) {
    navigation.navigate("PhotoChange");
    return false;
  }

  //Paso 3
  if (currentData.shareLocation == null) {
    navigation.navigate("SharedLocation");
    return false;
  }

  //Paso 4
  if (!currentData.customerGoals || !currentData.customerGoals.length) {
    navigation.navigate("Goals");
    return false;
  }

  //Paso 5
  if (!currentData?.nickname) {
    navigation.navigate("NicknameScreen");
    return false;
  }

  //Paso 6
  if (!currentData?.customerSource) {
    navigation.navigate("CustomerSource");
    return false;
  }

  //Paso 7
  if (!currentData.customerInterestings || !currentData.customerInterestings.length) {
    navigation.navigate("InterestSelect");
    return false;
  }

  if (auth) {
    const host = process.env.APP_BASE_API;
    const url = `/api/appchancea/customers/${auth.SesionToken}`;
    const header = await GetHeader(auth.TokenAuthApi, "application/json");
    const response = await HttpService("put", host, url, { ...currentData, customerStatus: "CONFIRMED" }, header);
    const finalUser = { ...currentData, ...response, customerStatus: "CONFIRMED" };
    await AsyncStorage.setItem("Sesion", JSON.stringify(finalUser));
    setUser(finalUser);
  }

  return true;
};

export default OnboardingValidate;
