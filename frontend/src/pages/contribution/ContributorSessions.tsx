import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { mongoSessionService } from '../../api/mongoSessionService';
import {
    MongoSessionInfoDto,
    ContributorSessionDto
} from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ContributorSessions = () => {
    const { role } = useAuthStore();
    const [sessions, setSessions] = useState<ContributorSessionDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newSession, setNewSession] = useState<MongoSessionInfoDto | null>(null);
    const [showConnectionInfo, setShowConnectionInfo] = useState(false);

    // 세션 목록 조회
    const fetchSessions = useCallback(async () => {
        try {
            setLoading(true);
            const response = await mongoSessionService.getMySessions();
            setSessions(response);
        } catch (error: any) {
            toast.error('세션 목록을 불러오는데 실패했습니다.');
            console.error('Failed to fetch sessions:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // 새 세션 생성
    const createSession = async () => {
        try {
            setCreating(true);
            const response = await mongoSessionService.createSession();
            setNewSession(response);
            setShowConnectionInfo(true);
            await fetchSessions();
            toast.success('MongoDB 세션이 생성되었습니다.');
        } catch (error: any) {
            const message = error.response?.data?.message || '세션 생성에 실패했습니다.';
            toast.error(message);
        } finally {
            setCreating(false);
        }
    };

    // 세션 연장
    const extendSession = async (sessionId: string, hours: number = 24) => {
        try {
            await mongoSessionService.extendSession(sessionId, { additionalHours: hours });
            await fetchSessions();
            toast.success(`세션이 ${hours}시간 연장되었습니다.`);
        } catch (error: any) {
            const message = error.response?.data?.message || '세션 연장에 실패했습니다.';
            toast.error(message);
        }
    };

    // 세션 삭제
    const deleteSession = async (sessionId: string) => {
        if (!confirm('정말로 이 세션을 삭제하시겠습니까?')) {
            return;
        }

        try {
            await mongoSessionService.deleteSession(sessionId);
            await fetchSessions();
            toast.success('세션이 삭제되었습니다.');
        } catch (error: any) {
            const message = error.response?.data?.message || '세션 삭제에 실패했습니다.';
            toast.error(message);
        }
    };

    // 모든 세션 삭제
    const deleteAllSessions = async () => {
        if (!confirm('정말로 모든 세션을 삭제하시겠습니까?')) {
            return;
        }

        try {
            await mongoSessionService.deleteAllSessions();
            await fetchSessions();
            toast.success('모든 세션이 삭제되었습니다.');
        } catch (error: any) {
            const message = error.response?.data?.message || '세션 삭제에 실패했습니다.';
            toast.error(message);
        }
    };

    // 남은 시간 계산
    const getRemainingTime = (expiresAt: string) => {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diffMs = expiry.getTime() - now.getTime();

        if (diffMs <= 0) return '만료됨';

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}시간 ${minutes}분`;
        }
        return `${minutes}분`;
    };

    // 세션 상태 확인
    const getSessionStatus = (expiresAt: string) => {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diffMs = expiry.getTime() - now.getTime();
        const diffMinutes = diffMs / (1000 * 60);

        if (diffMs <= 0) return { status: 'expired', color: 'bg-red-100 text-red-800' };
        if (diffMinutes <= 30) return { status: 'expiring', color: 'bg-yellow-100 text-yellow-800' };
        return { status: 'active', color: 'bg-green-100 text-green-800' };
    };

    // 연결 정보 복사
    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`${label}이(가) 클립보드에 복사되었습니다.`);
        }).catch(() => {
            toast.error('복사에 실패했습니다.');
        });
    };

    useEffect(() => {
        if (role === 'CONTRIBUTOR' || role === 'ADMIN') {
            fetchSessions();
        }
    }, [role, fetchSessions]);

    // 권한 체크
    if (role !== 'CONTRIBUTOR' && role !== 'ADMIN') {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">기여자 권한이 필요합니다.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">MongoDB 세션 관리</h1>
                    <p className="mt-2 text-gray-600">
                        데이터 입력을 위한 MongoDB 직접 연결 세션을 관리하세요.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={createSession}
                        disabled={creating}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {creating ? '생성 중...' : '새 세션 생성'}
                    </button>
                    {sessions.length > 0 && (
                        <button
                            onClick={deleteAllSessions}
                            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            모든 세션 삭제
                        </button>
                    )}
                </div>
            </div>

            {/* 새 세션 연결 정보 모달 */}
            {showConnectionInfo && newSession && (
                <div className="bg-white border border-green-200 rounded-lg p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-green-900">
                            MongoDB 연결 정보
                        </h3>
                        <button
                            onClick={() => setShowConnectionInfo(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="bg-green-50 p-4 rounded-md mb-4">
                        <p className="text-sm text-green-700">
                            ⚠️ 보안상 이 정보는 다시 표시되지 않습니다. 안전한 곳에 저장해주세요.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                연결 문자열
                            </label>
                            <div className="flex">
                                <input
                                    type="text"
                                    value={newSession.connectionString}
                                    readOnly
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
                                />
                                <button
                                    onClick={() => copyToClipboard(newSession.connectionString, '연결 문자열')}
                                    className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 text-sm"
                                >
                                    복사
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    사용자명
                                </label>
                                <div className="flex">
                                    <input
                                        type="text"
                                        value={newSession.username}
                                        readOnly
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
                                    />
                                    <button
                                        onClick={() => copyToClipboard(newSession.username, '사용자명')}
                                        className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 text-sm"
                                    >
                                        복사
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    비밀번호
                                </label>
                                <div className="flex">
                                    <input
                                        type="password"
                                        value={newSession.password}
                                        readOnly
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
                                    />
                                    <button
                                        onClick={() => copyToClipboard(newSession.password, '비밀번호')}
                                        className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 text-sm"
                                    >
                                        복사
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                데이터베이스 이름
                            </label>
                            <input
                                type="text"
                                value={newSession.databaseName}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                                <strong>생성일:</strong> {new Date(newSession.createdAt).toLocaleString()}
                            </div>
                            <div>
                                <strong>만료일:</strong> {new Date(newSession.expiresAt).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 세션 목록 */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        활성 세션 목록
                    </h3>

                    {sessions.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">세션이 없습니다</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                새 MongoDB 세션을 생성하여 데이터를 입력하세요.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        세션 ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        상태
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        남은 시간
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        생성일
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        만료일
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        IP 주소
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        작업
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {sessions.map((session) => {
                                    const sessionStatus = getSessionStatus(session.expiresAt);
                                    return (
                                        <tr key={session.sessionId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-mono text-gray-900">
                                                        {session.sessionId.substring(0, 8)}...
                                                    </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${sessionStatus.color}`}>
                                                        {sessionStatus.status === 'active' && '활성'}
                                                        {sessionStatus.status === 'expiring' && '곧 만료'}
                                                        {sessionStatus.status === 'expired' && '만료됨'}
                                                    </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {getRemainingTime(session.expiresAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(session.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(session.expiresAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {session.ip}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                {sessionStatus.status !== 'expired' && (
                                                    <>
                                                        <button
                                                            onClick={() => extendSession(session.sessionId, 24)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            연장
                                                        </button>
                                                        <button
                                                            onClick={() => deleteSession(session.sessionId)}
                                                            className="text-red-600 hover:text-red-900 ml-2"
                                                        >
                                                            삭제
                                                        </button>
                                                    </>
                                                )}
                                                {sessionStatus.status === 'expired' && (
                                                    <button
                                                        onClick={() => deleteSession(session.sessionId)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        삭제
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* 사용 가이드 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-900 mb-4">
                    MongoDB 연결 가이드
                </h3>
                <div className="space-y-3 text-sm text-blue-800">
                    <div className="flex items-start">
                        <span className="font-medium mr-2">1.</span>
                        <span>위의 "새 세션 생성" 버튼을 클릭하여 MongoDB 세션을 생성합니다.</span>
                    </div>
                    <div className="flex items-start">
                        <span className="font-medium mr-2">2.</span>
                        <span>제공된 연결 정보를 MongoDB Compass, Studio 3T 등의 클라이언트에 입력합니다.</span>
                    </div>
                    <div className="flex items-start">
                        <span className="font-medium mr-2">3.</span>
                        <span>데이터베이스 이름: <code className="bg-blue-100 px-1 rounded">blackwatch_data</code></span>
                    </div>
                    <div className="flex items-start">
                        <span className="font-medium mr-2">4.</span>
                        <span>컬렉션: <code className="bg-blue-100 px-1 rounded">leaked_data</code>, <code className="bg-blue-100 px-1 rounded">vulnerability_data</code></span>
                    </div>
                    <div className="flex items-start">
                        <span className="font-medium mr-2">5.</span>
                        <span>세션은 기본적으로 24시간 동안 유효하며, 필요시 연장할 수 있습니다.</span>
                    </div>
                    <div className="flex items-start">
                        <span className="font-medium mr-2">6.</span>
                        <span>보안을 위해 사용하지 않는 세션은 즉시 삭제해주세요.</span>
                    </div>
                </div>

                {/* MongoDB 클라이언트 도구 추천 */}
                <div className="mt-6 pt-4 border-t border-blue-200">
                    <h4 className="text-sm font-medium text-blue-900 mb-3">추천 MongoDB 클라이언트</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-700">
                        <div className="flex items-center">
                            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            <a href="https://www.mongodb.com/products/compass" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                                MongoDB Compass (무료)
                            </a>
                        </div>
                        <div className="flex items-center">
                            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            <a href="https://studio3t.com/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                                Studio 3T (유료/무료 평가판)
                            </a>
                        </div>
                        <div className="flex items-center">
                            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            <a href="https://robomongo.org/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                                Robo 3T (무료)
                            </a>
                        </div>
                        <div className="flex items-center">
                            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>MongoDB Shell (mongosh)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContributorSessions;