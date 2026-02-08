export interface DataRes {
  data: Data;
}

export interface Data {
  beginningdate: string;
  collections: any[];
  customer: Customer;
  description: string;
  destination: any;
  endindDate: any;
  id: number;
  lote: Lote;
  point: number;
  statusCupon: string;
  token: string;
}

export interface Customer {
  addressId: number;
  beginningdate: string;
  code: string;
  conditionType: string;
  deviceId: string;
  email: string;
  gender: string;
  id: number;
  identificationNumber: string;
  isFirtsLogin: boolean;
  isLogged: boolean;
  isReceiveNotification: boolean;
  lastName: string;
  latitude: any;
  longitude: any;
  name: string;
  phoneNumber: string;
  referenCode: string;
  searchDistance: number;
  statusCustomer: string;
}

export interface Lote {
  amount: number;
  auctionDate: string;
  availableQuantity: any;
  bstores: any;
  description: string;
  endAuctionDate: string;
  expirationDate: string;
  id: number;
  isFree: boolean;
  loteName: string;
  loteNumber: string;
  points: number;
  quantity: number;
  statusLote: string;
  type: string;
}
