
export type UserRole = 'ADMIN' | 'HADPANAGALA' | 'WALIPITIYA';

export interface User {
  id: string;
  username: string;
  role: UserRole;
}

export type PlantType = 'BIM' | 'BADUN'; // බිම් / බදුන්

export interface Announcement {
  id: string;
  date: string;
  announcementNo: string;
  receiptNo: string;
  plantType: PlantType;
  journalPrice: string;
  quantity: number;
  program: string;
  cdoDivision: string;
  gnDivision: string;
  nursery: string;
  receivedReceipts: number;
  issuedCount: number;
  isOtherNursery: boolean;
}

export interface SettingsData {
  cdoDivisions: string[];
  gnDivisions: string[];
  programs: string[];
  otherNurseries: string[];
  journalPrices: { id: string; price: string; description: string }[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
