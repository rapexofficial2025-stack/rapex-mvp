export type MockRiderStatus = "online" | "delivering" | "offline";
export type MockVehicle = "Motorcycle" | "Bike" | "Car";

export type MockRider = {
  id: string;
  name: string;
  avatar: string;
  vehicle: MockVehicle;
  distanceKm: number;
  status: MockRiderStatus;
  pickupEtaMinutes: number;
};

export const NEARBY_RIDERS_MOCK: MockRider[] = [
  { id: "rd-1", name: "Mark Santos", avatar: "🏍️", vehicle: "Motorcycle", distanceKm: 0.6, status: "online", pickupEtaMinutes: 4 },
  { id: "rd-2", name: "Jenny Reyes", avatar: "🏍️", vehicle: "Motorcycle", distanceKm: 1.1, status: "online", pickupEtaMinutes: 6 },
  { id: "rd-3", name: "Paolo Cruz", avatar: "🚲", vehicle: "Bike", distanceKm: 1.4, status: "delivering", pickupEtaMinutes: 12 },
  { id: "rd-4", name: "Liza Ramos", avatar: "🏍️", vehicle: "Motorcycle", distanceKm: 2.2, status: "offline", pickupEtaMinutes: 18 },
  { id: "rd-5", name: "Carlo Bautista", avatar: "🚗", vehicle: "Car", distanceKm: 2.8, status: "online", pickupEtaMinutes: 9 },
];
