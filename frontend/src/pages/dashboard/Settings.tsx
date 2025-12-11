import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../api/services';

const Settings = () => {
    const { user, updateUser } = useAuthStore();
    const [mfaLoading, setMfaLoading] = useState(false);

    const handleMfaToggle = async () => {
        try {
            setMfaLoading(true);
            if (user?.mfaEnabled) {
                await api.auth.disableMfa();
                updateUser({ mfaEnabled: false });
                toast.success('다단계 인증이 비활성화되었습니다.');
            } else {
                await api.auth.enableMfa();
                updateUser({ mfaEnabled: true });
                toast.success('다단계 인증이 활성화되었습니다.');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'MFA 설정 변경에 실패했습니다.');
        } finally {
            setMfaLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const isContributor = user.roles?.includes('CONTRIBUTOR');

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">설정</h1>
                <p className="mt-2 text-gray-600">
                    계정 보안 및 기본 설정을 관리하세요.
                </p>
            </div>

            {/* Security Settings */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        보안 설정
                    </h3>

                    <div className="space-y-6">
                        {/* MFA Settings */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-medium text-gray-900">다단계 인증 (MFA)</h4>
                                <p className="text-sm text-gray-500">
                                    계정 보안을 강화하기 위해 로그인 시 추가 인증을 요구합니다.
                                    {isContributor && (
                                        <span className="text-yellow-600 font-medium">
                      {' '}기여자는 MFA를 비활성화할 수 없습니다.
                    </span>
                                    )}
                                </p>
                            </div>
                            <button
                                onClick={handleMfaToggle}
                                disabled={mfaLoading || isContributor}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                    user.mfaEnabled ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                            >
                <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        user.mfaEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
                            </button>
                        </div>

                        {/* Password Change */}
                        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                            <div>
                                <h4 className="text-sm font-medium text-gray-900">비밀번호 변경</h4>
                                <p className="text-sm text-gray-500">
                                    정기적으로 비밀번호를 변경하여 계정을 안전하게 보호하세요.
                                </p>
                            </div>
                            <a
                                href="/auth/reset-password"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                비밀번호 변경
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Account Information */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        계정 정보
                    </h3>

                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">사용자 ID</dt>
                            <dd className="mt-1 text-sm text-gray-900">{user.userId}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">이메일</dt>
                            <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">사용자명</dt>
                            <dd className="mt-1 text-sm text-gray-900">{user.username}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">역할</dt>
                            <dd className="mt-1">
                                {user.roles?.map(role => (
                                    <span key={role} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                    {role}
                  </span>
                                ))}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">가입일</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {user.createdAt && new Date(user.createdAt).toLocaleString()}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">마지막 로그인</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {user.lastLoginAt && new Date(user.lastLoginAt).toLocaleString()}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">이메일 인증 상태</dt>
                            <dd className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.emailVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.emailVerified ? '인증 완료' : '인증 필요'}
                </span>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">MFA 상태</dt>
                            <dd className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.mfaEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.mfaEnabled ? '활성화됨' : '비활성화됨'}
                </span>
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            {/* Preferences */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        기본 설정
                    </h3>

                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">언어</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {user.locale === 'ko' ? '한국어' : user.locale === 'en' ? 'English' : user.locale}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">시간대</dt>
                            <dd className="mt-1 text-sm text-gray-900">{user.timeZone || 'Asia/Seoul'}</dd>
                        </div>
                    </dl>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <a
                            href="/dashboard/profile"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            프로필 수정
                        </a>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white shadow rounded-lg border border-red-200">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-red-900 mb-4">
                        위험 구역
                    </h3>

                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    계정 삭제
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.</p>
                                </div>
                                <div className="mt-4">
                                    <button
                                        type="button"
                                        className="bg-red-100 px-3 py-2 text-sm font-semibold text-red-900 shadow-sm hover:bg-red-200 border border-red-300 rounded-md"
                                        onClick={() => {
                                            toast.error('계정 삭제 기능은 현재 지원되지 않습니다.');
                                        }}
                                    >
                                        계정 삭제
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;