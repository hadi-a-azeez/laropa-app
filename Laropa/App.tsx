import { StatusBar } from "expo-status-bar";
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  BackHandler,
  RefreshControl,
  ScrollView,
} from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useState, useEffect, useRef } from "react";
import NetInfo from "@react-native-community/netinfo";
import WebView from "react-native-webview";
import Loader from "./components/Loader";
import Constants from "expo-constants";
import NoInternet from "./components/NoInternet";

export default function App() {
  const [internetAvailable, setInternetAvailable] = useState(true);
  const webViewRef = useRef<WebView>(null);
  const [showLoading, setShowLoading] = useState(true);

  const [refresherEnabled, setEnableRefresher] = useState(true);
  const [webviewLink, setWebviewLink] = useState("https://laropa.in");

  const onAndroidBackPress = (): boolean => {
    if (webViewRef.current) {
      webViewRef.current.goBack();
      return true; // prevent default behavior (exit app)
    }
    return false;
  };

  const holdSplashScreen = async () => {
    // keep splash screen visible
    await SplashScreen.preventAutoHideAsync();
    // pre-load your stuff
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // hide splash screen
    await SplashScreen.hideAsync();
  };

  useEffect((): (() => void) | undefined => {
    if (Platform.OS === "android") {
      BackHandler.addEventListener("hardwareBackPress", onAndroidBackPress);
      return (): void => {
        BackHandler.removeEventListener(
          "hardwareBackPress",
          onAndroidBackPress
        );
      };
    }
    const unsubscribe = NetInfo.addEventListener((state) => {
      setInternetAvailable(!!state.isConnected);
    });
    holdSplashScreen();
    return () => {
      unsubscribe();
    };
  }, []);

  if (!internetAvailable) {
    return <NoInternet />;
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: Platform.OS === "android" ? Constants.statusBarHeight : 0,
      }}
    >
      <ScrollView
        contentContainerStyle={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={false}
            enabled={refresherEnabled}
            onRefresh={() => {
              webViewRef?.current?.reload();
            }}
          />
        }
      >
        {showLoading ? <Loader /> : <></>}

        <WebView
          source={{ uri: webviewLink }}
          style={{
            flex: showLoading ? 0 : 1,
          }}
          ref={webViewRef}
          allowsBackForwardNavigationGestures={true}
          javaScriptEnabled
          allowUniversalAccessFromFileURLs
          onLoadStart={() => {
            setShowLoading(true);
          }}
          onLoad={() => {
            setShowLoading(false);
          }}
          // onMessage={handleWebMessage}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
