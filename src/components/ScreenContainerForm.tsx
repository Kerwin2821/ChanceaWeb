import type React from "react"
import { ScrollView, View, StyleSheet, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRender } from "../context"
import { height } from "../utils/Helpers"

interface Props {
  children?: React.ReactNode
  backgroundColor?: string
  contentContainerStyle?: any
}

const ScreenContainerForm = ({ backgroundColor = "#FFFFFF", children, contentContainerStyle }: Props) => {
  const { KeyboardStatus } = useRender()
  const Container = Platform.OS === "web" ? View : SafeAreaView

  return (
    <Container style={[styles.safeArea, { alignItems: 'center' }]} edges={["top", "bottom"]}>
      <View style={{ flex: 1, width: '100%', maxWidth: Platform.OS === 'web' ? 500 : '100%' }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            { backgroundColor },
            !KeyboardStatus && styles.flex,
            contentContainerStyle,
          ]}
        >
          <View style={[{ flex: 1 }, KeyboardStatus && styles.keyboardActiveContainer]}>{children}</View>
        </ScrollView>
      </View>
    </Container>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
  },
  flex: {
    flex: 1,
  },
  keyboardActiveContainer: {
    minHeight: height + height / 6,
  },
})

export default ScreenContainerForm
