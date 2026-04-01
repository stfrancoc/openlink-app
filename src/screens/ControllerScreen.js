import React, { useEffect, useRef, useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import dgram from 'react-native-udp';

export default function ControllerScreen({ serverIp, onExit }) {

  const socketRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const socket = dgram.createSocket('udp4');
    socketRef.current = socket;

    socket.bind(0);

    socket.on('listening', () => {
      console.log("🟢 Socket listo");

      setReady(true);

      const registerMsg = JSON.stringify({
        type: "register",
        device: "controller"
      });

      socket.send(registerMsg, 0, registerMsg.length, 5005, serverIp);
    });

    socket.on('error', (err) => {
      console.log("Socket error:", err);
    });

    return () => {
      socket.close();
    };
  }, []);

  const sendCommand = (command, payload = {}) => {
    if (!ready || !socketRef.current) return;

    const msg = JSON.stringify({
      type: "control",
      command,
      payload
    });

    socketRef.current.send(msg, 0, msg.length, 5005, serverIp);
  };

  return (
    <View style={styles.container}>

      <Button title="⬅️" onPress={() => sendCommand("move", { x: -50, y: 0 })} />
      <Button title="➡️" onPress={() => sendCommand("move", { x: 50, y: 0 })} />
      <Button title="⬆️" onPress={() => sendCommand("move", { x: 0, y: -50 })} />
      <Button title="⬇️" onPress={() => sendCommand("move", { x: 0, y: 50 })} />

      <View style={{ height: 20 }} />

      <Button title="➕ Zoom" onPress={() => sendCommand("scale", { value: 0.1 })} />
      <Button title="➖ Zoom" onPress={() => sendCommand("scale", { value: -0.1 })} />

      <View style={{ height: 20 }} />

      <Button title="Salir" onPress={onExit} color="#ff5c5c" />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 10,
    padding: 20,
    backgroundColor: '#0f0f0f'
  }
});