
import { useState, useEffect, useCallback } from 'react';
import type { UserData, DailySchedule, Person } from '../types';
import { DAYS_OF_WEEK } from '../constants';

const getInitialSchedule = (): DailySchedule => {
  return DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = {
      breakfast: { cost: 0, attendees: [] },
      lunch: { cost: 0, attendees: [] },
    };
    return acc;
  }, {} as DailySchedule);
};

const getInitialData = (): UserData => ({
  title: 'تقرير الوجبات الأسبوعي',
  people: [],
  schedule: getInitialSchedule(),
  lastReset: new Date().toISOString(),
});

const getCairoTime = (): Date => {
  const now = new Date();
  // Cairo is UTC+2. We'll simulate this by adding 2 hours to UTC time.
  // This is a simplification and doesn't account for DST, but is sufficient here.
  const cairoDate = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  return cairoDate;
};


const needsWeeklyReset = (lastResetISO: string): boolean => {
  const cairoNow = getCairoTime();
  const lastResetDate = new Date(lastResetISO);

  // Find the last Saturday at 3 AM in Cairo time
  const lastSaturday3AM = new Date(cairoNow);
  lastSaturday3AM.setUTCHours(1, 0, 0, 0); // 3 AM Cairo is 1 AM UTC
  const dayOfWeek = lastSaturday3AM.getUTCDay(); // Sunday is 0, Saturday is 6
  const diff = (dayOfWeek < 6) ? dayOfWeek + 1 : dayOfWeek - 6;
  lastSaturday3AM.setUTCDate(lastSaturday3AM.getUTCDate() - diff);
  
  if (lastSaturday3AM > cairoNow) {
     lastSaturday3AM.setUTCDate(lastSaturday3AM.getUTCDate() - 7);
  }

  return lastResetDate < lastSaturday3AM;
};


export const useUserData = (username: string) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const storageKey = `meal_tracker_data_${username}`;

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(storageKey);
      let data: UserData = storedData ? JSON.parse(storedData) : getInitialData();
      
      if (needsWeeklyReset(data.lastReset)) {
        console.log("Weekly reset triggered.");
        data.schedule = getInitialSchedule();
        data.lastReset = new Date().toISOString();
        localStorage.setItem(storageKey, JSON.stringify(data));
      }
      
      setUserData(data);
    } catch (error) {
      console.error("Failed to load or parse user data:", error);
      setUserData(getInitialData());
    }
  }, [storageKey]);

  const updateUserData = useCallback((newUserData: UserData) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(newUserData));
      setUserData(newUserData);
    } catch (error) {
      console.error("Failed to save user data:", error);
    }
  }, [storageKey]);

  return { userData, updateUserData };
};
   