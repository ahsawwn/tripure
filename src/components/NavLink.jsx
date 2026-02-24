import React from 'react';
import { Link } from 'react-router-dom';

const NavLink = ({ to, active = false, mobile = false, children }) => {
  const baseClasses = mobile 
    ? 'block px-3 py-2 text-base font-medium rounded-md transition-colors duration-200'
    : 'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200';

  const activeClasses = active
    ? mobile
      ? 'bg-blue-600 text-white'
      : 'text-blue-600 bg-blue-50'
    : mobile
      ? 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50';

  return (
    <Link 
      to={to} 
      className={`${baseClasses} ${activeClasses}`}
    >
      {children}
    </Link>
  );
};

export default NavLink;