import './global';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Dimensions } from 'react-native';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import dgram from 'react-native-udp';
import { Buffer } from 'buffer';
import { Image } from 'react-native';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [serverIp, setServerIp] = useState('192.168.0.4');
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  const [screen, setScreen] = useState('menu'); 
  const [mode, setMode] = useState('flat'); // flat | vr

  const toggleConnection = () => {
    if (isConnected) {
      socket.close();
      setSocket(null);
      setIsConnected(false);
    } else {
      const newSocket = dgram.createSocket('udp4');
      newSocket.bind(0);
      setSocket(newSocket);
      setIsConnected(true);
    }
  };

  // 🔥 ENVÍO DE SENSORES (igual que el tuyo)
  useEffect(() => {
    let accelData = { x: 0, y: 0, z: 0 };
    let gyroData = { x: 0, y: 0, z: 0 };

    let accelSub;
    let gyroSub;
    let interval;

    if (isConnected && socket) {
      Accelerometer.setUpdateInterval(10);
      Gyroscope.setUpdateInterval(10);

      accelSub = Accelerometer.addListener(data => {
        accelData = data;
      });

      gyroSub = Gyroscope.addListener(data => {
        gyroData = data;
      });

      interval = setInterval(() => {
        const message = {
          deviceId: "phone_1",
          type: "imu",
          data: {
            acceleration: {
              x: parseFloat(accelData.x.toFixed(3)),
              y: parseFloat(accelData.y.toFixed(3)),
              z: parseFloat(accelData.z.toFixed(3))
            },
            gyroscope: {
              x: parseFloat(gyroData.x.toFixed(3)),
              y: parseFloat(gyroData.y.toFixed(3)),
              z: parseFloat(gyroData.z.toFixed(3))
            }
          },
          timestamp: Date.now()
        };

        const buf = Buffer.from(JSON.stringify(message));
        socket.send(buf, 0, buf.length, 5005, serverIp);

      }, 16);
    }

    return () => {
      if (accelSub) accelSub.remove();
      if (gyroSub) gyroSub.remove();
      if (interval) clearInterval(interval);
    };
  }, [isConnected, socket, serverIp]);

  // 🎮 PANTALLAS

  if (screen === 'menu') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>OpenLink XR</Text>

        <Text>IP del servidor</Text>
        <TextInput
          style={styles.input}
          value={serverIp}
          onChangeText={setServerIp}
        />

        <Button
          title={isConnected ? "Desconectar" : "Conectar"}
          onPress={toggleConnection}
        />

        <View style={{ marginTop: 20 }}>
          <Button title="Pantalla flotante" onPress={() => { setMode('flat'); setScreen('viewer'); }} />
          <Button title="Modo VR" onPress={() => { setMode('vr'); setScreen('viewer'); }} />
        </View>

        <Text style={styles.status}>
          {isConnected ? "Conectado" : "Desconectado"}
        </Text>
      </View>
    );
  }

  // 🥽 VIEWER
  return (
    <View style={styles.viewerContainer}>
      {mode === 'flat' ? (
        <View style={styles.flatContainer}>
          <Text style={styles.overlay}>Pantalla flotante</Text>
          <ImageStream serverIp={serverIp} />
        </View>
      ) : (
        <View style={styles.vrContainer}>
          <ImageStream serverIp={serverIp} style={{ width: width / 2 }} />
          <ImageStream serverIp={serverIp} style={{ width: width / 2 }} />
        </View>
      )}

      <View style={styles.exitBtn}>
        <Button title="Salir" onPress={() => setScreen('menu')} />
      </View>
    </View>
  );
}


// 🔥 COMPONENTE DE VIDEO
const ImageStream = ({ serverIp, style }) => {
  return (
    <WebView
      source={{ uri: `http://${serverIp}:8000/video` }}
      style={[{ flex: 1, backgroundColor: 'black' }, style]}
      javaScriptEnabled
      domStorageEnabled
      allowsInlineMediaPlayback
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10 },

  viewerContainer: { flex: 1, backgroundColor: 'black' },

  flatContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  vrContainer: {
    flex: 1,
    flexDirection: 'row'
  },

  overlay: {
    position: 'absolute',
    top: 40,
    color: 'white',
    zIndex: 10
  },

  exitBtn: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center'
  }
});