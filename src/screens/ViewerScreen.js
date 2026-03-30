import React from 'react';
import { View, Button, Text, Dimensions } from 'react-native';
import ImageStream from '../components/ImageStream';
import { useEffect, useState } from 'react';
import { Gyroscope } from 'expo-sensors';

const { width } = Dimensions.get('window');

export default function ViewerScreen({ mode, serverIp, onExit }) {
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    
    useEffect(() => {
        Gyroscope.setUpdateInterval(16);

        const sub = Gyroscope.addListener(data => {
            setRotation(prev => ({
            x: prev.x + data.y * 2,
            y: prev.y + data.x * 2
            }));
        });

        return () => sub.remove();
    }, []);


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
  
            {[0,1].map((_, i) => (
                <View
                key={i}
                style={{
                    width: width / 2,
                    height: '100%',
                    overflow: 'hidden'
                }}
                >
                <View
                    style={{
                    width: '120%',
                    height: '120%',
                    transform: [
                        { translateX: rotation.x },
                        { translateY: rotation.y }
                    ]
                    }}
                >
                    <ImageStream serverIp={serverIp} />
                </View>
                </View>
            ))}

        </View>

        <Button title="Salir" onPress={onExit} />
    </View>
  );
}