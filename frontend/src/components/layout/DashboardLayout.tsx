import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, role, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate('/auth/signin');
    };

    const navigation = [
        { name: 'Main Page', href: '/dashboard', current: location.pathname === '/dashboard' },
        { name: '취약점 데이터', href: '/data/vulnerability', current: location.pathname.startsWith('/data/vulnerability') },
        { name: '개인정보 유출 조회', href: '/data/personal-search', current: location.pathname === '/data/personal-search' },
    ];

    if (role === 'CONTRIBUTOR' || role === 'ADMIN') {
        navigation.push(
            { name: '기여자 신청', href: '/contribution/apply', current: location.pathname === '/contribution/apply' },
            { name: '세션 관리', href: '/contribution/sessions', current: location.pathname === '/contribution/sessions' }
        );
    } else {
        navigation.push(
            { name: '기여자 신청', href: '/contribution/apply', current: location.pathname === '/contribution/apply' }
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                <div className="relative flex flex-col w-full max-w-xs bg-white">
                    <div className="flex items-center justify-between h-16 px-4 bg-gray-900">
                        <span className="text-white font-semibold">BlackWatch</span>
                        <button onClick={() => setSidebarOpen(false)} className="text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <nav className="flex-1 px-4 py-4 space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                                    item.current
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
                <div className="flex flex-col flex-grow bg-white shadow-lg">
                    <div className="flex items-center h-16 px-12 bg-white">
                        <img
                            src="/assets/logo.png"
                            alt="BlackWatch Logo"
                            className="h-10 w-auto"
                        />
                    </div>
                    <nav className="flex-1 px-4 py-4 space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                                    item.current
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main content */}
            <div className="md:pl-64">
                {/* Top navbar */}
                <div className="sticky top-0 z-10 bg-white shadow">
                    <div className="flex items-center justify-between h-16 px-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden text-gray-600 hover:text-gray-900"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-700">
                                {user?.username}님 ({role})
                            </div>
                            <div className="relative flex items-center space-x-2">
                                <Link
                                    to="/dashboard/profile"
                                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    프로필
                                </Link>
                                <Link
                                    to="/dashboard/settings"
                                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    설정
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-red-600 hover:text-red-900 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    로그아웃
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="flex-1">
                    <div className="p-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;