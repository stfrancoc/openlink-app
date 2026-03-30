import React from 'react';
import { View, Button, Text, Dimensions } from 'react-native';
import ImageStream from '../components/ImageStream';

const { width } = Dimensions.get('window');

export default function ViewerScreen({ mode, serverIp, onExit }) {
  if (mode === 'flat') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
        <Text style={{ color: 'white', position: 'absolute', top: 40 }}>Pantalla flotante</Text>

        <View style={{ width: '90%', height: '60%', overflow: 'hidden' }}>
          <ImageStream serverIp={serverIp} />
        </View>

        <Button title="Salir" onPress={onExit} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
        
    
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'black' }}>
        <ImageStream serverIp={serverIp} style={{ width: width / 2 }} />
        <ImageStream serverIp={serverIp} style={{ width: width / 2 }} />
        
        </View>

        <Button title="Salir" onPress={onExit} />
    </View>
  );
}