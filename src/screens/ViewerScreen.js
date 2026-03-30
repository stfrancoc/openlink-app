import React, { useEffect, useState, useRef } from 'react';
import { View, Button, Text, StatusBar, StyleSheet, Dimensions } from 'react-native';
import ImageStream from '../components/ImageStream';
import { Gyroscope, Accelerometer } from 'expo-sensors';
import * as ScreenOrientation from 'expo-screen-orientation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ViewerScreen({ mode, serverIp, onExit, ipdOffset, initialScale }) {
  const rawRotation = useRef({ x: 0, y: 0 });
  const [smoothRotation, setSmoothRotation] = useState({ x: 0, y: 0 });
  const [zDistance, setZDistance] = useState(initialScale);

  const resetView = () => {
    rawRotation.current = { x: 0, y: 0 };
    setSmoothRotation({ x: 0, y: 0 });
    setZDistance(initialScale);
  };

  useEffect(() => {
    StatusBar.setHidden(true);
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    Gyroscope.setUpdateInterval(16);
    Accelerometer.setUpdateInterval(16);

    const gyroSub = Gyroscope.addListener(data => {
      const sens = 3.5;
      rawRotation.current = {
        x: Math.max(-100, Math.min(100, rawRotation.current.x - data.y * sens)),
        y: rawRotation.current.y + data.x * sens
      };
    });

    const accelSub = Accelerometer.addListener(data => {
      if (Math.abs(data.z) > 1.2) {
        setZDistance(prev => {
          const next = prev + (data.z * 0.01);
          return Math.max(0.5, Math.min(1.5, next));
        });
      }
    });

    const animationFrame = setInterval(() => {
      setSmoothRotation(prev => ({
        x: prev.x + (rawRotation.current.x - prev.x) * 0.15,
        y: prev.y + (rawRotation.current.y - prev.y) * 0.15
      }));
    }, 16);

    return () => {
      gyroSub.remove();
      accelSub.remove();
      clearInterval(animationFrame);
      StatusBar.setHidden(false);
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const renderEye = (isRightEye) => (
    <View style={[
      styles.eyeContainer, 
      { 
        transform: [{ translateX: isRightEye ? ipdOffset : -ipdOffset }] 
      }
    ]}>
      {/* ESPACIO VIRTUAL*/}
      <View style={[
        styles.virtualSpace,
        {
          transform: [
            { scale: zDistance },
            { translateX: smoothRotation.y * 10 },
            { translateY: smoothRotation.x * 10 }
          ]
        }
      ]}>
        <View style={styles.streamWindow}>
          <ImageStream serverIp={serverIp} />
        </View>
      </View>
      {/* La retícula se mueve con el ojo para mantener la referencia central */}
      <View style={styles.reticle} />
    </View>
  );

  // --- MODO PANTALLA FLOTANTE 
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
          <Button title="Salir" onPress={onExit} color="#ff5c5c" />
        </View>
      </View>
    );
  }

  // --- MODO VR ---
  return (
    <View style={styles.mainContainer}>
      <View style={styles.vrLayout}>
        {renderEye(false)}
        <View style={styles.divider} />
        {renderEye(true)}
      </View>

      <View style={styles.controlsOverlay}>
        <Button title="Recentrar" onPress={resetView} color="#444" />
        <Button title="Salir" onPress={onExit} color="#ff5c5c" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: 'black' },
  vrLayout: { flex: 1, flexDirection: 'row' },
  eyeContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    overflow: 'hidden',
    backgroundColor: 'black' 
  },
  virtualSpace: { 
    width: 2000, 
    height: 2000, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  streamWindow: {
    width: 750,
    height: 422,
    backgroundColor: '#050505',
    elevation: 25,
  },
  reticle: { 
    position: 'absolute', 
    width: 6, 
    height: 6, 
    borderRadius: 3, 
    backgroundColor: 'rgba(255, 255, 255, 0.3)' 
  },
  controlsOverlay: { 
    position: 'absolute', 
    bottom: 30, 
    alignSelf: 'center', 
    flexDirection: 'row', 
    gap: 15, 
    zIndex: 999 
  },
  divider: { 
    width: 2, 
    height: '100%', 
    backgroundColor: '#111',
    zIndex: 10 
  }
});