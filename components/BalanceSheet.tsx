import React from 'react';
import type { UserData, CalculatedBalance } from '../types';
import { CheckCircleIcon } from './common/icons';

interface BalanceSheetProps {
  userData: UserData;
  updateUserData: (data: UserData) => void;
  calculatedBalances: CalculatedBalance[];
}

const BalanceSheet: React.FC<BalanceSheetProps> = ({ userData, updateUserData, calculatedBalances }) => {

  const handleSettleAccount = (personId: string) => {
    const personToSettle = calculatedBalances.find(p => p.id === personId);
    if (!personToSettle || personToSettle.finalBalance >= 0) {
      // Should not happen as the button is not rendered, but as a safeguard.
      alert(`${personToSettle?.name || 'الشخص'} ليس لديه رصيد سالب لتسويته.`);
      return;
    };
    
    const amountToSettle = -personToSettle.finalBalance;
    const confirmationMessage = `سيتم إضافة ${amountToSettle.toFixed(2)} إلى رصيد ${personToSettle.name} لتسوية حسابه وجعل الرصيد صفراً. هل أنت متأكد؟`;

    if (window.confirm(confirmationMessage)) {
        const updatedPeople = userData.people.map(p =>
            p.id === personId
            // Add the settlement amount to the initial balance.
            // This makes the new final balance equal to zero.
            ? { ...p, initialBalance: p.initialBalance + amountToSettle }
            : p
        );
        updateUserData({ ...userData, people: updatedPeople });
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-teal-400 border-b border-gray-700 pb-2">كشف الحساب</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="border-b-2 border-gray-600">
            <tr>
              <th className="p-3 text-lg">الاسم</th>
              <th className="p-3 text-lg">الرصيد الحالي</th>
              <th className="p-3 text-lg text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {calculatedBalances.map(person => (
              <tr key={person.id} className="border-b border-gray-700 last:border-b-0">
                <td className="p-3 font-semibold">{person.name}</td>
                <td className={`p-3 font-mono text-lg ${person.finalBalance < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    <div className="flex items-center gap-2 justify-end">
                        {person.finalBalance < 0 && <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>}
                        {person.finalBalance.toFixed(2)}
                    </div>
                </td>
                <td className="p-3 text-center">
                    {person.finalBalance < 0 && (
                        <button 
                            onClick={() => handleSettleAccount(person.id)}
                            className="flex items-center justify-center gap-2 mx-auto bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded-lg text-sm transition-colors"
                        >
                           <CheckCircleIcon />
                            <span>تسوية الحساب</span>
                        </button>
                    )}
                </td>
              </tr>
            ))}
            {calculatedBalances.length === 0 && (
                <tr>
                    <td colSpan={3} className="text-center p-6 text-gray-400">
                        لا يوجد أشخاص لعرض حساباتهم.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BalanceSheet;
