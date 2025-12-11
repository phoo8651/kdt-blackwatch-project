import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

const RootLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Outlet />
            <Toaster position="top-right" />
        </div>
    );
};

export default RootLayout;