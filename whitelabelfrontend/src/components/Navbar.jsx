const Navbar = ({ onMenuClick, onLogout }) => {
  return (
    <nav className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-gray-900 text-white border-b border-gray-700 z-30 flex items-center justify-between px-4 lg:px-6 shadow-lg">
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
      <div className="flex items-center space-x-3 lg:space-x-4">
        <div className="flex items-center space-x-2 bg-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-semibold text-sm">A</span>
          </div>
          <span className="text-gray-200 text-sm font-medium hidden sm:block">
            Admin
          </span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          title="Logout"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
