import React from 'react';
import { WebView } from 'react-native-webview';

export default function ImageStream({ serverIp, style }) {
  return (
    <WebView
      source={{ uri: `http://${serverIp}:8000/video` }}
      style={[{ flex: 1, backgroundColor: 'black' }, style]}
      javaScriptEnabled
      domStorageEnabled
    />
  );
}