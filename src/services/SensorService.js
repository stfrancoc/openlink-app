import { Accelerometer, Gyroscope } from 'expo-sensors';
import { Buffer } from 'buffer';

export const startSensorStream = (socket, serverIp) => {
  let accelData = { x: 0, y: 0, z: 0 };
  let gyroData = { x: 0, y: 0, z: 0 };

  Accelerometer.setUpdateInterval(10);
  Gyroscope.setUpdateInterval(10);

  const accelSub = Accelerometer.addListener(data => {
    accelData = data;
  });

  const gyroSub = Gyroscope.addListener(data => {
    gyroData = data;
  });

  const interval = setInterval(() => {
    const message = {
      deviceId: "phone_1",
      type: "imu",
      data: {
        acceleration: accelData,
        gyroscope: gyroData
      },
      timestamp: Date.now()
    };

    const buf = Buffer.from(JSON.stringify(message));
    socket.send(buf, 0, buf.length, 5005, serverIp);

  }, 16);

  return () => {
    accelSub.remove();
    gyroSub.remove();
    clearInterval(interval);
  };
};