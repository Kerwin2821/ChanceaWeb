export interface PaymentStripeResponse {
    codigoRespuesta:  string;
    mensajeRespuesta: string;
    orden:            PaymentStripeResponseOrden;
    invoice:          Invoice;
    cupon:            Cupon;
}

export interface Cupon {
    id:            number;
    description:   string;
    beginningdate: Date;
    endindDate:    null;
    point:         number;
    token:         string;
    collections:   Collection[];
    statusCupon:   string;
    lote:          Lote;
    customer:      Customer;
    destination:   null;
    items:         null;
}

export interface Collection {
    id:                number;
    description:       string;
    beginningdate:     Date;
    imagen:            null;
    imagenContentType: string;
    url:               string;
    collectionType:    CollectionType;
    businesses:        null;
    lotes:             null;
}

export interface CollectionType {
    id:   number;
    name: string;
}

export interface Customer {
    id:                    number;
    name:                  string;
    lastName:              string;
    phoneNumber:           string;
    email:                 string;
    code:                  string;
    referenCode:           string;
    isReceiveNotification: boolean;
    gender:                string;
    addressId:             number;
    statusCustomer:        string;
    deviceId:              string;
    isLogged:              boolean;
    isFirtsLogin:          boolean;
    searchDistance:        number;
    beginningdate:         Date;
    latitude:              number;
    longitude:             number;
    identificationNumber:  string;
    conditionType:         string;
}

export interface Lote {
    id:                number;
    description:       string;
    loteNumber:        string;
    quantity:          number;
    statusLote:        string;
    auctionDate:       Date;
    points:            number;
    type:              string;
    isFree:            boolean;
    amount:            number;
    endAuctionDate:    Date;
    expirationDate:    Date;
    loteName:          string;
    availableQuantity: null;
    bstores:           null;
}

export interface Invoice {
    id:            null;
    invoiceNumber: string;
    controlNumber: string;
    invoiceDate:   Date;
    exemptAmount:  number;
    subtotal:      number;
    discount:      number;
    iva:           number;
    total:         number;
    orden:         InvoiceOrden;
}

export interface InvoiceOrden {
    id:           number;
    orderNumber:  string;
    ordenDate:    Date;
    statusOrden:  string;
    totalAmount:  number;
    observations: null;
}

export interface PaymentStripeResponseOrden {
    id:           number;
    orderNumber:  string;
    ordenDate:    Date;
    statusOrden:  string;
    totalAmount:  number;
    observations: null;
    paymentInfo:  null;
    paymentType:  null;
    items:        Item[];
    customer:     Customer;
}

export interface Item {
    id:         number;
    quantity:   number;
    unitPrice:  number;
    unitPrice2: null;
    amount:     number;
    amount2:    null;
}
