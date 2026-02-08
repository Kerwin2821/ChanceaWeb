import {createContext} from 'react';
import { ChatContextProps } from './ChatInterface';


const ChatContext = createContext({} as ChatContextProps);

export default ChatContext;