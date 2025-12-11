import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-0">
                <div className="text-center">
                    {/* 로고 이미지 */}
                    <div className="flex justify-center mb-4">
                        <img
                            src="/assets/logo2.png"
                            alt="BlackWatch Logo"
                            className="h-50 w-auto"
                        />
                    </div>
                </div>
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;