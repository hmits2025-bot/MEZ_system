
import React, { useState, useCallback } from 'react';
import type { UserData, Person, CalculatedBalance } from '../types';
import Modal from './common/Modal';
import { UserAddIcon, TrashIcon } from './common/icons';

interface PeopleManagerProps {
  userData: UserData;
  updateUserData: (data: UserData) => void;
  calculatedBalances: CalculatedBalance[];
}

const PeopleManager: React.FC<PeopleManagerProps> = ({ userData, updateUserData, calculatedBalances }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonBalance, setNewPersonBalance] = useState('');

  const handleAddPerson = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (newPersonName.trim() === '') {
      alert('الرجاء إدخال اسم الشخص.');
      return;
    }
    const balance = parseFloat(newPersonBalance) || 0;

    const newPerson: Person = {
      id: `person_${new Date().getTime()}`,
      name: newPersonName.trim(),
      initialBalance: balance,
    };

    updateUserData({
      ...userData,
      people: [...userData.people, newPerson],
    });

    setNewPersonName('');
    setNewPersonBalance('');
    setIsModalOpen(false);
  }, [userData, updateUserData, newPersonName, newPersonBalance]);

  const handleRemovePerson = useCallback((personId: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الشخص؟ سيتم إزالته من جميع الوجبات أيضًا.')) {
      const updatedPeople = userData.people.filter(p => p.id !== personId);
      
      const updatedSchedule = { ...userData.schedule };
      Object.keys(updatedSchedule).forEach(day => {
        updatedSchedule[day].breakfast.attendees = updatedSchedule[day].breakfast.attendees.filter(id => id !== personId);
        updatedSchedule[day].lunch.attendees = updatedSchedule[day].lunch.attendees.filter(id => id !== personId);
      });

      updateUserData({
        ...userData,
        people: updatedPeople,
        schedule: updatedSchedule,
      });
    }
  }, [userData, updateUserData]);

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
        <h2 className="text-2xl font-bold text-teal-400">الأشخاص</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          <UserAddIcon />
          <span>إضافة شخص</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="border-b-2 border-gray-600">
            <tr>
              <th className="p-3 text-lg">الاسم</th>
              <th className="p-3 text-lg">الرصيد الابتدائي</th>
              <th className="p-3 text-lg">إجمالي الخصومات</th>
              <th className="p-3 text-lg">الرصيد النهائي</th>
              <th className="p-3 text-lg text-center">حذف</th>
            </tr>
          </thead>
          <tbody>
            {calculatedBalances.map(person => (
              <tr key={person.id} className="border-b border-gray-700 last:border-b-0">
                <td className="p-3 font-semibold">{person.name}</td>
                <td className="p-3 font-mono text-lg text-blue-400">{person.initialBalance.toFixed(2)}</td>
                <td className="p-3 font-mono text-lg text-orange-400">{person.totalDeductions.toFixed(2)}</td>
                <td className={`p-3 font-mono text-lg ${person.finalBalance < 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {person.finalBalance.toFixed(2)}
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => handleRemovePerson(person.id)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                    aria-label={`حذف ${person.name}`}
                  >
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            ))}
            {userData.people.length === 0 && (
                <tr>
                    <td colSpan={5} className="text-center p-6 text-gray-400">
                        لم تتم إضافة أي شخص حتى الآن.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إضافة شخص جديد">
        <form onSubmit={handleAddPerson} className="space-y-4">
          <div>
            <label htmlFor="person-name" className="block text-sm font-medium text-gray-300 mb-1">
              اسم الشخص
            </label>
            <input
              id="person-name"
              type="text"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          <div>
            <label htmlFor="initial-balance" className="block text-sm font-medium text-gray-300 mb-1">
              الرصيد الابتدائي
            </label>
            <input
              id="initial-balance"
              type="number"
              step="0.01"
              value={newPersonBalance}
              onChange={(e) => setNewPersonBalance(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="0.00"
            />
          </div>
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="mr-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-colors"
            >
              إضافة
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PeopleManager;
