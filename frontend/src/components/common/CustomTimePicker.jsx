import { useState, useEffect } from 'react';

const CustomTimePicker = ({ selectedTime, onChange, className }) => {
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [ampm, setAmpm] = useState('AM');

  // Generate hour options (1-12)
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // Generate minute options (0, 30)
  const minutes = [0, 30];

  useEffect(() => {
    if (selectedTime) {
      const date = new Date(selectedTime);
      let hours = date.getHours();
      const mins = date.getMinutes();
      const period = hours >= 12 ? 'PM' : 'AM';
      
      // Convert to 12-hour format
      if (hours === 0) hours = 12;
      else if (hours > 12) hours -= 12;
      
      setHour(hours);
      setMinute(mins);
      setAmpm(period);
    }
  }, [selectedTime]);

  const handleTimeChange = (newHour, newMinute, newAmpm) => {
    const date = new Date(selectedTime || new Date());
    
    // Convert to 24-hour format
    let hour24 = newHour;
    if (newAmpm === 'PM' && newHour !== 12) {
      hour24 += 12;
    } else if (newAmpm === 'AM' && newHour === 12) {
      hour24 = 0;
    }
    
    date.setHours(hour24, newMinute, 0, 0);
    onChange(date);
  };

  const handleHourChange = (newHour) => {
    setHour(newHour);
    handleTimeChange(newHour, minute, ampm);
  };

  const handleMinuteChange = (newMinute) => {
    setMinute(newMinute);
    handleTimeChange(hour, newMinute, ampm);
  };

  const handleAmpmChange = (newAmpm) => {
    setAmpm(newAmpm);
    handleTimeChange(hour, minute, newAmpm);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      {/* Hour Selector */}
      <div className="flex-1">
        <label className="block text-xs font-medium text-richblack-300 mb-1">Hour</label>
        <select
          value={hour}
          onChange={(e) => handleHourChange(parseInt(e.target.value))}
          className="w-full px-3 py-2 bg-richblack-600 border border-richblack-500 rounded-lg text-richblack-5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
        >
          {hours.map((h) => (
            <option key={h} value={h}>
              {h.toString().padStart(2, '0')}
            </option>
          ))}
        </select>
      </div>

      {/* Minute Selector */}
      <div className="flex-1">
        <label className="block text-xs font-medium text-richblack-300 mb-1">Min</label>
        <select
          value={minute}
          onChange={(e) => handleMinuteChange(parseInt(e.target.value))}
          className="w-full px-3 py-2 bg-richblack-600 border border-richblack-500 rounded-lg text-richblack-5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
        >
          {minutes.map((m) => (
            <option key={m} value={m}>
              {m.toString().padStart(2, '0')}
            </option>
          ))}
        </select>
      </div>

      {/* AM/PM Selector */}
      <div className="flex-1">
        <label className="block text-xs font-medium text-richblack-300 mb-1">Period</label>
        <select
          value={ampm}
          onChange={(e) => handleAmpmChange(e.target.value)}
          className="w-full px-3 py-2 bg-richblack-600 border border-richblack-500 rounded-lg text-richblack-5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );
};

export default CustomTimePicker;
