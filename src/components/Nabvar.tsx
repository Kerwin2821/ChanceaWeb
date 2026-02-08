import { View, Text, TouchableOpacity, Image } from 'react-native'
import { AntDesign, Entypo, FontAwesome5,Ionicons,MaterialCommunityIcons,Fontisto   } from '@expo/vector-icons'
const Navbar = () => {
    return (
        <View className='flex flex-row justify-evenly h-14 items-center bg-white border-t-2 border-gray-400 '>
            <TouchableOpacity className='items-center justify-center rounded-full h-14 w-16 '>
                <MaterialCommunityIcons name="emoticon-devil" size={24} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity className='items-center justify-center rounded-full h-14 w-16 '>
                <MaterialCommunityIcons name="card-search" size={30} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity className='items-center justify-center rounded-full h-14 w-16 '>
            <AntDesign name="star" size={24} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity className='items-center justify-center rounded-full h-14 w-16 '>
                <Ionicons name="chatbubbles" size={24} color='gray' />
            </TouchableOpacity>
            <TouchableOpacity className='items-center justify-center h-14 w-16 '>
                <FontAwesome5 name="user-alt" size={24} color="gray" />
            </TouchableOpacity>

        </View>
    )
}

export default Navbar