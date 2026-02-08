import { Platform } from "react-native";
import * as Calendar from "expo-calendar";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getCalendarPermissions() {
  if (Platform.OS === "android") {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== "granted") {
      alert("Se requieren permisos de calendario para esta funcionalidad.");
      return;
    }

    const data = await createCalendar();

    await saveCalendarId(data);
  }
}

export async function getDefaultCalendarSource() {
  const calendars = await Calendar.getCalendarsAsync();
  const defaultCalendar = calendars.find((calendar) => calendar.source && calendar.source.name === "Default");
  return defaultCalendar ? defaultCalendar.source : calendars[0].source;
}

export async function createCalendar() {
  const defaultCalendarSource = await getDefaultCalendarSource();
  const newCalendarID = await Calendar.createCalendarAsync({
    title: "Mi Calendario",
    color: "blue",
    entityType: Calendar.EntityTypes.EVENT,
    sourceId: defaultCalendarSource.id,
    source: defaultCalendarSource,
    name: "interno",
    ownerAccount: "personal",
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });
  return newCalendarID;
}

/**
 * Esta función agrega un evento al calendario del dispositivo.
 * 
 * @param {string} titulo - El título del evento. Ejemplo 
 * @param {Date} fecha - La fecha y hora de inicio del evento.
 * 
 * La función realiza los siguientes pasos:
 * 1. Obtiene el `calendarId` almacenado en el dispositivo llamando a `getCalendarId()`.
 *    Si no hay un `calendarId`, la función se detiene.
 * 2. Crea un evento en el calendario especificado utilizando `Calendar.createEventAsync`.
 *    - El evento se crea con el título proporcionado (`titulo`).
 *    - La fecha de inicio del evento es una hora después de la fecha proporcionada (`fecha`).
 *    - La fecha de finalización del evento es dos horas después de la fecha de inicio.
 *    - Se configuran dos alarmas: una que avisa un día antes y otra que avisa 15 minutos antes del evento.
 * 
 * @returns {string} El ID del evento creado en el calendario, o `undefined` si no hay un calendario.
 */

export async function addEventToCalendar(titulo:string, fecha:Date ) { 
  const calendarId = await  getCalendarId()

  if(!calendarId){
    return
  }

  const eventId = await Calendar.createEventAsync(calendarId, {
    title: titulo,
    startDate: new Date( fecha.getTime() + 1000 * 60 * 60),
    endDate: new Date(fecha.getTime() + 1000 * 60 * 120),
    timeZone: "GMT-4",
    alarms: [
      {
        relativeOffset: -1440, // Aviso un día antes del evento
        method: Calendar.AlarmMethod.ALERT, // Mostrar una alerta
      },
      {
        relativeOffset: -120, // 15 minutos antes del evento
        method: Calendar.AlarmMethod.ALERT, // Método de aviso (ALERT, EMAIL, etc.)
      },
    ],
  });

  return eventId;
}

export async function saveCalendarId(calendarId: string) {
  try {
    await AsyncStorage.setItem("@calendar_id", calendarId);
    console.log("Calendar ID guardado con éxito");
  } catch (e) {
    console.error("Error guardando el Calendar ID:", e);
  }
}

export async function getCalendarId() {
  try {
    const calendarId = await AsyncStorage.getItem("@calendar_id");
    if (calendarId !== null) {
      console.log("Calendar ID recuperado:", calendarId);
      return calendarId;
    } else {
      console.log("No hay Calendar ID guardado.");
      return null;
    }
  } catch (e) {
    console.error("Error leyendo el Calendar ID:", e);
  }
}

export async function updateCalendarId(newCalendarId: string) {
  try {
    await AsyncStorage.setItem("@calendar_id", newCalendarId);
    console.log("Calendar ID actualizado con éxito");
  } catch (e) {
    console.error("Error actualizando el Calendar ID:", e);
  }
}

export async function deleteCalendarId() {
  try {
    await AsyncStorage.removeItem("@calendar_id");
    console.log("Calendar ID eliminado con éxito");
  } catch (e) {
    console.error("Error eliminando el Calendar ID:", e);
  }
}
