import AsyncStorage from "@react-native-async-storage/async-storage";
import { MatchResponse, MatchStorage } from "../context/storeContext/StoreInterface";
import { sendNotificationLocal } from "../utils/sendNotification";
import { UserData } from "../context/AuthContext/AuthInterface";

const MATCH_STORAGE_KEY = "@matchs_data";

// Crear o Añadir un Match
export const addMatch = async (match: MatchResponse) => {
  try {
    const matchs = await getMatchs();
    const updatedMatchs = [...matchs, {...match.customers, notificado:true}];
    await AsyncStorage.setItem(MATCH_STORAGE_KEY, JSON.stringify(updatedMatchs));
    console.log("Match added:", match);
  } catch (e) {
    console.error("Failed to add match.", e);
  }
};

// Leer o Obtener Todos los Matchs
export const getMatchs = async (): Promise<MatchStorage[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(MATCH_STORAGE_KEY);
    return jsonValue ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Failed to fetch matchs.", e);
    return [];
  }
};

// Actualizar un Match
export const updateMatch = async (updatedMatch: MatchStorage) => {
  try {
    const matchs = await getMatchs();
    const matchIndex = matchs.findIndex((match) => match.id === updatedMatch.id);

    if (matchIndex !== -1) {
      matchs[matchIndex] = updatedMatch;
      await AsyncStorage.setItem(MATCH_STORAGE_KEY, JSON.stringify(matchs));
      console.log("Match updated:", updatedMatch);
    } else {
      console.warn("Match not found.");
    }
  } catch (e) {
    console.error("Failed to update match.", e);
  }
};

// Borrar un Match
export const deleteMatch = async (idMatch: string) => {
  try {
    const matchs = await getMatchs();
    const updatedMatchs = matchs.filter((match) => match.id !== Number(idMatch));

    await AsyncStorage.setItem(MATCH_STORAGE_KEY, JSON.stringify(updatedMatchs));
    console.log("Match deleted with id:", idMatch);
  } catch (e) {
    console.error("Failed to delete match.", e);
  }
};

// Borrar Todos los Matchs
export const clearMatchs = async () => {
  try {
    await AsyncStorage.removeItem(MATCH_STORAGE_KEY);
    console.log("All matchs cleared");
  } catch (e) {
    console.error("Failed to clear matchs.", e);
  }
};

export const initializeMatchs = async (matchs: MatchStorage[]) => {
  const initializedMatchs = matchs.map((match, index) => {
    return {
      ...match,
      notificado: match.notificado !== undefined ? match.notificado : false,
    };
  });

  await AsyncStorage.setItem(MATCH_STORAGE_KEY, JSON.stringify(initializedMatchs));
  console.log("Matchs initialized with notificado key.");
};

export const manageMatchsLocal = async (
    newMatchs: UserData[]
  ) => {
    const storedMatchs = await getMatchs();
  /* 
    if (!storedMatchs || !storedMatchs.length) {
      // Si no hay matchs almacenados, inicializamos y guardamos
      await AsyncStorage.setItem(MATCH_STORAGE_KEY, JSON.stringify(newMatchs.map(e => ({ ...e, notificado: true }))));
    } else {
      validateAndNotifyMatchsLocal(newMatchs);
    } */
  };
  export const validateAndNotifyMatchsLocal = async (
    newMatchs: UserData[],
  ): Promise<void> => {
    const previousMatchs: MatchStorage[] = await getMatchs();
    const newMATCHS: UserData[] = [...newMatchs];
    const addedMatchs: MatchStorage[] = [];
    const NewData = [...previousMatchs];
  
    // Validar si un match fue agregado o actualizado
    newMATCHS.forEach((newMATCH) => {
      const existingMatch = previousMatchs.find((match) => match.id=== newMATCH.id);
      
      if (!existingMatch) {
        // Match nuevo agregado
        sendNotificationLocal("¡Cuadraste!", `Cuadrates con ${newMATCH.firstName} `,{
          code: "102",
        });
        addedMatchs.push({ ...newMATCH, notificado: true });
        NewData.push({ ...newMATCH, notificado: true });
      }
    });
  
    // Enviar notificaciones para matchs agregados o actualizados
    if (addedMatchs.length) {
      await AsyncStorage.setItem(MATCH_STORAGE_KEY, JSON.stringify(NewData));
    }
  };
  