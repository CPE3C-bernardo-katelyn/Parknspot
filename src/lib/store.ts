import type { User, Complaint, ParkingSession, Facility, StatData, Report } from '../types';

// Initial mock data
const initialUsers: User[] = [
  { id: '1', name: 'Julian Vane-Tempest', email: 'julian.vane@sovereign.arch', status: 'ACTIVE', lastActivity: 'Just now', createdAt: '2022-10-01' },
  { id: '2', name: 'Elena Thorne', email: 'elena.thorne@curator.io', status: 'ACTIVE', lastActivity: '5 mins ago', createdAt: '2023-01-15' },
  { id: '3', name: 'Marcus Webb', email: 'marcus.webb@facility.net', status: 'INACTIVE', lastActivity: '2 days ago', createdAt: '2023-03-20' },
  { id: '4', name: 'Sophia Chen', email: 'sophia.chen@parkspot.com', status: 'ACTIVE', lastActivity: '1 hour ago', createdAt: '2023-06-10' },
  { id: '5', name: 'Alexander Reid', email: 'alex.reid@sovereign.arch', status: 'ACTIVE', lastActivity: '30 mins ago', createdAt: '2023-08-05' },
];

const initialComplaints: Complaint[] = [
  { id: '1001', title: 'Faulty Gate Sensor', description: 'The entry gate sensor at Wing A is malfunctioning and not detecting vehicles properly.', submittedBy: 'Julian Vane-Tempest', userId: '1', location: 'Wing A - Entry', status: 'PENDING', date: '2024-05-12', createdAt: '2024-05-12T10:30:00' },
  { id: '1002', title: 'Poor Lighting', description: 'Level B2 has several broken lights making it unsafe at night.', submittedBy: 'Elena Thorne', userId: '2', location: 'Level B2', status: 'IN_PROGRESS', date: '2024-05-10', createdAt: '2024-05-10T14:20:00' },
  { id: '1003', title: 'Payment Machine Error', description: 'The payment kiosk near exit C keeps rejecting cards.', submittedBy: 'Sophia Chen', userId: '4', location: 'Exit C', status: 'RESOLVED', date: '2024-05-08', createdAt: '2024-05-08T09:15:00' },
  { id: '1004', title: 'Signage Issue', description: 'Directional signs on Level 3 are confusing and outdated.', submittedBy: 'Alexander Reid', userId: '5', location: 'Level 3', status: 'PENDING', date: '2024-05-11', createdAt: '2024-05-11T16:45:00' },
];

const initialFacilities: Facility[] = [
  { id: 'f1', name: 'The Grand Pavilion - Wing A', location: 'Central District', totalSlots: 200, availableSlots: 45, pricePerHour: 5, status: 'OPEN' },
  { id: 'f2', name: 'East Plaza Underground', location: 'East Side', totalSlots: 150, availableSlots: 12, pricePerHour: 4, status: 'OPEN' },
  { id: 'f3', name: 'Observation Deck North', location: 'North Wing', totalSlots: 80, availableSlots: 0, pricePerHour: 8, status: 'FULL' },
  { id: 'f4', name: 'The Atrium - Level 4', location: 'West Tower', totalSlots: 120, availableSlots: 67, pricePerHour: 6, status: 'OPEN' },
];

const initialSessions: ParkingSession[] = [
  { id: 's1', userId: '1', facilityId: 'f1', facilityName: 'Central Plaza Valet', startTime: '2024-05-12T08:00:00', endTime: '2024-05-12T11:15:00', duration: '3 Hours 15 Minutes', price: '$45.00', status: 'COMPLETED' },
  { id: 's2', userId: '1', facilityId: 'f2', facilityName: 'The Glass House', startTime: '2024-05-10T20:00:00', endTime: '2024-05-11T08:00:00', duration: 'Overnight Stay', price: '$120.00', status: 'COMPLETED' },
  { id: 's3', userId: '1', facilityId: 'f4', facilityName: 'South Wing Bay', startTime: '2024-05-08T14:00:00', endTime: '2024-05-08T15:40:00', duration: '1 Hour 40 Minutes', price: '$22.00', status: 'COMPLETED' },
];

const initialReports: Report[] = [];

// In-memory store with localStorage persistence
class DataStore {
  private users: User[] = [];
  private complaints: Complaint[] = [];
  private facilities: Facility[] = [];
  private sessions: ParkingSession[] = [];
  private reports: Report[] = [];
  private currentUser: User | null = null;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedUsers = localStorage.getItem('parkspot_users');
      const storedComplaints = localStorage.getItem('parkspot_complaints');
      const storedFacilities = localStorage.getItem('parkspot_facilities');
      const storedSessions = localStorage.getItem('parkspot_sessions');
      const storedReports = localStorage.getItem('parkspot_reports');
      const storedCurrentUser = localStorage.getItem('parkspot_current_user');

      this.users = storedUsers ? JSON.parse(storedUsers) : initialUsers;
      this.complaints = storedComplaints ? JSON.parse(storedComplaints) : initialComplaints;
      this.facilities = storedFacilities ? JSON.parse(storedFacilities) : initialFacilities;
      this.sessions = storedSessions ? JSON.parse(storedSessions) : initialSessions;
      this.reports = storedReports ? JSON.parse(storedReports) : initialReports;
      this.currentUser = storedCurrentUser ? JSON.parse(storedCurrentUser) : null;
    } catch {
      this.users = initialUsers;
      this.complaints = initialComplaints;
      this.facilities = initialFacilities;
      this.sessions = initialSessions;
      this.reports = initialReports;
    }
  }

  private saveToStorage() {
    localStorage.setItem('parkspot_users', JSON.stringify(this.users));
    localStorage.setItem('parkspot_complaints', JSON.stringify(this.complaints));
    localStorage.setItem('parkspot_facilities', JSON.stringify(this.facilities));
    localStorage.setItem('parkspot_sessions', JSON.stringify(this.sessions));
    localStorage.setItem('parkspot_reports', JSON.stringify(this.reports));
    if (this.currentUser) {
      localStorage.setItem('parkspot_current_user', JSON.stringify(this.currentUser));
    }
    // Dispatch event for cross-component updates
    window.dispatchEvent(new Event('data-change'));
  }

  // User methods
  getUsers(): User[] {
    return [...this.users];
  }

  getUser(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  addUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      lastActivity: 'Just now'
    };
    this.users.push(newUser);
    this.saveToStorage();
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updates };
      this.saveToStorage();
      return this.users[index];
    }
    return undefined;
  }

  deleteUser(id: string): boolean {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Current user (logged in user)
  setCurrentUser(user: User | null) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem('parkspot_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('parkspot_current_user');
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Complaint methods
  getComplaints(): Complaint[] {
    return [...this.complaints];
  }

  getComplaint(id: string): Complaint | undefined {
    return this.complaints.find(c => c.id === id);
  }

  addComplaint(complaint: Omit<Complaint, 'id' | 'createdAt' | 'date'>): Complaint {
    const newComplaint: Complaint = {
      ...complaint,
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-CA'),
      createdAt: new Date().toISOString()
    };
    this.complaints.push(newComplaint);
    this.saveToStorage();
    return newComplaint;
  }

  updateComplaintStatus(id: string, status: Complaint['status']): Complaint | undefined {
    const index = this.complaints.findIndex(c => c.id === id);
    if (index !== -1) {
      this.complaints[index].status = status;
      this.saveToStorage();
      return this.complaints[index];
    }
    return undefined;
  }

  // Facility methods
  getFacilities(): Facility[] {
    return [...this.facilities];
  }

  getFacility(id: string): Facility | undefined {
    return this.facilities.find(f => f.id === id);
  }

  updateFacility(id: string, updates: Partial<Facility>): Facility | undefined {
    const index = this.facilities.findIndex(f => f.id === id);
    if (index !== -1) {
      this.facilities[index] = { ...this.facilities[index], ...updates };
      this.saveToStorage();
      return this.facilities[index];
    }
    return undefined;
  }

  // Session methods
  getSessions(userId?: string): ParkingSession[] {
    if (userId) {
      return this.sessions.filter(s => s.userId === userId);
    }
    return [...this.sessions];
  }

  addSession(session: Omit<ParkingSession, 'id'>): ParkingSession {
    const newSession: ParkingSession = {
      ...session,
      id: Date.now().toString()
    };
    this.sessions.push(newSession);
    this.saveToStorage();
    return newSession;
  }

  // Report methods
  getReports(): Report[] {
    return [...this.reports];
  }

  addReport(report: Omit<Report, 'id' | 'createdAt'>): Report {
    const newReport: Report = {
      ...report,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    this.reports.push(newReport);
    this.saveToStorage();
    return newReport;
  }

  // Stats
  getStats(): StatData {
    const totalSlots = this.facilities.reduce((sum, f) => sum + f.totalSlots, 0);
    const availableSlots = this.facilities.reduce((sum, f) => sum + f.availableSlots, 0);
    const utilization = totalSlots > 0 ? Math.round(((totalSlots - availableSlots) / totalSlots) * 100) : 0;
    const activeSessions = this.sessions.filter(s => s.status === 'ACTIVE').length + this.users.filter(u => u.status === 'ACTIVE').length;
    const pendingComplaints = this.complaints.filter(c => c.status === 'PENDING').length;

    return {
      utilization,
      availableSlots,
      activeSessions,
      dailyIncidents: pendingComplaints,
      avgResponse: '1.4h',
      satisfiedRate: '94%'
    };
  }

  // Login/Register helpers
  loginUser(email: string, _password: string): User | null {
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      this.updateUser(user.id, { lastActivity: 'Just now', status: 'ACTIVE' });
      this.setCurrentUser(user);
      return user;
    }
    return null;
  }

  registerUser(name: string, email: string, _password: string): User {
    const newUser = this.addUser({ name, email, status: 'ACTIVE' });
    this.setCurrentUser(newUser);
    return newUser;
  }
}

// Singleton instance
export const store = new DataStore();
