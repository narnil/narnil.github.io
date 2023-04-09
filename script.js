async function connectToDevice() {
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: "Polar OH1" }],
      optionalServices: ["heart_rate"]
    });
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService("heart_rate");
    const characteristic = await service.getCharacteristic("heart_rate_measurement");
    characteristic.addEventListener("characteristicvaluechanged", handleData);
    await characteristic.startNotifications();
  } catch (error) {
    const connectButton = document.getElementById('connectButton');
    connectButton.textContent = 'Connect';
    connectButton.disabled = false;
    console.error(error);
  }
}

function handleData(event) {
  const value = event.target.value;
  const flags = value.getUint8(0);
  const rate16Bits = flags & 0x1;
  const result = {};
  let index = 1;
  if (rate16Bits) {
      result.heartRate = value.getUint16(index, true);
      index += 2;
  } else {
      result.heartRate = value.getUint8(index);
      index += 1;
  }

  const heartRateDisplay = document.getElementById('heartRateDisplay');
  heartRateDisplay.textContent = result.heartRate;

  heartRate = result.heartRate;
  console.log("Heart rate:", result.heartRate);
}

function checkHeartRate() {
  if (heartRate < range.value.lower) {
    alertLow.play();
    console.log(`Heart rate is below minimum (${range.value.lower})`);
  } else if (heartRate > range.value.upper) {
    alertHigh.play();
    console.log(`Heart rate is above maximum (${range.value.upper})`);
  }
}

const connectButton = document.getElementById("connectButton");
connectButton.addEventListener("click", async function() {
    connectButton.disabled = true;
    connectButton.textContent = 'Connecting';
    await connectToDevice();
    connectButton.textContent = 'Connected';
    setInterval(checkHeartRate, 5000);
});

const volumeSlider = document.querySelector("#volumeSlider");
volumeSlider.addEventListener('ionChange', function() {
  const volume = parseFloat(volumeSlider.value);
  alertLow.volume = volume/100;
  alertHigh.volume = volume/100;
});

let heartRate = 80;
const alertLow = new Audio('assets/low.mp3');
const alertHigh = new Audio('assets/high.mp3');

const range = document.querySelector("#heartRateSlider");
range.value = {
  lower: 60,
  upper: 140,
};
