import './global';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button } from 'react-native';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import dgram from 'react-native-udp';
import { Buffer } from 'buffer';

export default function App() {
  // Estado para la IP y el estado de conexión
  const [serverIp, setServerIp] = useState('192.168.0.4'); // IP por defecto
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  const toggleConnection = () => {
    if (isConnected) {
      socket.close();
      setSocket(null);
      setIsConnected(false);
    } else {
      const newSocket = dgram.createSocket('udp4');
      newSocket.bind(0); // Puerto local aleatorio
      setSocket(newSocket);
      setIsConnected(true);
    }
  };

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

    }, 16); // ~60Hz
  }

  return () => {
    if (accelSub) accelSub.remove();
    if (gyroSub) gyroSub.remove();
    if (interval) clearInterval(interval);
    if (socket) socket.removeAllListeners();
  };

}, [isConnected, socket, serverIp]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OpenLinkXR Terminal</Text>
      
      <Text>Configurar IP del Servidor:</Text>
      <TextInput
        style={styles.input}
        onChangeText={setServerIp}
        value={serverIp}
        placeholder="Ej: 192.168.0.4"
        keyboardType="numeric"
      />

      <Button 
        title={isConnected ? "Detener Streaming" : "Iniciar Streaming"} 
        color={isConnected ? "#ff5c5c" : "#4CAF50"}
        onPress={toggleConnection} 
      />

      <Text style={styles.status}>
        Estado: {isConnected ? `Transmitiendo a ${serverIp}` : "Desconectado"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20, paddingHorizontal: 10, borderRadius: 5 },
  status: { marginTop: 20, textAlign: 'center', fontWeight: 'bold' }
});