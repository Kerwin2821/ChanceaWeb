export type RegaloNotification = {
  igtf: string;
  nombre: string;
  iva: string;
  typeBox: string;
  totalAmount: string;
  code: string;
  elementId: string;
  id: string;
  amount: string;
  codigoOrden: string;
  customerDestination: {firstName: string; lastName: string};
  description: string;
  imagenUrl: string;
  totalAmountDolar: string;
};

export type CitaNotification = {
  igtf: string;
  nombre: string;
  iva: string;
  typeBox: string;
  totalAmount: string;
  code: string;
  elementId: string;
  id: string;
  amount: string;
  codigoOrden: string;
  customerDestination: string;
  description: string;
  imagenUrl: string;
  totalAmountDolar: string;
  positionX: string;
  positionY: string;
  storeName: string;
};
