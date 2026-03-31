import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Button,
  StatusBar,
  StyleSheet
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ImageStream from '../components/ImageStream';
import { Gyroscope, Accelerometer } from 'expo-sensors';
import * as ScreenOrientation from 'expo-screen-orientation';

export default function ViewerScreen({
  mode,
  serverIp,
  onExit,
  ipdOffset,
  initialScale
}) {

  // ==============================
  // TRACKING
  // ==============================
  const rawRotation = useRef({ x: 0, y: 0 });
  const [smoothRotation, setSmoothRotation] = useState({ x: 0, y: 0 });
  const [zDistance, setZDistance] = useState(initialScale);

  // ==============================
  // MULTI WINDOWS (FLAT)
  // ==============================
  const [windows, setWindows] = useState([
    { id: 1, x: 0, y: 0, scale: 1 },
    { id: 2, x: 300, y: -100, scale: 0.8 }
  ]);

  const moveWindow = (id, dx, dy) => {
    setWindows(prev =>
      prev.map(w =>
        w.id === id
          ? { ...w, x: w.x + dx, y: w.y + dy }
          : w
      )
    );
  };

  const resetView = () => {
    rawRotation.current = { x: 0, y: 0 };
    setSmoothRotation({ x: 0, y: 0 });
    setZDistance(initialScale);
  };

  // ==============================
  // SENSORES
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

    const loop = setInterval(() => {
      setSmoothRotation(prev => ({
        x: prev.x + (rawRotation.current.x - prev.x) * 0.15,
        y: prev.y + (rawRotation.current.y - prev.y) * 0.15
      }));
    }, 16);

    return () => {
      gyroSub.remove();
      accelSub.remove();
      clearInterval(loop);
      StatusBar.setHidden(false);
      ScreenOrientation.unlockAsync();
    };
  }, []);

  // ==============================
  // TREAM COMPARTIDO (CLAVE)
  // ==============================
  const sharedStream = <ImageStream serverIp={serverIp} />;

  // ==============================
  // VR MODE (SIN LAG)
  // ==============================
  const renderVREye = (isRightEye) => (
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
          {sharedStream}
        </View>
      </View>

      <View style={styles.reticle} />
    </View>
  );

  // ==============================
  // FLAT MODE (MULTI)
  // ==============================
  const renderFlatEye = (isRightEye) => (
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
        {windows.map(win => (
          <View
            key={win.id}
            style={[
              styles.streamWindow,
              {
                transform: [
                  { translateX: win.x },
                  { translateY: win.y },
                  { scale: win.scale }
                ]
              }
            ]}
          >
            {sharedStream}
          </View>
        ))}
      </View>

      <View style={styles.reticle} />
    </View>
  );

  const isVR = mode === 'vr';

  return (
    <LinearGradient
      colors={['#020202', '#0a0a1a', '#000000']}
      style={{ flex: 1 }}
    >
      <View style={styles.vrLayout}>
        {isVR ? renderVREye(false) : renderFlatEye(false)}
        <View style={styles.divider} />
        {isVR ? renderVREye(true) : renderFlatEye(true)}
      </View>

      {!isVR && (
        <View style={styles.controlsOverlay}>
          <Button title="←" onPress={() => moveWindow(1, -50, 0)} />
          <Button title="→" onPress={() => moveWindow(1, 50, 0)} />
          <Button title="↑" onPress={() => moveWindow(1, 0, -50)} />
          <Button title="↓" onPress={() => moveWindow(1, 0, 50)} />
        </View>
      )}

      <View style={styles.controlsOverlayBottom}>
        <Button title="Recentrar" onPress={resetView} color="#444" />
        <Button title="Salir" onPress={onExit} color="#ff5c5c" />
      </View>
    </LinearGradient>
  );
}

// ==============================
//ESTILOS
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

  streamWindow: {
    position: 'absolute',
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
    bottom: 80,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 10
  },

  controlsOverlayBottom: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 15
  }
});