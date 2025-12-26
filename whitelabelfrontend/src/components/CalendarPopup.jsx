import { useState, useEffect } from "react";

const CalendarPopup = ({ onClose, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [month, setMonth] = useState(currentDate.getMonth());
  const [year, setYear] = useState(currentDate.getFullYear());

  // Get the number of days in a month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  // Check if a date is today
  const isToday = (day, month, year) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  // Check if a date is in the past
  const isPastDate = (day, month, year) => {
    const date = new Date(year, month, day);
    const today = new Date();
    return date < today;
  };

  // Check if an e-paper exists for a given date (demo implementation)
  const isEpaperAvailable = (day, month, year) => {
    // For demo purposes, let's say e-papers are available for the last 30 days
    const date = new Date(year, month, day);
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    return date >= thirtyDaysAgo && date <= today;
  };

  // Handle date selection
  const handleDateClick = (day) => {
    if (!isPastDate(day, month, year)) return; // Don't allow future dates
    
    if (isEpaperAvailable(day, month, year)) {
      const selected = new Date(year, month, day);
      setSelectedDate(selected);
      onDateSelect(selected);
      onClose();
    } else {
      alert("E-Paper not available for this date");
    }
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(month, year);
    const firstDayOfMonth = getFirstDayOfMonth(month, year);
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  // Handle month change
  const handleMonthChange = (e) => {
    setMonth(parseInt(e.target.value));
  };

  // Handle year change
  const handleYearChange = (e) => {
    setYear(parseInt(e.target.value));
  };

  // Get month names
  const getMonthNames = () => {
    return [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
  };

  // Get year options (last 5 years to next year)
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      years.push(i);
    }
    return years;
  };

  const monthNames = getMonthNames();
  const yearOptions = getYearOptions();
  const calendarDays = generateCalendarDays();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Select Archive Date</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Month and Year Selectors */}
          <div className="flex space-x-2">
            <select
              value={month}
              onChange={handleMonthChange}
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Select month"
            >
              {monthNames.map((name, index) => (
                <option key={index} value={index}>{name}</option>
              ))}
            </select>
            
            <select
              value={year}
              onChange={handleYearChange}
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Select year"
            >
              {yearOptions.map((yearOption) => (
                <option key={yearOption} value={yearOption}>{yearOption}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="p-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={index} className="h-10"></div>;
              }
              
              const isCurrentDay = isToday(day, month, year);
              const isPast = isPastDate(day, month, year);
              const isAvailable = isEpaperAvailable(day, month, year);
              const isSelected = selectedDate && 
                selectedDate.getDate() === day && 
                selectedDate.getMonth() === month && 
                selectedDate.getFullYear() === year;
              
              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(day)}
                  disabled={!isPast || !isAvailable}
                  className={`
                    h-10 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center
                    ${isCurrentDay 
                      ? 'bg-blue-500 text-white ring-2 ring-blue-300' 
                      : isSelected 
                        ? 'bg-blue-100 text-blue-700' 
                        : isPast && isAvailable 
                          ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900' 
                          : 'text-gray-400 cursor-not-allowed'
                    }
                    ${isPast && isAvailable ? 'cursor-pointer' : ''}
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                  `}
                  aria-label={`Select date ${day} ${monthNames[month]} ${year}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
            Today's date
          </p>
        </div>
      </div>
      
      {/* Animation styles */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CalendarPopup;