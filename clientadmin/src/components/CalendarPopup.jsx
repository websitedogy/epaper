import { useState, useEffect, useRef } from "react";
import { epaperAPI } from "../services/api";

const CalendarPopup = ({ onClose, onDateSelect, buttonRef }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [month, setMonth] = useState(currentDate.getMonth());
  const [year, setYear] = useState(currentDate.getFullYear());
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [checkingDate, setCheckingDate] = useState(null); // Track which date is being checked
  const calendarRef = useRef(null);

  // Position the calendar below the button
  useEffect(() => {
    const updatePosition = () => {
      const isMobile = window.innerWidth < 768;
      
      if (buttonRef.current && calendarRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const calendarRect = calendarRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        if (isMobile) {
          // Mobile: position as bottom sheet
          setPosition({ 
            position: 'fixed',
            top: 'auto',
            bottom: 0,
            left: 0,
            right: 0,
            width: '100%',
            maxWidth: 'none',
            zIndex: 9999
          });
        } else {
          // Desktop: position below the button with improved alignment
          let top = buttonRect.bottom + 5; // Small offset from button
          let left = buttonRect.left;
          
          // Center the calendar under the button
          const buttonCenter = buttonRect.left + (buttonRect.width / 2);
          const calendarWidth = Math.min(calendarRect.width, 320); // Max width 320px
          left = buttonCenter - (calendarWidth / 2);

          // Adjust for right edge
          if (left + calendarWidth > viewportWidth) {
            left = viewportWidth - calendarWidth - 10;
          }

          // Adjust for left edge
          if (left < 10) {
            left = 10;
          }

          // Adjust for bottom edge (show above button if not enough space below)
          if (top + calendarRect.height > viewportHeight && buttonRect.top > calendarRect.height) {
            top = buttonRect.top - calendarRect.height - 5;
          }

          // Ensure it doesn't go off screen
          top = Math.max(10, top);

          setPosition({ 
            position: 'fixed',
            top: `${top}px`, 
            left: `${left}px`,
            width: `${Math.min(calendarWidth, viewportWidth - 20)}px`,
            maxWidth: '320px',
            zIndex: 9999
          });
        }
      }
    };

    // Use requestAnimationFrame to ensure DOM is fully rendered
    const frameId = requestAnimationFrame(updatePosition);
    window.addEventListener('resize', updatePosition);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', updatePosition);
    };
  }, [buttonRef]);
  // Handle clicks outside the calendar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        calendarRef.current && 
        !calendarRef.current.contains(event.target) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, buttonRef]);

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
    return date <= today;
  };

  // Check if an e-paper exists for a given date
  const checkEpaperAvailability = async (day, month, year) => {
    try {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      setCheckingDate(dateStr);
      const response = await epaperAPI.checkEpaperByDate(dateStr);
      setCheckingDate(null);
      
      return response.exists;
    } catch (error) {
      console.error("Error checking epaper availability:", error);
      setCheckingDate(null);
      return false;
    }
  };

  // Handle date selection
  const handleDateClick = async (day) => {
    if (!isPastDate(day, month, year)) {
      return; // Don't allow future dates
    }
    
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    try {
      const isAvailable = await checkEpaperAvailability(day, month, year);
      
      if (isAvailable) {
        const selected = new Date(year, month, day);
        setSelectedDate(selected);
        onDateSelect(selected);
        onClose();
      } else {
        alert("E-Paper is not available for this date.");
      }
    } catch (error) {
      console.error("Error handling date click:", error);
      alert("Error checking E-Paper availability. Please try again.");
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
    <div 
      ref={calendarRef}
      className={`bg-white rounded-lg shadow-lg border border-gray-200 ${window.innerWidth < 768 ? 'animate-slide-up' : 'animate-fade-in'}`}
      style={{
        ...position,
        minWidth: '280px',
        borderRadius: window.innerWidth < 768 ? '12px 12px 0 0' : '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}
    >      <div className="p-2 bg-yellow-200 text-black font-bold">
        CALENDAR
      </div>
      {/* Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-gray-800">Select Date</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Month and Year Selectors */}
        <div className="flex space-x-2">
          <select
            value={month}
            onChange={handleMonthChange}
            className="flex-1 p-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Select month"
          >
            {monthNames.map((name, index) => (
              <option key={`month-${index}`} value={index}>{name.substring(0, 3)}</option>
            ))}
          </select>
          
          <select
            value={year}
            onChange={handleYearChange}
            className="flex-1 p-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Select year"
          >
            {yearOptions.map((yearOption, index) => (
              <option key={index} value={yearOption}>{yearOption}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="p-3">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div key={index} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="h-8"></div>;
            }
            
            const isCurrentDay = isToday(day, month, year);
            const isPast = isPastDate(day, month, year);
            const isChecking = checkingDate === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = selectedDate && 
              selectedDate.getDate() === day && 
              selectedDate.getMonth() === month && 
              selectedDate.getFullYear() === year;
            
            return (
              <button
                key={`day-${year}-${month}-${day}`}
                onClick={() => handleDateClick(day)}
                disabled={!isPast || isChecking}
                className={`
                  h-8 rounded text-xs font-medium transition-all duration-150 flex items-center justify-center
                  ${isCurrentDay 
                    ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300' 
                    : isSelected 
                      ? 'bg-blue-50 text-blue-600' 
                      : isPast && !isChecking
                        ? 'text-gray-700 hover:bg-gray-100' 
                        : isChecking
                          ? 'bg-gray-100 text-gray-400 cursor-wait'
                          : 'text-gray-400 cursor-not-allowed'
                  }
                  ${isPast && !isChecking ? 'cursor-pointer' : ''}
                  focus:outline-none focus:ring-1 focus:ring-blue-500
                `}
                aria-label={isChecking ? `Checking availability for ${day} ${monthNames[month]} ${year}` : `Select date ${day} ${monthNames[month]} ${year}`}
              >
                {isChecking ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  day
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-2 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500">
          <span className="inline-block w-2 h-2 bg-blue-100 rounded-full mr-1 border border-blue-300"></span>
          Today
        </p>
      </div>
      
      {/* Animation styles */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.15s ease-out forwards;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CalendarPopup;