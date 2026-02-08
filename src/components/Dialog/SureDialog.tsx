import { View, Text, Linking, BackHandler } from 'react-native'
import React, { useEffect } from 'react'
import { Dialog } from '@rn-vui/themed'
import Button from '../ButtonComponent/Button';


const DialogSure = ({isActive, setActive, Text="¿Estás seguro de continuar?", onPress}:{isActive:boolean, setActive: (e:boolean) => void, Text?:string, onPress:() => void}) => {
    const handleClosePress = () => {
        setActive(false)
      };
  return (
    <Dialog isVisible={isActive} onBackdropPress={() => setActive(false)} className="justify-center text-center bg-white">
    <Dialog.Title titleStyle={{ textAlign: 'center' }} title={Text} />
    <View className=" mt-5">
      <Button text={'Ok'} typeButton="white" onPress={() => {onPress()}} />

      <Button styleText={{ color: 'white' }} text={'No'} onPress={handleClosePress} />
    </View>
  </Dialog>
  )
}

export default DialogSure