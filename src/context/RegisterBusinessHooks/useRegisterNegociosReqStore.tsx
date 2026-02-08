import { create } from 'zustand'
import { BusinessState, initialStateRegisterNegocios } from './RegisterBusinessHooksInterface'

 const useRegisterNegociosReqStore = create<BusinessState>((set) => ({
  initialStateRegisterNegocios,
  registerNegociosReq: initialStateRegisterNegocios,
  setRegisterNegociosReq: (request) => set((state) => ({
    registerNegociosReq: { ...state.registerNegociosReq, ...request }
  })),
  resetRegisterNegociosReq: () => set({ registerNegociosReq: initialStateRegisterNegocios }),
}))

export default useRegisterNegociosReqStore


