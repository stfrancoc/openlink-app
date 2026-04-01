import './global';
import React, { useState, useEffect } from 'react';
import dgram from 'react-native-udp';
import ControllerScreen from './src/screens/ControllerScreen';
import MenuScreen from './src/screens/MenuScreen';
import ViewerScreen from './src/screens/ViewerScreen';
import { startSensorStream } from './src/services/SensorService';

export default function App() {
  const [serverIp, setServerIp] = useState('192.168.0.4');
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [ipdOffset, setIpdOffset] = useState(0);
  const [screen, setScreen] = useState('menu');
  const [mode, setMode] = useState('flat');
  const [initialScale, setInitialScale] = useState(0.8);

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

  useEffect(() => {
    let stopSensors;

    if (isConnected && socket) {
      stopSensors = startSensorStream(socket, serverIp);
    }

    return () => {
      if (stopSensors) stopSensors();
    };
  }, [isConnected, socket, serverIp]);

  if (screen === 'menu') {
    return (
      <MenuScreen
        serverIp={serverIp}
        setServerIp={setServerIp}
        isConnected={isConnected}
        initialScale={initialScale}
        setInitialScale={setInitialScale}
        toggleConnection={toggleConnection}
        ipdOffset={ipdOffset}
        setIpdOffset={setIpdOffset}
        onSelectMode={(selectedMode) => {
          setMode(selectedMode);
          setScreen('viewer');
        }}
      />
    );
  }

  if (mode === 'controller') {
    return (
      <ControllerScreen
        serverIp={serverIp}
        onExit={() => setScreen('menu')}
      />
    );
  }

  return (
    <ViewerScreen
      mode={mode}
      serverIp={serverIp}
      ipdOffset={ipdOffset} 
      initialScale={initialScale}
      onExit={() => setScreen('menu')}
    />
  );
}