import './global';
import React, { useState, useEffect } from 'react';
import dgram from 'react-native-udp';

import MenuScreen from './src/screens/MenuScreen';
import ViewerScreen from './src/screens/ViewerScreen';
import { startSensorStream } from './src/services/SensorService';

export default function App() {
  const [serverIp, setServerIp] = useState('192.168.0.4');
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  const [screen, setScreen] = useState('menu');
  const [mode, setMode] = useState('flat');

  // 🔌 Conexión UDP
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

  // 📡 Sensores
  useEffect(() => {
    let stopSensors;

    if (isConnected && socket) {
      stopSensors = startSensorStream(socket, serverIp);
    }

    return () => {
      if (stopSensors) stopSensors();
    };
  }, [isConnected, socket, serverIp]);

  // 🧭 Navegación simple
  if (screen === 'menu') {
    return (
      <MenuScreen
        serverIp={serverIp}
        setServerIp={setServerIp}
        isConnected={isConnected}
        toggleConnection={toggleConnection}
        onSelectMode={(selectedMode) => {
          setMode(selectedMode);
          setScreen('viewer');
        }}
      />
    );
  }

  return (
    <ViewerScreen
      mode={mode}
      serverIp={serverIp}
      onExit={() => setScreen('menu')}
    />
  );
}