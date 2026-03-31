import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Button,
  StatusBar,
  StyleSheet,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ImageStream from '../components/ImageStream';
import { Gyroscope, Accelerometer } from 'expo-sensors';
import * as ScreenOrientation from 'expo-screen-orientation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ViewerScreen({
  mode,
  serverIp,
  onExit,
  ipdOffset,
  initialScale
}) {

  // ==============================
  // 🔹 VR STATE
  // ==============================
  const rawRotation = useRef({ x: 0, y: 0 });
  const [smoothRotation, setSmoothRotation] = useState({ x: 0, y: 0 });
  const [zDistance, setZDistance] = useState(initialScale);

  const resetView = () => {
    rawRotation.current = { x: 0, y: 0 };
    setSmoothRotation({ x: 0, y: 0 });
    setZDistance(initialScale);
  };

  // ==============================
  // 🔹 SENSORES
  // ==============================
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

  // ==============================
  // 🔹 RENDER OJO (VR)
  // ==============================
  const renderEye = (isRightEye) => (
    <View
      style={[
        styles.eyeContainer,
        {
          transform: [
            { translateX: isRightEye ? ipdOffset : -ipdOffset }
          ]
        }
      ]}
    >
      <View
        style={[
          styles.virtualSpace,
          {
            transform: [
              { scale: zDistance },
              { translateX: smoothRotation.y * 10 },
              { translateY: smoothRotation.x * 10 }
            ]
          }
        ]}
      >
        {/* 🔥 GRID (SUELO) */}
        <View style={styles.gridFloor} />

        {/* 🔥 PANTALLA */}
        <View style={styles.streamWindow}>
          <ImageStream serverIp={serverIp} />
        </View>
      </View>

      {/* RETÍCULA */}
      <View style={styles.reticle} />
    </View>
  );

  // ==============================
  // 🔹 MODO FLAT (VR-like)
  // ==============================
  if (mode === 'flat') {
    return (
      <LinearGradient
        colors={['#020202', '#0a0a1a', '#000000']}
        style={{ flex: 1 }}
      >
        <View style={styles.eyeContainer}>

          <View
            style={[
              styles.virtualSpace,
              {
                transform: [
                  { scale: zDistance },
                  { translateX: smoothRotation.y * 8 },
                  { translateY: smoothRotation.x * 8 - 50 }
                ]
              }
            ]}
          >
            <View style={styles.gridFloor} />

            <View style={styles.streamWindow}>
              <ImageStream serverIp={serverIp} />
            </View>
          </View>

          <View style={styles.reticle} />
        </View>

        <View style={styles.controlsOverlay}>
          <Button title="Recentrar" onPress={resetView} color="#444" />
          <Button title="Salir" onPress={onExit} color="#ff5c5c" />
        </View>
      </LinearGradient>
    );
  }

  // ==============================
  // 🔹 MODO VR
  // ==============================
  return (
    <LinearGradient
      colors={['#020202', '#0a0a1a', '#000000']}
      style={{ flex: 1 }}
    >
      <View style={styles.vrLayout}>
        {renderEye(false)}
        <View style={styles.divider} />
        {renderEye(true)}
      </View>

      <View style={styles.controlsOverlay}>
        <Button title="Recentrar" onPress={resetView} color="#444" />
        <Button title="Salir" onPress={onExit} color="#ff5c5c" />
      </View>
    </LinearGradient>
  );
}

// ==============================
// 🎨 ESTILOS
// ==============================
const styles = StyleSheet.create({
  eyeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },

  vrLayout: {
    flex: 1,
    flexDirection: 'row'
  },

  virtualSpace: {
    width: 2000,
    height: 2000,
    justifyContent: 'center',
    alignItems: 'center'
  },

  // 🔥 GRID SUELO
  gridFloor: {
    position: 'absolute',
    width: 2000,
    height: 2000,
    backgroundColor: '#050505',
    borderWidth: 1,
    borderColor: '#111',
    transform: [
      { rotateX: '75deg' },
      { translateY: 600 }
    ]
  },

  // 🔥 PANTALLA CON GLOW
  streamWindow: {
    width: 750,
    height: 422,
    backgroundColor: '#050505',
    elevation: 25,

    shadowColor: '#00aaff',
    shadowOpacity: 0.3,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 }
  },

  reticle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)'
  },

  divider: {
    width: 2,
    height: '100%',
    backgroundColor: '#111'
  },

  controlsOverlay: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 15,
    zIndex: 999
  }
});