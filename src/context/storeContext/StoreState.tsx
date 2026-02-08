import React, { useState, PropsWithChildren, useEffect, createContext, useContext } from 'react';
import { StoreContextProps } from './StoreInterface';
import { CustomersHome, Piropo, Piropo3, Priropo2 } from '../../utils/Interface';
import { Plan, UserData } from '../AuthContext/AuthInterface';
import { BoxPackage, BoxPackageV2, Cita } from '../../utils/Date.interface'
import { GiftData } from '../../screens/Regalos/interface.regalos';

const StoreContext = createContext({} as StoreContextProps);

const StoreState = ({ children }: PropsWithChildren) => {
  const [Customers, setCustomers] = useState<CustomersHome[]>([])
  const [Customers2, setCustomers2] = useState<CustomersHome[]>([]);
  const [Match, setMatch] = useState<UserData[] | undefined>()
  const [WhoLikeMeList, setWhoLikeMeList] = useState<UserData[]>([])
  const [Piropos, setPiropos] = useState<Piropo3[]>([])
  const [LastViewID, setLastViewID] = useState<number | undefined>()
  const [WhoLikeMePage, setWhoLikeMePage] = useState<number>(0);
  const [Citas, setCitas] = useState<Cita[]>([]);
  const [CitasRecibidas, setCitasRecibidas] = useState<Cita[]>([]);
  const [CitasEnviadas, setCitasEnviadas] = useState<Cita[]>([]);
  const [Regalos, setRegalos] = useState<GiftData[]>([]);
  const [RegalosRecibidas, setRegalosRecibidas] = useState<GiftData[]>([]);
  const [RegalosEnviadas, setRegalosEnviadas] = useState<GiftData[]>([]);
  const [Plans, setPlans] = useState<Plan[]>([]);
  const [BoxPackage, setBoxPackage] = useState<BoxPackageV2 | undefined>();
  const [PhotoIndexes, setPhotoIndexesState] = useState<Record<string, number>>({})
  const [SwiperIndex, setSwiperIndex] = useState<number>(0)

  const setPhotoIndex = (userId: string, index: number) => {
    setPhotoIndexesState(prev => ({
      ...prev,
      [userId]: index
    }))
  }

  useEffect(() => {
    console.log(Customers2, "Customers2")
  }, [Customers2])



  return (
    <StoreContext.Provider
      value={{
        Customers, setCustomers,
        Match, setMatch,
        WhoLikeMeList, setWhoLikeMeList,
        LastViewID, setLastViewID,
        Piropos, setPiropos,
        Customers2, setCustomers2,
        WhoLikeMePage, setWhoLikeMePage,
        Citas, setCitas,
        CitasRecibidas, setCitasRecibidas,
        CitasEnviadas, setCitasEnviadas,
        BoxPackage, setBoxPackage,
        Plans, setPlans,
        Regalos, setRegalos,
        RegalosRecibidas, setRegalosRecibidas,
        RegalosEnviadas, setRegalosEnviadas,
        PhotoIndexes, setPhotoIndex,
        SwiperIndex, setSwiperIndex
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
export const useStore = () => useContext(StoreContext);

export default StoreState;
