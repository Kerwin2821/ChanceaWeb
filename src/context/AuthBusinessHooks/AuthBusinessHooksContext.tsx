import {createContext} from 'react';
import { SesionBusinessContextProps } from './AuthBusinessHooksInterface';


const SesionBusinessContext = createContext({} as SesionBusinessContextProps);

export default SesionBusinessContext;