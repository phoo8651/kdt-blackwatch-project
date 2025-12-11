import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { api } from '../../api/services';
import { ResetPasswordConfirmDto } from '../../types';

const ResetPasswordConfirm = () => {
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || '';

    const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordConfirmDto & { confirmPassword: string }>({
        defaultValues: { email }
    });

    const password = watch('password');

    const onSubmit = async (data: ResetPasswordConfirmDto & { confirmPassword: string }) => {
        if (data.password !== data.confirmPassword) {
            toast.error('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            setLoading(true);
            const submitData: ResetPasswordConfirmDto = {
                email: data.email,
                code: data.code,
                password: data.password
            };
            await api.auth.resetPasswordConfirm(submitData);
            toast.success('비밀번호가 변경되었습니다.');
            navigate('/auth/signin');
        } catch (error: any) {
            toast.error(error.response?.data?.message || '비밀번호 변경에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    if (!email) {
        return (
            <div className="text-center">
                <p className="text-red-600 mb-4">잘못된 접근입니다.</p>
                <Link to="/auth/reset-password" className="text-blue-600 hover:text-blue-500">
                    비밀번호 재설정으로 돌아가기
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-900">새 비밀번호 설정</h2>
            <p className="text-center text-gray-600">
                {email}로 전송된 인증번호와 새 비밀번호를 입력해주세요.
            </p>

            <input {...register('email')} type="hidden" />

            <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                    인증번호 (6자리)
                </label>
                <input
                    {...register('code', {
                        required: '인증번호를 입력해주세요',
                        pattern: {
                            value: /^\d{6}$/,
                            message: '6자리 숫자를 입력해주세요'
                        }
                    })}
                    type="text"
                    maxLength={6}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="123456"
                />
                {errors.code && (
                    <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    새 비밀번호
                </label>
                <input
                    {...register('password', { required: '새 비밀번호를 입력해주세요' })}
                    type="password"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="새 비밀번호"
                />
                {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    비밀번호 확인
                </label>
                <input
                    {...register('confirmPassword', {
                        required: '비밀번호 확인을 입력해주세요',
                        validate: (value) => value === password || '비밀번호가 일치하지 않습니다.'
                    })}
                    type="password"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="비밀번호 확인"
                />
                {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
                {loading ? '변경 중...' : '비밀번호 변경'}
            </button>

            <div className="text-center">
                <Link
                    to="/auth/signin"
                    className="text-sm text-blue-600 hover:text-blue-500"
                >
                    로그인으로 돌아가기
                </Link>
            </div>
        </form>
    );
};

export default ResetPasswordConfirm;