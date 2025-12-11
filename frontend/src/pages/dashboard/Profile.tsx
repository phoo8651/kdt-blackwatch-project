import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../api/services';
import { AccountUpdateDto } from '../../types';

const Profile = () => {
    const { user, updateUser } = useAuthStore();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<AccountUpdateDto>();

    useEffect(() => {
        if (user) {
            reset({
                username: user.username,
                locale: user.locale || 'ko',
                timeZone: user.timeZone || 'Asia/Seoul',
            });
        }
    }, [user, reset]);

    const onSubmit = async (data: AccountUpdateDto) => {
        try {
            setLoading(true);
            const updatedUser = await api.account.updateMyAccount(data);
            updateUser(updatedUser);
            toast.success('프로필이 업데이트되었습니다.');
        } catch (error: any) {
            toast.error(error.response?.data?.message || '업데이트에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                        프로필 정보
                    </h3>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                                    사용자 ID
                                </label>
                                <input
                                    type="text"
                                    value={user.userId}
                                    disabled
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    이메일
                                </label>
                                <input
                                    type="email"
                                    value={user.email || ''}
                                    disabled
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                    사용자명
                                </label>
                                <input
                                    {...register('username', { required: '사용자명을 입력해주세요' })}
                                    type="text"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.username && (
                                    <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="locale" className="block text-sm font-medium text-gray-700">
                                    언어
                                </label>
                                <select
                                    {...register('locale')}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="ko">한국어</option>
                                    <option value="en">English</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="timeZone" className="block text-sm font-medium text-gray-700">
                                    시간대
                                </label>
                                <select
                                    {...register('timeZone')}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="Asia/Seoul">Asia/Seoul (UTC+9)</option>
                                    <option value="UTC">UTC (UTC+0)</option>
                                    <option value="America/New_York">America/New_York (UTC-5)</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                    <strong>가입일:</strong> {user.createdAt && new Date(user.createdAt).toLocaleDateString()}
                                </div>
                                <div>
                                    <strong>마지막 로그인:</strong> {user.lastLoginAt && new Date(user.lastLoginAt).toLocaleDateString()}
                                </div>
                                <div>
                                    <strong>이메일 인증:</strong> {user.emailVerified ? '완료' : '미완료'}
                                </div>
                                <div>
                                    <strong>MFA 상태:</strong> {user.mfaEnabled ? '활성화' : '비활성화'}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? '저장 중...' : '저장'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;