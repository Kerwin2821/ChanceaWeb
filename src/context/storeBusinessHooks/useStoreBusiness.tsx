import { create } from 'zustand'
import { Stores, LoteBusiness, CreateLote, BankData, initialFormBankData, Paquetes, Productos, ReservationSingleListResponse, ProductRequest, initialProduct, initialBoxPackage, BoxPackageRequest, StoreBusinessState } from './StoreBusinessInterface'
import { initialFormCreateTienda, InitCreateLote } from './StoreBusinessInterface'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { DashboardBusinessResponse } from './BusinessResponses.interface'
import { Regalo } from '../../utils/Regalos.interface'
import { RegalosSends } from './RegalosResponse.interface'
import { GiftData } from '../../screens/Regalos/interface.regalos'


export const useStoreBusiness = create<StoreBusinessState>((set) => ({
  RepCivil: initialFormBankData,
  setRepCivil: (repCivil) => set({ RepCivil: repCivil }),
  DashboardData: undefined,
  setDashboardData: (dashboardData) => set({ DashboardData: dashboardData }),
  Stores: [],
  setStores: (stores) => set({ Stores: stores }),
  Reservation: undefined,
  setReservation: (reservation) => set({ Reservation: reservation }),
  Productos: undefined,
  setProductos: (productos) => set({ Productos: productos }),
  Paquetes: undefined,
  setPaquetes: (paquetes) => set({ Paquetes: paquetes }),
  Regalos: undefined,
  setRegalos: (regalos) => set({ Regalos: regalos }),
  FormCreateTienda: initialFormCreateTienda,
  setFormCreateTienda: (form) => set({ FormCreateTienda: form }),
  Cupones: [],
  setCupones: (cupones) => set({ Cupones: cupones }),
  FormCreateLote: InitCreateLote,
  setFormCreateLote: (form) => set({ FormCreateLote: form }),
  FormCreateProd: initialProduct,
  setFormCreateProd: (form) => set({ FormCreateProd: form }),
  FormCreateBoxPackage: initialBoxPackage,
  setFormCreateBoxPackage: (form) => set({ FormCreateBoxPackage: form }),
}))
