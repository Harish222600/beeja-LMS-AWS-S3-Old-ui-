import React from 'react';

const NotificationBadge = ({ count, className = "" }) => {
  if (!count || count === 0) return null;

  return (
    <div className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-caribbeangreen-400 text-richblack-900 text-xs font-bold rounded-full flex items-center justify-center border-2 border-richblack-800 ${className}`}>
      {count > 99 ? '99+' : count}
    </div>
  );
};

export default NotificationBadge;
