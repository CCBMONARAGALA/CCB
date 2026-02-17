
import { Announcement, SettingsData } from './types';

const ANNOUNCEMENTS_KEY = 'cpds_announcements';
const SETTINGS_KEY = 'cpds_settings';

export const db = {
  getAnnouncements: (): Announcement[] => {
    const data = localStorage.getItem(ANNOUNCEMENTS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  saveAnnouncements: (data: Announcement[]) => {
    localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(data));
  },

  getSettings: (): SettingsData => {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : {
      cdoDivisions: ['Colombo North', 'Colombo South'],
      gnDivisions: ['Division 01', 'Division 02'],
      programs: ['Standard Program', 'Special Subsidy'],
      otherNurseries: ['Nursery A', 'Nursery B'],
      journalPrices: [{ id: '1', price: '500.00', description: 'Standard Price' }]
    };
  },

  saveSettings: (data: SettingsData) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
  },

  addAnnouncement: (ann: Omit<Announcement, 'id' | 'receivedReceipts'>) => {
    const list = db.getAnnouncements();
    const newAnn: Announcement = {
      ...ann,
      id: Math.random().toString(36).substr(2, 9),
      receivedReceipts: 0,
      issuedCount: ann.issuedCount || 0
    };
    list.push(newAnn);
    db.saveAnnouncements(list);
    return newAnn;
  },

  updateAnnouncement: (updatedAnn: Announcement) => {
    const list = db.getAnnouncements();
    const index = list.findIndex(a => a.id === updatedAnn.id);
    if (index !== -1) {
      list[index] = updatedAnn;
      db.saveAnnouncements(list);
      return true;
    }
    return false;
  },

  deleteAnnouncement: (id: string) => {
    const list = db.getAnnouncements();
    const newList = list.filter(a => a.id !== id);
    db.saveAnnouncements(newList);
    return true;
  },

  updateReceipts: (annNo: string, count: number, isOther: boolean) => {
    const list = db.getAnnouncements();
    const index = list.findIndex(a => a.announcementNo === annNo && a.isOtherNursery === isOther);
    if (index !== -1) {
      list[index].receivedReceipts = count;
      db.saveAnnouncements(list);
      return true;
    }
    return false;
  },

  updateIssuedPlants: (annNo: string, additionalCount: number) => {
    const list = db.getAnnouncements();
    const index = list.findIndex(a => a.announcementNo === annNo);
    if (index !== -1) {
      list[index].issuedCount += additionalCount;
      db.saveAnnouncements(list);
      return list[index];
    }
    return null;
  }
};
