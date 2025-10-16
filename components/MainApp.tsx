import React, { useCallback, useMemo } from 'react';
import { useUserData } from '../hooks/useUserData';
import PeopleManager from './PeopleManager';
import DailyMealCard from './DailyMealCard';
import BalanceSheet from './BalanceSheet';
import { DAYS_OF_WEEK } from '../constants';
import { LogoutIcon } from './common/icons';
import type { CalculatedBalance } from '../types';

interface MainAppProps {
  username: string;
  onLogout: () => void;
}

const MainApp: React.FC<MainAppProps> = ({ username, onLogout }) => {
  const { userData, updateUserData } = useUserData(username);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (userData) {
      updateUserData({ ...userData, title: e.target.value });
    }
  }, [userData, updateUserData]);

  const calculatedBalances: CalculatedBalance[] = useMemo(() => {
    if (!userData) return [];

    const deductions: { [personId: string]: number } = {};

    Object.values(userData.schedule).forEach(dayData => {
      const { breakfast, lunch } = dayData;
      
      if (breakfast.cost > 0 && breakfast.attendees.length > 0) {
        const costPerPerson = breakfast.cost / breakfast.attendees.length;
        breakfast.attendees.forEach(id => {
          deductions[id] = (deductions[id] || 0) + costPerPerson;
        });
      }

      if (lunch.cost > 0 && lunch.attendees.length > 0) {
        const costPerPerson = lunch.cost / lunch.attendees.length;
        lunch.attendees.forEach(id => {
          deductions[id] = (deductions[id] || 0) + costPerPerson;
        });
      }
    });

    return userData.people.map(person => {
      const totalDeductions = deductions[person.id] || 0;
      const finalBalance = person.initialBalance - totalDeductions;
      return {
        ...person,
        totalDeductions,
        finalBalance,
      };
    });
  }, [userData]);


  if (!userData) {
    return <div className="text-center text-xl">جار التحميل...</div>;
  }

  return (
    <div className="container mx-auto max-w-7xl">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <input 
                type="text"
                value={userData.title}
                onChange={handleTitleChange}
                className="text-3xl sm:text-4xl font-bold text-teal-400 bg-transparent border-b-2 border-gray-700 focus:border-teal-500 focus:outline-none p-2 text-center sm:text-right w-full sm:w-auto"
            />
            <div className="flex items-center gap-4">
                <span className="text-gray-400">مرحباً, {username}</span>
                <button 
                    onClick={onLogout}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    aria-label="تسجيل الخروج"
                >
                    <LogoutIcon />
                    <span>خروج</span>
                </button>
            </div>
      </header>

      <main className="space-y-8">
        <PeopleManager 
            userData={userData} 
            updateUserData={updateUserData} 
            calculatedBalances={calculatedBalances}
        />
        
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-teal-400 border-b border-gray-700 pb-2">سجل الوجبات اليومي</h2>
          <div className="space-y-4">
            {DAYS_OF_WEEK.map(day => (
              <DailyMealCard 
                key={day}
                day={day}
                userData={userData}
                updateUserData={updateUserData}
              />
            ))}
          </div>
        </div>

        <BalanceSheet 
            userData={userData} 
            updateUserData={updateUserData}
            calculatedBalances={calculatedBalances} 
        />
      </main>
    </div>
  );
};

export default MainApp;