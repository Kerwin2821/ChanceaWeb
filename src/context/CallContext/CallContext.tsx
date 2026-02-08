import { createContext } from "react";
import { CallContextType } from "./CallInterface";


const CallContext = createContext<CallContextType | undefined>(undefined)


export default CallContext;