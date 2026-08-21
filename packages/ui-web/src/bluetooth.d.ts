/**
 * Minimal ambient types for the slice of the Web Bluetooth API this app
 * uses (Chrome/Edge desktop + Android Chrome only -- no official DOM lib
 * ships these yet). Not a full spec implementation.
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API
 */
interface BluetoothRemoteGATTCharacteristic {
  writeValueWithoutResponse(value: BufferSource): Promise<void>;
  writeValue(value: BufferSource): Promise<void>;
}

interface BluetoothRemoteGATTService {
  getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristic>;
}

interface BluetoothRemoteGATTServer {
  readonly connected: boolean;
  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
  getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>;
}

interface BluetoothDevice extends EventTarget {
  readonly name?: string;
  readonly gatt?: BluetoothRemoteGATTServer;
}

interface RequestDeviceOptions {
  filters?: { services?: string[]; name?: string; namePrefix?: string }[];
  optionalServices?: string[];
  acceptAllDevices?: boolean;
}

interface Bluetooth {
  requestDevice(options?: RequestDeviceOptions): Promise<BluetoothDevice>;
}

interface Navigator {
  readonly bluetooth?: Bluetooth;
}
