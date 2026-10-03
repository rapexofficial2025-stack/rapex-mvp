import { useEffect, useState } from "react";
import type { RoleKey } from "./roles";

/**
 * Prototype-only data layer: everything lives in localStorage on this
 * device, shared across every screen in this app (there's no backend --
 * see docs/00_PROJECT_OVERVIEW.md's "business logic never lives in the
 * frontend" rule, which this deliberately doesn't follow since the whole
 * point here is a clickable registration+booking loop to test, not a real
 * implementation).
 */

export type FreelancerProfile = {
  id: string;
  role: RoleKey;
  name: string;
  category: string;
  phone: string;
  createdAt: string;
};

export type BookingStatus = "pending" | "confirmed";

export type Booking = {
  id: string;
  freelancerId: string;
  freelancerName: string;
  freelancerRole: RoleKey;
  bookedByRole: RoleKey;
  customerName: string;
  note: string;
  status: BookingStatus;
  createdAt: string;
};

const FREELANCERS_KEY = "freelancer-app:freelancers";
const BOOKINGS_KEY = "freelancer-app:bookings";

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", notify);
}

function readList<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeList<T>(key: string, list: T[]) {
  localStorage.setItem(key, JSON.stringify(list));
  notify();
}

function useList<T>(key: string): T[] {
  const [items, setItems] = useState<T[]>(() => readList<T>(key));

  useEffect(() => {
    const update = () => setItems(readList<T>(key));
    listeners.add(update);
    update();
    return () => {
      listeners.delete(update);
    };
  }, [key]);

  return items;
}

export function useFreelancers(): FreelancerProfile[] {
  return useList<FreelancerProfile>(FREELANCERS_KEY);
}

export function useBookings(): Booking[] {
  return useList<Booking>(BOOKINGS_KEY);
}

function makeId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function registerFreelancer(input: Omit<FreelancerProfile, "id" | "createdAt">): FreelancerProfile {
  const profile: FreelancerProfile = {
    ...input,
    id: makeId(),
    createdAt: new Date().toISOString(),
  };
  writeList(FREELANCERS_KEY, [...readList<FreelancerProfile>(FREELANCERS_KEY), profile]);
  return profile;
}

export function createBooking(input: Omit<Booking, "id" | "createdAt" | "status">): Booking {
  const booking: Booking = {
    ...input,
    id: makeId(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  writeList(BOOKINGS_KEY, [...readList<Booking>(BOOKINGS_KEY), booking]);
  return booking;
}

export function setBookingStatus(bookingId: string, status: BookingStatus) {
  const list = readList<Booking>(BOOKINGS_KEY).map((booking) => (booking.id === bookingId ? { ...booking, status } : booking));
  writeList(BOOKINGS_KEY, list);
}

export function isRoleRegistered(freelancers: FreelancerProfile[], role: RoleKey): boolean {
  return freelancers.some((freelancer) => freelancer.role === role);
}
