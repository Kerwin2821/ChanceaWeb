import { Cita, CitaFirebase, CustomerDestination, CustomerSource, Estado } from "./../utils/Date.interface";
import { CustomersHome } from "./../utils/Interface";
import { UserData } from "./../context/AuthContext/AuthInterface";
import firestore, { firebase } from "@react-native-firebase/firestore";

export async function crearCita(
  DataCita: Cita
) {
  const citaRef = firestore().collection("Citas").doc(); // Genera un nuevo documento en `Citas`

  const idCita = citaRef.id;

  const cita: CitaFirebase = {
    idFire: parseInt(idCita), // ID único de la cita
    ...DataCita
  };

  // Guardamos la cita en `Citas`
  await citaRef.set(cita);

  return citaRef;
}

export async function consultarCitas(userId: string) {
  try {
    // Consultar donde el usuario es el "customerSource"
    const citasComoSourceSnapshot = await firestore()
      .collection("Citas")
      .where("customerSource.id", "==", userId)
      .get();

    // Consultar donde el usuario es el "customerDestination"
    const citasComoDestinationSnapshot = await firestore()
      .collection("Citas")
      .where("customerDestination.id", "==", userId)
      .get();

    // Combinar los resultados de ambas consultas
    const citas: Cita[] = [];

    citasComoSourceSnapshot.forEach((doc) => {
      citas.push(doc.data() as Cita);
    });

    citasComoDestinationSnapshot.forEach((doc) => {
      citas.push(doc.data() as Cita);
    });

    return citas;
  } catch (error) {
    console.error("Error al consultar las citas: ", error);
    return [];
  }
}

export function actualizarEstadoCita(citaId: string, nuevoEstado: string) {
  return firestore()
    .collection("Citas")
    .doc(citaId)
    .update({
      statusInvitation: nuevoEstado,
    })
    .catch((error) => {
      console.error("Error updating cita: ", error);
    });
}
