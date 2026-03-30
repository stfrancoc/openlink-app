import React from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import styles from '../styles/globalStyles';

export default function MenuScreen({
  serverIp,
  setServerIp,
  isConnected,
  toggleConnection,
  onSelectMode,
  ipdOffset,      
  setIpdOffset,
  initialScale,     
  setInitialScale    
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

      <View style={{ marginTop: 25 }}>
        <Text style={styles.label}>Ajuste de Visión (IPD): {ipdOffset}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 10 }}>
          <Button title="  -  " onPress={() => setIpdOffset(prev => prev - 2)} color="#444" />
          <Button title="  +  " onPress={() => setIpdOffset(prev => prev + 2)} color="#444" />
        </View>
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={styles.label}>Distancia Pantalla (Escala): {Math.round(initialScale * 100)}%</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20 }}>
          <Button title=" Alejar " onPress={() => setInitialScale(prev => Math.max(0.3, prev - 0.05))} color="#444" />
          <Button title=" Acercar " onPress={() => setInitialScale(prev => Math.min(1.5, prev + 0.05))} color="#444" />
        </View>
      </View>

      <View style={styles.buttonGroup}>
        <Button title="Pantalla flotante" onPress={() => onSelectMode('flat')} />
        <Button title="Modo VR" onPress={() => onSelectMode('vr')} />
      </View>

      <Text style={styles.status}>
        Estado: {isConnected ? "Conectado" : "Desconectado"}
      </Text>
    </View>
  );
}