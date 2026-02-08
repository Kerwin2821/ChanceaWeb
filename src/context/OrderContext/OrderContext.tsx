import {createContext} from 'react';
import { OrdenContextProps } from './OrderContextInterface';


const OrdenContext = createContext({} as OrdenContextProps);

export default OrdenContext;