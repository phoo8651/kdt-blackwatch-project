import { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../api/services';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
    const { user, setUser, role } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        leakedDataCount: 0,
        vulnerabilityCount: 0,
        lastUpdate: new Date().toISOString(),
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (!user) {
                    const userData = await api.account.getMyAccount();
                    setUser(userData);
                }
                // TODO: Fetch dashboard stats from API
                setStats({
                    leakedDataCount: 1234,
                    vulnerabilityCount: 567,
                    lastUpdate: new Date().toISOString(),
                });
            } catch (error: any) {
                toast.error('데이터를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user, setUser]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
                <p className="mt-2 text-gray-600">
                    안녕하세요, {user?.username}님! ({role})
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        유출 데이터
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {stats.leakedDataCount.toLocaleString()}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        취약점 데이터
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {stats.vulnerabilityCount.toLocaleString()}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        마지막 업데이트
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {new Date(stats.lastUpdate).toLocaleDateString()}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        바로가기
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <a
                            href="/data/leaked"
                            className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg border border-gray-300 hover:border-gray-400"
                        >
                            <div>
                <span className="rounded-lg inline-flex p-3 bg-red-50 text-red-700 ring-4 ring-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </span>
                            </div>
                            <div className="mt-8">
                                <h3 className="text-lg font-medium">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    유출 데이터 조회
                                </h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    최신 데이터 유출 정보를 확인하세요
                                </p>
                            </div>
                        </a>

                        <a
                            href="/data/vulnerability"
                            className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg border border-gray-300 hover:border-gray-400"
                        >
                            <div>
                <span className="rounded-lg inline-flex p-3 bg-yellow-50 text-yellow-700 ring-4 ring-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </span>
                            </div>
                            <div className="mt-8">
                                <h3 className="text-lg font-medium">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    취약점 정보
                                </h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    최신 보안 취약점 정보를 확인하세요
                                </p>
                            </div>
                        </a>

                        <a
                            href="/data/personal-search"
                            className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg border border-gray-300 hover:border-gray-400"
                        >
                            <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                            </div>
                            <div className="mt-8">
                                <h3 className="text-lg font-medium">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    유출된 개인정보 검색
                                </h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    개인정보 유출 여부를 확인하세요
                                </p>
                            </div>
                        </a>

                        {(role === 'CONTRIBUTOR' || role === 'ADMIN') && (
                            <a
                                href="/contribution/apply"
                                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg border border-gray-300 hover:border-gray-400"
                            >
                                <div>
                  <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </span>
                                </div>
                                <div className="mt-8">
                                    <h3 className="text-lg font-medium">
                                        <span className="absolute inset-0" aria-hidden="true" />
                                        기여자 신청
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500">
                                        새로운 보안 데이터를 제출하세요
                                    </p>
                                </div>
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        최근 활동
                    </h3>
                    <div className="flow-root">
                        <ul className="-mb-8">
                            <li>
                                <div className="relative pb-8">
                                    <div className="relative flex space-x-3">
                                        <div>
                      <span className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center ring-8 ring-white">
                        <svg className="h-5 w-5 text-white" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </span>
                                        </div>
                                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    새로운 데이터 유출이 감지되었습니다. <span className="font-medium text-gray-900">example.com</span>
                                                </p>
                                            </div>
                                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                <time dateTime="2024-01-20">2시간 전</time>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div className="relative pb-8">
                                    <div className="relative flex space-x-3">
                                        <div>
                      <span className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center ring-8 ring-white">
                        <svg className="h-5 w-5 text-white" fill="currentColor">
                          <path fillRule="evenodd" d="M13 10V3L4 14h7v7l9-11h-7z" clipRule="evenodd" />
                        </svg>
                      </span>
                                        </div>
                                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    새로운 CVE가 등록되었습니다. <span className="font-medium text-gray-900">CVE-2024-0001</span>
                                                </p>
                                            </div>
                                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                <time dateTime="2024-01-20">4시간 전</time>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;