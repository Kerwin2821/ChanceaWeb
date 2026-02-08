import useAuth from './AuthContext/AuthProvider';
import { useRender } from './renderContext/RenderState';
import { useFormRegister } from './registerContext/RegisterState';
import { useStore } from './storeContext/StoreState';


export {
    useRender,
    useFormRegister,
    useAuth,
    useStore,
}