import React, { useEffect, useState } from 'react';
import { View, Button, Text, Dimensions, StatusBar, StyleSheet } from 'react-native';
import ImageStream from '../components/ImageStream';
import { Gyroscope, Accelerometer } from 'expo-sensors';
import * as ScreenOrientation from 'expo-screen-orientation';

export default function ViewerScreen({ mode, serverIp, onExit }) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zDistance, setZDistance] = useState(1); // Escala/Distancia (1 = 100%)

  const resetView = () => {
    setRotation({ x: 0, y: 0 });
    setZDistance(1);
  };

  useEffect(() => {
    StatusBar.setHidden(true);
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    Gyroscope.setUpdateInterval(16);
    Accelerometer.setUpdateInterval(16);

    const gyroSub = Gyroscope.addListener(data => {
      setRotation(prev => {
        // CORRECCIÓN DE EJES PARA LANDSCAPE:
        // En modo horizontal:
        // El giro "arriba/abajo" del usuario suele ser data.x
        // El giro "izquierda/derecha" suele ser data.y o data.z dependiendo del dispositivo
        
        const sens = 3.5; 

        return {
          // Ajustamos los signos y mapeamos los ejes según tu descripción:
          // Si giras arriba y se va a la izquierda, invertimos y cambiamos el eje:
          x: Math.max(-100, Math.min(100, prev.x - data.y * sens)), 
          y: prev.y + data.x * sens 
        };
      });
    });

    // --- EXPERIMENTAL: ACERCARSE/ALEJARSE CON ACELERÓMETRO ---
    const accelSub = Accelerometer.addListener(data => {
      // Si el sensor detecta un empuje fuerte hacia adelante (z)
      // Ajustamos la escala para simular profundidad
      if (Math.abs(data.z) > 1.2) {
        setZDistance(prev => {
          const next = prev + (data.z * 0.01);
          return Math.max(0.5, Math.min(1.5, next)); // Límites de zoom
        });
      }
    });

    return () => {
      gyroSub.remove();
      accelSub.remove();
      StatusBar.setHidden(false);
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const renderEye = () => (
    <View style={styles.eyeContainer}>
      <View style={[
        styles.virtualSpace,
        {
          transform: [
            { scale: zDistance }, // Efecto de alejamiento/acercamiento
            { translateX: rotation.y * 10 }, 
            { translateY: rotation.x * 10 }
          ]
        }
      ]}>
        {/* PANTALLA MÁS LEJANA: Bajamos el tamaño base para dar sensación de distancia */}
        <View style={styles.streamWindow}>
          <ImageStream serverIp={serverIp} />
        </View>
      </View>
      <View style={styles.reticle} />
    </View>
  );

  if (mode === 'flat') {
    return (
      <View style={styles.mainContainer}>
        <View style={styles.flatStreamWrapper}>
          <ImageStream serverIp={serverIp} />
        </View>
        <View style={styles.controlsOverlay}>
          <Button title="Salir" onPress={onExit} color="#ff5c5c" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <View style={styles.vrLayout}>
        {renderEye()}
        <View style={styles.divider} />
        {renderEye()}
      </View>

      <View style={styles.controlsOverlay}>
        <Button title="Recentrar" onPress={resetView} color="#444" />
        <Button title="Salir" onPress={onExit} color="#ff5c5c" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' },
  vrLayout: { flex: 1, flexDirection: 'row' },
  eyeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  virtualSpace: { width: 2000, height: 2000, justifyContent: 'center', alignItems: 'center' },
  streamWindow: {
    width: 700,  // Reducido de 900 a 700 para que se vea más lejos por defecto
    height: 393, // Mantiene relación 16:9
    backgroundColor: '#050505',
    elevation: 20,
  },
  reticle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  divider: { width: 2, height: '100%', backgroundColor: '#0a0a0a' },
  flatStreamWrapper: { width: '90%', height: '80%', borderRadius: 10, overflow: 'hidden' },
  controlsOverlay: { position: 'absolute', bottom: 30, flexDirection: 'row', gap: 20, zIndex: 10 }
});