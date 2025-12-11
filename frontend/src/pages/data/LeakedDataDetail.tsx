import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { api } from '../../api/services';
import { LeakedDataDocument } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const LeakedDataDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<LeakedDataDocument | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchData(id);
        }
    }, [id]);

    const fetchData = async (dataId: string) => {
        try {
            setLoading(true);
            const response = await api.data.getLeakedDataDetail(dataId);
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

    if (!data) {
        return (
            <div className="text-center">
                <p className="text-gray-500">데이터를 찾을 수 없습니다.</p>
                <Link to="/data/leaked" className="text-blue-600 hover:text-blue-500">
                    목록으로 돌아가기
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">유출 데이터 상세</h1>
                <Link
                    to="/data/leaked"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                    목록으로
                </Link>
            </div>

            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">제목</dt>
                            <dd className="mt-1 text-sm text-gray-900">{data.title}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">호스트</dt>
                            <dd className="mt-1 text-sm text-gray-900">{data.host}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">경로</dt>
                            <dd className="mt-1 text-sm text-gray-900">{data.path}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">작성자</dt>
                            <dd className="mt-1 text-sm text-gray-900">{data.author}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">유출 유형</dt>
                            <dd className="mt-1 text-sm text-gray-900">{data.leakType}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">레코드 수</dt>
                            <dd className="mt-1 text-sm text-gray-900">{data.recordsCount?.toLocaleString()}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">업로드 날짜</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {new Date(data.uploadDate).toLocaleString()}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">생성 날짜</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {new Date(data.createdAt).toLocaleString()}
                            </dd>
                        </div>
                        {data.price && (
                            <div>
                                <dt className="text-sm font-medium text-gray-500">가격</dt>
                                <dd className="mt-1 text-sm text-gray-900">{data.price}</dd>
                            </div>
                        )}
                        {data.iocs && (
                            <div>
                                <dt className="text-sm font-medium text-gray-500">IOCs</dt>
                                <dd className="mt-1 text-sm text-gray-900">{data.iocs}</dd>
                            </div>
                        )}
                    </dl>

                    {data.article && (
                        <div className="mt-6">
                            <dt className="text-sm font-medium text-gray-500 mb-2">내용</dt>
                            <dd className="text-sm text-gray-900 bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
                                {data.article}
                            </dd>
                        </div>
                    )}

                    {data.ref && data.ref.length > 0 && (
                        <div className="mt-6">
                            <dt className="text-sm font-medium text-gray-500 mb-2">참조</dt>
                            <dd className="text-sm text-gray-900">
                                <ul className="list-disc list-inside space-y-1">
                                    {data.ref.map((ref, index) => (
                                        <li key={index}>
                                            <a href={ref} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">
                                                {ref}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </dd>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeakedDataDetail;