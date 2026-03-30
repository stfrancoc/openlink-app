import React from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import styles from '../styles/globalStyles';

export default function MenuScreen({
  serverIp,
  setServerIp,
  isConnected,
  toggleConnection,
  onSelectMode
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>OpenLink XR</Text>

      <Text style={styles.label}>IP del servidor</Text>

      <TextInput
        style={styles.input}
        value={serverIp}
        onChangeText={setServerIp}
        placeholder="192.168.x.x"
      />

      <Button
        title={isConnected ? "Desconectar" : "Conectar"}
        onPress={toggleConnection}
        color={isConnected ? "#ff5c5c" : "#4CAF50"}
      />

      <View style={styles.buttonGroup}>
        <Button
          title="Pantalla flotante"
          onPress={() => onSelectMode('flat')}
        />

        <Button
          title="Modo VR"
          onPress={() => onSelectMode('vr')}
        />
      </View>

      <Text style={styles.status}>
        Estado: {isConnected ? "Conectado" : "Desconectado"}
      </Text>
    </View>
  );
}