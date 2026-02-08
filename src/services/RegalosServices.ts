import { Regalo, RegaloFirebase } from "../utils/Date.interface";
import firestore from "@react-native-firebase/firestore";

export async function crearRegalo(
  DataRegalo: Regalo
) {
  const RegaloRef = firestore().collection("Regalos").doc(); // Genera un nuevo documento en `Regalos`

  const idRegalo = RegaloRef.id;

  const Regalo: RegaloFirebase = {
    idFire: parseInt(idRegalo), // ID único de la Regalo
    ...DataRegalo
  };

  // Guardamos la Regalo en `Regalos`
  await RegaloRef.set(Regalo);

  return RegaloRef;
}

export async function consultarRegalos(userId: string) {
  try {
    // Consultar donde el usuario es el "customerSource"
    const RegalosComoSourceSnapshot = await firestore()
      .collection("Regalos")
      .where("customerSource.id", "==", userId)
      .get();

    // Consultar donde el usuario es el "customerDestination"
    const RegalosComoDestinationSnapshot = await firestore()
      .collection("Regalos")
      .where("customerDestination.id", "==", userId)
      .get();

    // Combinar los resultados de ambas consultas
    const Regalos: Regalo[] = [];

    RegalosComoSourceSnapshot.forEach((doc) => {
      Regalos.push(doc.data() as Regalo);
    });

    RegalosComoDestinationSnapshot.forEach((doc) => {
      Regalos.push(doc.data() as Regalo);
    });

    return Regalos;
  } catch (error) {
    console.error("Error al consultar las Regalos: ", error);
    return [];
  }
}

export function actualizarEstadoRegalo(RegaloId: string, nuevoEstado: string) {
  return firestore()
    .collection("Regalos")
    .doc(RegaloId)
    .update({
      statusInvitation: nuevoEstado,
    })
    .catch((error) => {
      console.error("Error updating Regalo: ", error);
    });
}
