import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Button,
  Text,
  StatusBar,
  StyleSheet,
  Dimensions,
  PanResponder
} from 'react-native';
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

  // ==============================
  // 🔹 FLAT STATE
  // ==============================
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(initialScale);
  const lastScale = useRef(initialScale);

  // ==============================
  // 🔹 RESET GLOBAL
  // ==============================
  const resetView = () => {
    rawRotation.current = { x: 0, y: 0 };
    setSmoothRotation({ x: 0, y: 0 });
    setZDistance(initialScale);

    setPosition({ x: 0, y: 0 });
    setScale(initialScale);
    lastScale.current = initialScale;
  };

  // ==============================
  // 🔹 SENSORES (VR)
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
  // 🔹 PAN + ZOOM (FLAT)
  // ==============================
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onPanResponderMove: (evt, gestureState) => {

        // 🔹 PAN (1 dedo)
        if (evt.nativeEvent.touches.length === 1) {
          setPosition({
            x: gestureState.dx,
            y: gestureState.dy
          });
        }

        // 🔹 ZOOM (2 dedos)
        if (evt.nativeEvent.touches.length === 2) {
          const touches = evt.nativeEvent.touches;

          const dx = touches[0].pageX - touches[1].pageX;
          const dy = touches[0].pageY - touches[1].pageY;

          const distance = Math.sqrt(dx * dx + dy * dy);

          if (!lastScale.currentDistance) {
            lastScale.currentDistance = distance;
          }

          const diff = distance - lastScale.currentDistance;

          let newScale = lastScale.current + diff * 0.002;
          newScale = Math.max(0.5, Math.min(2, newScale));

          setScale(newScale);
        }
      },

      onPanResponderRelease: () => {
        lastScale.current = scale;
        lastScale.currentDistance = null;
      }
    })
  ).current;

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
        <View style={styles.streamWindow}>
          <ImageStream serverIp={serverIp} />
        </View>
      </View>

      <View style={styles.reticle} />
    </View>
  );

  // ==============================
  // 🔹 MODO FLAT (INTERACTIVO)
  // ==============================
  if (mode === 'flat') {
    return (
      <View style={styles.mainContainer}>

        <View style={styles.eyeContainer}>

          {/* ESPACIO VIRTUAL IGUAL QUE VR */}
          <View
            style={[
              styles.virtualSpace,
              {
                transform: [
                  { scale: zDistance },
                  { translateX: smoothRotation.y * 8 },
                  { translateY: smoothRotation.x * 8 }
                ]
              }
            ]}
          >
            <View style={styles.streamWindow}>
              <ImageStream serverIp={serverIp} />
            </View>
          </View>

          {/* RETÍCULA */}
          <View style={styles.reticle} />

        </View>

        {/* CONTROLES */}
        <View style={styles.controlsOverlay}>
          <Button title="Recentrar" onPress={resetView} color="#444" />
          <Button title="Salir" onPress={onExit} color="#ff5c5c" />
        </View>

      </View>
    );
  }

  // ==============================
  // 🔹 MODO VR
  // ==============================
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

// ==============================
// 🎨 ESTILOS
// ==============================
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'black'
  },

  vrLayout: {
    flex: 1,
    flexDirection: 'row'
  },

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
    elevation: 25
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
  },

  // 🔹 FLAT MODE
  flatContainer: {
    flex: 1,
    backgroundColor: 'black'
  },

  flatTitle: {
    color: 'white',
    position: 'absolute',
    top: 40,
    alignSelf: 'center'
  },

  flatInteractiveArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  flatWindow: {
    width: 800,
    height: 450,
    backgroundColor: '#050505',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20
  }
});