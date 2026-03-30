import React, { useEffect, useState } from 'react';
import { View, Button, Text, Dimensions } from 'react-native';
import ImageStream from '../components/ImageStream';
import { Gyroscope } from 'expo-sensors';
import * as ScreenOrientation from 'expo-screen-orientation';

const { width } = Dimensions.get('window');

export default function ViewerScreen({ mode, serverIp, onExit }) {

  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const resetView = () => {
    setRotation({ x: 0, y: 0 });
  };

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    Gyroscope.setUpdateInterval(16);

    const sub = Gyroscope.addListener(data => {
      setRotation(prev => {
        let newX = prev.x * 0.9 + data.y * 5;
        let newY = prev.y * 0.9 + data.x * 5;

        newX = Math.max(-120, Math.min(120, newX));
        newY = Math.max(-120, Math.min(120, newY));

        return { x: newX, y: newY };
      });
    });

    return () => {
      sub.remove();
      ScreenOrientation.unlockAsync();
    };
  }, []);

  if (mode === 'flat') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
        
        <Text style={{ color: 'white', position: 'absolute', top: 40 }}>
          Pantalla flotante
        </Text>

        <View style={{ width: '90%', height: '60%', overflow: 'hidden' }}>
          <ImageStream serverIp={serverIp} />
        </View>

        <View style={{ position: 'absolute', bottom: 40 }}>
          <Button title="Salir" onPress={onExit} />
        </View>

      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>

      <View style={{ flex: 1, flexDirection: 'row' }}>
        {[0, 1].map((_, i) => (
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
                width: '100%',   
                height: '100%',
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

      {/* CONTROLES */}
      <View style={{
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        flexDirection: 'row',
        gap: 10
      }}>
        <Button title="Recentrar" onPress={resetView} />
        <Button title="Salir" onPress={onExit} />
      </View>

    </View>
  );
}