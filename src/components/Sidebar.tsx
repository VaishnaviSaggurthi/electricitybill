import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FilePlus, FileText, User, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  return (
    <aside
      className={`bg-gray-800 text-white w-64 flex-shrink-0 fixed inset-y-0 left-0 z-20 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700 md:hidden">
        <h2 className="text-xl font-bold">PowerBill</h2>
        <button onClick={toggleSidebar} className="text-gray-300 hover:text-white">
          <X size={24} />
        </button>
      </div>
      
      <nav className="p-4 space-y-2">
        <SidebarLink to="/dashboard" icon={<Home size={20} />} label="Dashboard" />
        <SidebarLink to="/generate-bill" icon={<FilePlus size={20} />} label="Generate Bill" />
        <SidebarLink to="/bill-history" icon={<FileText size={20} />} label="Bill History" />
        <SidebarLink to="/profile" icon={<User size={20} />} label="Profile" />
      </nav>
    </aside>
  );
};

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center space-x-2 p-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-700 text-white'
            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

export default Sidebar;