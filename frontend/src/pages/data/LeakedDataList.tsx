import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { api } from '../../api/services';
import { LeakedDataDocument, LeakedDataSearchParams, PaginatedResponse } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const LeakedDataList = () => {
    const [data, setData] = useState<PaginatedResponse<LeakedDataDocument> | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useState<LeakedDataSearchParams>({
        page: 0,
        limit: 20,
        sort: '-createdAt',
    });

    useEffect(() => {
        fetchData();
    }, [searchParams]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.data.getLeakedData(searchParams);
            setData(response);
        } catch (error: any) {
            toast.error('데이터를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">유출 데이터</h1>
                <p className="mt-2 text-gray-600">최신 데이터 유출 정보를 확인하세요.</p>
            </div>

            {/* Search & Filters */}
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        type="text"
                        placeholder="제목 검색..."
                        className="px-3 py-2 border border-gray-300 rounded-md"
                        onChange={(e) => setSearchParams(prev => ({ ...prev, titleContains: e.target.value, page: 0 }))}
                    />
                    <input
                        type="text"
                        placeholder="호스트 검색..."
                        className="px-3 py-2 border border-gray-300 rounded-md"
                        onChange={(e) => setSearchParams(prev => ({ ...prev, host: e.target.value, page: 0 }))}
                    />
                    <select
                        className="px-3 py-2 border border-gray-300 rounded-md"
                        onChange={(e) => setSearchParams(prev => ({ ...prev, sort: e.target.value, page: 0 }))}
                    >
                        <option value="-createdAt">최신순</option>
                        <option value="createdAt">오래된순</option>
                        <option value="-recordsCount">레코드 수 높은순</option>
                    </select>
                </div>
            </div>

            {/* Data List */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                제목
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                호스트
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                유출 유형
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                레코드 수
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                업로드 날짜
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {data?.content.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Link
                                        to={`/data/leaked/${item.id}`}
                                        className="text-blue-600 hover:text-blue-900 font-medium"
                                    >
                                        {item.title || 'N/A'}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {item.host || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {item.leakType || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {item.recordsCount?.toLocaleString() || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.uploadDate ? new Date(item.uploadDate).toLocaleDateString() : 'N/A'}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {data && data.totalPages > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setSearchParams(prev => ({ ...prev, page: Math.max(0, prev.page! - 1) }))}
                                disabled={data.first}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                이전
                            </button>
                            <button
                                onClick={() => setSearchParams(prev => ({ ...prev, page: prev.page! + 1 }))}
                                disabled={data.last}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                다음
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    <span className="font-medium">{data.totalElements}</span>개 중{' '}
                                    <span className="font-medium">{data.number * data.size + 1}</span>-
                                    <span className="font-medium">
                    {Math.min((data.number + 1) * data.size, data.totalElements)}
                  </span>개 표시
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    <button
                                        onClick={() => setSearchParams(prev => ({ ...prev, page: Math.max(0, prev.page! - 1) }))}
                                        disabled={data.first}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        이전
                                    </button>
                                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    {data.number + 1} / {data.totalPages}
                  </span>
                                    <button
                                        onClick={() => setSearchParams(prev => ({ ...prev, page: prev.page! + 1 }))}
                                        disabled={data.last}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        다음
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeakedDataList;