import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserData } from "../context/AuthContext/AuthInterface";
import { NavigationScreenNavigationType } from "../navigation/StackNavigator";
import { HttpService } from "../services";
import { GetHeader } from "./Helpers";
import { SesionBusiness } from "../context/AuthBusinessHooks/AuthBusinessHooksInterface";
import { Stores } from "../context/storeBusinessHooks/StoreBusinessInterface";
const OnboardingValidateBusiness = async (
  businessData: SesionBusiness,
  navigation: NavigationScreenNavigationType,
  setBusinessData: (e: SesionBusiness) => void,
  stores: Stores[],
  auth?: { TokenAuthApi: string; SesionToken: string }
) => {
  console.log(businessData, "businessData");
  console.log(!businessData.bankInformation, "businessData");
  //Paso 1
  if (!businessData.urlLogo || !businessData.urlRif) {
    setBusinessData(businessData);
    navigation.navigate("WelcomeBusiness");
    return false;
  }

  //Paso 2
  if (!stores.length) {
    navigation.navigate("CreateTienda");
    return false;
  }

  //Paso 3
  if (!businessData.bankInformation) {
    navigation.navigate("RepForm");
    return false;
  }
  //Paso 4
  if (!businessData.customerSource) {
    navigation.navigate("BussinessSourceScreen");
    return false;
  }

  if (auth) {
    const host = process.env.APP_BASE_API;
    const url = `/api/appchancea/businesses/update?sessionToken=${auth.SesionToken}`;
    const header = await GetHeader(auth.TokenAuthApi, "application/json");
    const response = await HttpService(
      "put",
      host,
      url,
      {
        name: businessData.name,
        comercialDenomination: businessData.comercialDenomination,
        identificationNumber: businessData.identificationNumber,
        conditionType: businessData.conditionType,
        phoneNumber: businessData.phoneNumber,
        email: businessData.email,
        password: null,
        logintude: businessData.postionX,
        latitude: businessData.postionY,
        token: auth.SesionToken,
        fileRifUrl: businessData.urlRif,
        fileLogo: businessData.urlLogo,
      },
      header
    );
    await AsyncStorage.setItem("Sesion", JSON.stringify(response));
    setBusinessData(response);
  }

  return true;
};

export default OnboardingValidateBusiness;
