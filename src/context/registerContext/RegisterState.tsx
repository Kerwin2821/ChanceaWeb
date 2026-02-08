import React, {
  useState,
  PropsWithChildren,
  createContext,
  useContext,
} from "react";
import {
  FileReq,
  RegisterContextProps,
  RegisterGoogleRequest,
  RegisterNegociosRequest,
  RegisterRequest,
  RegisterRequestNew,
} from "./RegisterInterfaces";

const RegisterContext = createContext({} as RegisterContextProps);

const initialStateRegister: RegisterRequestNew = {
  firstName: "",
  lastName: "",
  email: "",
  externalId: "AAAAAAA000000",
  externalprofile: "0",
  identifcatorPayment: "0",
  instagram: null,
  facebook: null,
  twitter: null,
  tikTok: null,
  phone: "",
  aboutme: "N/A",
  birthDate: "",
  age: 0,
  postionX: null,
  postionY: null,
  password: "",
  gender: "MASCULINO",
  myReferCode: "",
  referedCode: "",
  customerStatus: "NEW",
  lastEnterEventDate: "2024-03-05T12:20:00Z",
  lastViewCustomerId: 0,
  plan: null,
  symbol: {
    id: 1,
    name: "Aries",
    description: "Aries (21 marzo - 19 abril)",
    simbolSrc: "a",
    imgBlogSimbol: null,
    imgBlogSimbolContentType: null,
  },
  customerDevices: [],
  customerProfiles: [],
  customerLanguages: [],
  customerGoals: [],
  customerInterestings: [],
};

const initialStateRegisterGoogle: RegisterGoogleRequest = {
  name: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  referenceCode: "",
  logintude: "",
  latitude: "",
  deviceId: "",
  identificationNumber: "",
  conditionType: "V",
  gender: "MASCULINO",
};

const RegisterState = ({ children }: PropsWithChildren) => {
  const [registerReq, setRegisterReq] =
    useState<RegisterRequestNew>(initialStateRegister);
  const [registerGoogleReq, setRegisterGoogleReq] =
    useState<RegisterGoogleRequest>(initialStateRegisterGoogle);
  const [nacionality, setNacionality] = useState<string | number>(0);
  const [partPhoto, setpartPhoto] = useState<FileReq | null>(null);
  const [IsGoogleRegister, setIsGoogleRegister] = useState(false)
  
  return (
    <RegisterContext.Provider
      value={{
        registerReq,
        nacionality,
        initialStateRegister,
        setRegisterReq,
        setNacionality,
        partPhoto,
        setpartPhoto,
        registerGoogleReq,
        setRegisterGoogleReq,
        initialStateRegisterGoogle,
        IsGoogleRegister, setIsGoogleRegister
      }}
    >
      {children}
    </RegisterContext.Provider>
  );
};

export const useFormRegister = () => useContext(RegisterContext);

export default RegisterState;
