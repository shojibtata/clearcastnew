import React, { useEffect, useState } from 'react';
import { View, Linking, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
// html.js is generated from clearcast-weather.html by the GitHub workflow
import html from './html';

const BASE = 'https://clearcast.local/';

// Android WebView reports 0 for safe-area insets, so pad the page with the real ones.
function insetScript(top, bottom) {
  const css =
    `html{padding-top:${top}px!important}` +
    `main{padding-bottom:${132 + bottom}px!important}` +
    `.dock{padding-bottom:${12 + bottom}px!important}` +
    `.sheet{padding-bottom:${22 + bottom}px!important}` +
    `#toast{bottom:${92 + bottom}px!important}`;
  return (
    '(function(){var css=' + JSON.stringify(css) + ';' +
    'function go(){var s=document.createElement("style");s.textContent=css;' +
    '(document.head||document.documentElement).appendChild(s)}' +
    'if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",go)}else{go()}' +
    '})();true;'
  );
}

function Shell() {
  const insets = useSafeAreaInsets();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await Location.requestForegroundPermissionsAsync();
      } catch (e) {}
      setReady(true);
    })();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#050b1f' }}>
      <StatusBar style="auto" />
      {ready ? (
        <WebView
          style={{ flex: 1, backgroundColor: 'transparent' }}
          originWhitelist={['*']}
          source={{ html, baseUrl: BASE }}
          javaScriptEnabled
          domStorageEnabled
          geolocationEnabled
          setSupportMultipleWindows={false}
          overScrollMode="never"
          injectedJavaScriptBeforeContentLoaded={insetScript(
            Math.round(insets.top),
            Math.round(insets.bottom)
          )}
          onShouldStartLoadWithRequest={(req) => {
            const u = req.url || '';
            if (u.startsWith(BASE) || u.startsWith('about:') || u.startsWith('data:')) return true;
            Linking.openURL(u).catch(() => {});
            return false;
          }}
        />
      ) : (
        <ActivityIndicator style={{ flex: 1 }} color="#6aa9ff" />
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Shell />
    </SafeAreaProvider>
  );
}
