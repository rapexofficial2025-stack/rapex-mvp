/// <reference path="./bluetooth.d.ts" />
import { useCallback, useRef, useState } from "react";
import { buildReceiptEscPos, type PrintableReceipt } from "@rapex/utils";

// UUIDs used by common cheap ESC/POS BLE thermal printers (58mm/80mm
// "Goojprt"/"MPT" clones widely sold to Philippine merchants). Some
// printers use a different vendor UUID, so connect() falls back to
// accepting any nearby device if this filtered scan finds nothing.
const PRINTER_SERVICE_UUID = "000018f0-0000-1000-8000-00805f9b34fb";
const PRINTER_CHARACTERISTIC_UUID = "00002af1-0000-1000-8000-00805f9b34fb";
const WRITE_CHUNK_SIZE = 100;

export type BluetoothPrinterState = {
  supported: boolean;
  connected: boolean;
  deviceName: string | null;
  connecting: boolean;
  printing: boolean;
  error: string | null;
  connect: () => Promise<void>;
  print: (receipt: PrintableReceipt) => Promise<void>;
  disconnect: () => void;
};

/** Connects to and prints on a real ESC/POS Bluetooth thermal printer via the browser's Web Bluetooth API (Chrome/Edge only). */
export function useBluetoothPrinter(): BluetoothPrinterState {
  const supported = typeof navigator !== "undefined" && "bluetooth" in navigator && !!navigator.bluetooth;
  const [connected, setConnected] = useState(false);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const characteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);

  const connect = useCallback(async () => {
    if (!supported || !navigator.bluetooth) {
      setError("This browser doesn't support Bluetooth printing. Use Chrome or Edge on desktop or Android.");
      return;
    }
    setConnecting(true);
    setError(null);
    try {
      const bluetooth = navigator.bluetooth;
      const device = await bluetooth
        .requestDevice({ filters: [{ services: [PRINTER_SERVICE_UUID] }], optionalServices: [PRINTER_SERVICE_UUID] })
        .catch(() => bluetooth.requestDevice({ acceptAllDevices: true, optionalServices: [PRINTER_SERVICE_UUID] }));

      const server = await device.gatt?.connect();
      const service = await server?.getPrimaryService(PRINTER_SERVICE_UUID);
      const characteristic = await service?.getCharacteristic(PRINTER_CHARACTERISTIC_UUID);
      if (!characteristic) throw new Error("Connected, but this printer doesn't expose the expected print service.");

      characteristicRef.current = characteristic;
      setDeviceName(device.name ?? "Bluetooth printer");
      setConnected(true);
      device.addEventListener("gattserverdisconnected", () => {
        characteristicRef.current = null;
        setConnected(false);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect to a Bluetooth printer.");
    } finally {
      setConnecting(false);
    }
  }, [supported]);

  const print = useCallback(async (receipt: PrintableReceipt) => {
    if (!characteristicRef.current) {
      setError("Connect a Bluetooth printer first.");
      return;
    }
    setPrinting(true);
    setError(null);
    try {
      const bytes = buildReceiptEscPos(receipt);
      for (let offset = 0; offset < bytes.length; offset += WRITE_CHUNK_SIZE) {
        await characteristicRef.current.writeValueWithoutResponse(bytes.slice(offset, offset + WRITE_CHUNK_SIZE));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Print failed. Check the printer is powered on and in range.");
    } finally {
      setPrinting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    characteristicRef.current = null;
    setConnected(false);
    setDeviceName(null);
  }, []);

  return { supported, connected, deviceName, connecting, printing, error, connect, print, disconnect };
}
