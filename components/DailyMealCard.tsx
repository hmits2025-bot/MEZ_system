import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { UserData, Meal } from '../types';
import { ChevronDownIcon } from './common/icons';

interface DailyMealCardProps {
  day: string;
  userData: UserData;
  updateUserData: (data: UserData) => void;
}

const AttendeeSelector: React.FC<{
  people: UserData['people'];
  selectedAttendees: string[];
  onChange: (newAttendees: string[]) => void;
}> = ({ people, selectedAttendees, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleToggleAttendee = (personId: string) => {
    const newAttendees = selectedAttendees.includes(personId)
      ? selectedAttendees.filter(id => id !== personId)
      : [...selectedAttendees, personId];
    onChange(newAttendees);
  };

  const handleSelectAll = () => {
    if (selectedAttendees.length === people.length) {
      onChange([]);
    } else {
      onChange(people.map(p => p.id));
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);
  
  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center px-3 py-2 border border-gray-600 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        <span>
          {selectedAttendees.length > 0 ? `${selectedAttendees.length} أشخاص محددين` : 'اختر المشاركين'}
        </span>
        <ChevronDownIcon />
      </button>
      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-gray-900 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <ul>
            <li className="p-2 border-b border-gray-700">
                <label className="flex items-center space-x-2 cursor-pointer w-full">
                  <input
                    type="checkbox"
                    checked={selectedAttendees.length === people.length && people.length > 0}
                    onChange={handleSelectAll}
                    className="form-checkbox h-5 w-5 text-teal-600 bg-gray-800 border-gray-600 rounded focus:ring-teal-500"
                  />
                  <span>تحديد الكل</span>
                </label>
            </li>
            {people.map(person => (
              <li key={person.id} className="p-2 hover:bg-gray-700">
                <label className="flex items-center space-x-2 cursor-pointer w-full">
                  <input
                    type="checkbox"
                    checked={selectedAttendees.includes(person.id)}
                    onChange={() => handleToggleAttendee(person.id)}
                    className="form-checkbox h-5 w-5 text-teal-600 bg-gray-800 border-gray-600 rounded focus:ring-teal-500"
                  />
                  <span>{person.name}</span>
                </label>
              </li>
            ))}
             {people.length === 0 && (
                <li className="p-3 text-center text-gray-500">
                    الرجاء إضافة أشخاص أولاً.
                </li>
             )}
          </ul>
        </div>
      )}
    </div>
  );
};


const DailyMealCard: React.FC<DailyMealCardProps> = ({ day, userData, updateUserData }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const dayData = userData.schedule[day];

  const handleMealChange = useCallback((
    mealType: 'breakfast' | 'lunch',
    field: 'cost' | 'attendees',
    value: number | string[]
  ) => {
    const newUserData = JSON.parse(JSON.stringify(userData)); // Deep copy
    const mealToUpdate = newUserData.schedule[day][mealType] as Meal;
    
    if (field === 'cost') {
        mealToUpdate.cost = (value as number);
    } else {
        mealToUpdate.attendees = value as string[];
    }
    
    updateUserData(newUserData);
  }, [userData, updateUserData, day]);

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
      <button
        className="w-full flex justify-between items-center p-4 bg-gray-800 hover:bg-gray-700 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-xl font-semibold text-teal-300">{day}</h3>
        <ChevronDownIcon
          className={`h-6 w-6 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Breakfast Section */}
          <div className="space-y-3">
            <h4 className="text-lg font-medium text-gray-300">الفطور</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  التكلفة
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={dayData.breakfast.cost}
                  onChange={(e) => handleMealChange('breakfast', 'cost', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  المشاركون
                </label>
                <AttendeeSelector
                  people={userData.people}
                  selectedAttendees={dayData.breakfast.attendees}
                  onChange={(newAttendees) => handleMealChange('breakfast', 'attendees', newAttendees)}
                />
              </div>
            </div>
          </div>
          {/* Lunch Section */}
          <div className="space-y-3">
            <h4 className="text-lg font-medium text-gray-300">الغداء</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  التكلفة
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={dayData.lunch.cost}
                  onChange={(e) => handleMealChange('lunch', 'cost', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  المشاركون
                </label>
                <AttendeeSelector
                  people={userData.people}
                  selectedAttendees={dayData.lunch.attendees}
                  onChange={(newAttendees) => handleMealChange('lunch', 'attendees', newAttendees)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyMealCard;