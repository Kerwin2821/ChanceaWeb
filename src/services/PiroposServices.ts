import { CustomersHome } from "../utils/Interface";
import { UserData } from "./../context/AuthContext/AuthInterface";
import firestore, { firebase } from "@react-native-firebase/firestore";

export async function crearPiropo(userData_1: UserData | null, userData_2: CustomersHome | undefined, mensaje: string) {
  const update2 = await firestore().collection("Clientes").doc(userData_2?.id.toString()).collection("Piropos").doc();

  const id = update2.id;

  update2.set({
    idPiropo: id,
    infoUser: userData_1,
    fecha: new Date().getTime(),
    ultimoMensaje: mensaje,
    visto: false,
  });

  return update2;
}

export function consultarPiropos(userData_1: UserData | null) {
  return firestore()
    .collection("Clientes")
    .doc(userData_1?.id.toString())
    .collection("Piropos")
}

export function piroposVisto(userData_1: UserData | null) {
  firestore()
    .collection("Clientes")
    .doc(userData_1?.id.toString())
    .collection("Piropos")
    .get()
    .then((querySnapshot) => {
      // Recorremos cada documento de la colección "Piropos"
      querySnapshot.forEach((doc) => {
        // Actualizamos el campo 'visto' a true
        doc.ref.update({
          visto: true,
        });
      });
    })
    .catch((error) => {
      console.error("Error updating documents: ", error);
    });
}
