
import React, { useState, useCallback } from 'react';
import type { UserData, Person, Meal } from '../types';
import { ChevronDownIcon } from './common/icons';

interface DailyMealCardProps {
  day: string;
  userData: UserData;
  updateUserData: (data: UserData) => void;
}

// Sub-component for meal editing logic to avoid repetition
interface MealEditorProps {
    day: string;
    mealName: string;
    mealType: 'breakfast' | 'lunch';
    people: Person[];
    mealData: Meal;
    onMealChange: (mealType: 'breakfast' | 'lunch', field: 'cost' | 'attendees', value: number | string[]) => void;
}

const MealEditor: React.FC<MealEditorProps> = ({ day, mealName, mealType, people, mealData, onMealChange }) => {
    const [isAttendeeSelectorOpen, setIsAttendeeSelectorOpen] = useState(false);

    const handleAttendeeToggle = (personId: string) => {
        const newAttendees = mealData.attendees.includes(personId)
            ? mealData.attendees.filter(id => id !== personId)
            : [...mealData.attendees, personId];
        onMealChange(mealType, 'attendees', newAttendees);
    };

    const handleSelectAll = () => {
        const allPersonIds = people.map(p => p.id);
        onMealChange(mealType, 'attendees', allPersonIds);
    };

    const handleDeselectAll = () => {
        onMealChange(mealType, 'attendees', []);
    };

    return (
        <div className="bg-gray-800 p-4 rounded-md">
            <h4 className="text-lg font-medium text-teal-400 mb-3">{mealName}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div>
                    <label htmlFor={`${day}-${mealType}-cost`} className="block text-sm font-medium text-gray-300 mb-1">
                        التكلفة الإجمالية
                    </label>
                    <input
                        id={`${day}-${mealType}-cost`}
                        type="number"
                        step="0.01"
                        value={mealData.cost || ''}
                        onChange={(e) => onMealChange(mealType, 'cost', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-600 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="0.00"
                    />
                </div>
                <div className="relative">
                     <button
                        type="button"
                        onClick={() => setIsAttendeeSelectorOpen(!isAttendeeSelectorOpen)}
                        className="w-full flex justify-between items-center px-3 py-2 border border-gray-600 bg-gray-700 rounded-md text-white"
                        aria-haspopup="listbox"
                        aria-expanded={isAttendeeSelectorOpen}
                    >
                        <span>
                            الحاضرون ({mealData.attendees.length})
                        </span>
                         <ChevronDownIcon className={`h-5 w-5 transition-transform ${isAttendeeSelectorOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isAttendeeSelectorOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                           <div className="p-2 flex justify-between border-b border-gray-700 sticky top-0 bg-gray-900">
                                <button type="button" onClick={handleSelectAll} className="text-xs text-teal-400 hover:text-teal-300">تحديد الكل</button>
                                <button type="button" onClick={handleDeselectAll} className="text-xs text-orange-400 hover:text-orange-300">إلغاء تحديد الكل</button>
                           </div>
                           <ul role="listbox">
                            {people.map(person => (
                                <li key={person.id}
                                    className="p-2 hover:bg-gray-700 cursor-pointer flex items-center"
                                    onClick={() => handleAttendeeToggle(person.id)}
                                    role="option"
                                    aria-selected={mealData.attendees.includes(person.id)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={mealData.attendees.includes(person.id)}
                                        readOnly
                                        className="form-checkbox h-4 w-4 text-teal-600 bg-gray-800 border-gray-600 rounded focus:ring-teal-500 pointer-events-none"
                                        tabIndex={-1}
                                    />
                                    <span className="mr-3">{person.name}</span>
                                </li>
                            ))}
                            {people.length === 0 && <li className="p-2 text-center text-gray-400">لا يوجد أشخاص</li>}
                           </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const DailyMealCard: React.FC<DailyMealCardProps> = ({ day, userData, updateUserData }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { people, schedule } = userData;
  const dayData = schedule[day];

  const handleMealChange = useCallback((mealType: 'breakfast' | 'lunch', field: 'cost' | 'attendees', value: number | string[]) => {
    const newSchedule = JSON.parse(JSON.stringify(schedule)); // Deep copy to avoid mutation issues.
    if (field === 'cost') {
        newSchedule[day][mealType].cost = Number(value) || 0;
    } else {
        newSchedule[day][mealType].attendees = value as string[];
    }
    updateUserData({ ...userData, schedule: newSchedule });
  }, [userData, day, schedule, updateUserData]);

  return (
    <div className="bg-gray-700 rounded-lg shadow-md transition-all duration-300">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center p-4 text-left"
        aria-expanded={isExpanded}
        aria-controls={`${day}-details`}
      >
        <h3 className="text-xl font-semibold text-gray-200">{day}</h3>
        <ChevronDownIcon className={`h-6 w-6 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      {isExpanded && (
        <div id={`${day}-details`} className="p-4 border-t border-gray-600 space-y-4">
          <MealEditor
            day={day}
            mealName="الفطور"
            mealType="breakfast"
            people={people}
            mealData={dayData.breakfast}
            onMealChange={handleMealChange}
          />
          <MealEditor
            day={day}
            mealName="الغداء"
            mealType="lunch"
            people={people}
            mealData={dayData.lunch}
            onMealChange={handleMealChange}
          />
        </div>
      )}
    </div>
  );
};


export default DailyMealCard;
