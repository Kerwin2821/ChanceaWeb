import {createContext} from 'react';
import { AuthContextProps } from './AuthInterface';


const AuthContext = createContext({} as AuthContextProps);

export default AuthContext;