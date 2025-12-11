// src/pages/auth/MfaVerify.tsx
import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { api } from '../../api/services';
import { useAuthStore } from '../../stores/authStore';
import { MfaVerifyDto } from '../../types';

const MfaVerify = () => {
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuthStore();

    const sessionKey = location.state?.sessionKey || '';
    const email = location.state?.email || '';

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<MfaVerifyDto>({
        defaultValues: { sessionKey }
    });

    const onSubmit = async (data: MfaVerifyDto) => {
        try {
            setLoading(true);
            const response = await api.auth.mfaVerify(data);
            login(response.accessToken, response.expiresAt, response.role);
            toast.success('로그인 성공');
            navigate('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'MFA 인증에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            setResending(true);
            const response = await api.auth.mfaResend(sessionKey);

            // Update sessionKey if changed
            if (response.sessionKey !== sessionKey) {
                // Update form data with new sessionKey
                setValue('sessionKey', response.sessionKey);

                // Update location state
                navigate('/auth/mfa', {
                    state: {
                        sessionKey: response.sessionKey,
                        email
                    },
                    replace: true
                });
            }
            toast.success('인증 코드가 재전송되었습니다.');
        } catch (error: any) {
            toast.error(error.response?.data?.message || '재전송에 실패했습니다.');
        } finally {
            setResending(false);
        }
    };

    // Validate required state
    if (!sessionKey) {
        return (
            <div className="text-center">
                <p className="text-red-600 mb-4">잘못된 접근입니다.</p>
                <Link to="/auth/signin" className="text-blue-600 hover:text-blue-500">
                    로그인으로 돌아가기
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-900">다단계 인증</h2>
            <p className="text-center text-gray-600">
                {email}로 전송된 인증 코드를 입력해주세요.
            </p>

            {/* Hidden field for sessionKey */}
            <input {...register('sessionKey')} type="hidden" />

            <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                    인증 코드 (6자리)
                </label>
                <input
                    {...register('code', {
                        required: '인증 코드를 입력해주세요',
                        pattern: {
                            value: /^\d{6}$/,
                            message: '6자리 숫자를 입력해주세요'
                        }
                    })}
                    type="text"
                    maxLength={6}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="123456"
                    autoComplete="one-time-code"
                    autoFocus
                />
                {errors.code && (
                    <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? '인증 중...' : '인증'}
            </button>

            <div className="text-center space-y-2">
                <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending || loading}
                    className="text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {resending ? '재전송 중...' : '인증 코드 재전송'}
                </button>
                <div>
                    <Link
                        to="/auth/signin"
                        className="text-sm text-gray-600 hover:text-gray-500"
                    >
                        로그인으로 돌아가기
                    </Link>
                </div>
            </div>
        </form>
    );
};

export default MfaVerify;