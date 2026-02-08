import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";

export interface OrdenContextProps {
  HandlerOrden: (navigation: NavigationScreenNavigationType) => Promise<void>;
}

