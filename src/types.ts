export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastActivity?: string;
  createdAt?: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  submittedBy: string;
  userId?: string;
  location: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  date: string;
  createdAt?: string;
}

export interface ParkingSession {
  id: string;
  userId: string;
  facilityId: string;
  facilityName: string;
  startTime: string;
  endTime?: string;
  duration?: string;
  price?: string;
  status: 'ACTIVE' | 'COMPLETED';
}

export interface Facility {
  id: string;
  name: string;
  location: string;
  totalSlots: number;
  availableSlots: number;
  pricePerHour: number;
  status: 'OPEN' | 'CLOSED' | 'FULL';
}

export interface StatData {
  utilization: number;
  availableSlots: number;
  activeSessions: number;
  dailyIncidents: number;
  avgResponse: string;
  satisfiedRate: string;
}

export interface Report {
  id: string;
  userId: string;
  userName: string;
  location: string;
  status: 'available' | 'full' | 'incorrect';
  notes: string;
  createdAt: string;
}

