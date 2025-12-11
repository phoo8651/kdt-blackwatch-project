import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { api } from '../../api/services';
import { useAuthStore } from '../../stores/authStore';
import { SigninRequestDto, SigninResponseDto, MfaResponseDto } from '../../types';

const SignIn = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuthStore();

    const { register, handleSubmit, formState: { errors } } = useForm<SigninRequestDto>();

    const onSubmit = async (data: SigninRequestDto) => {
        try {
            setLoading(true);
            const response = await api.auth.signin(data);

            // Check if MFA is required
            if ('needMfa' in response && response.needMfa) {
                const mfaResponse = response as MfaResponseDto;
                navigate('/auth/mfa', {
                    state: {
                        sessionKey: mfaResponse.sessionKey,
                        email: data.email
                    }
                });
                toast.success(mfaResponse.message);
            } else {
                // Direct login
                const loginResponse = response as SigninResponseDto;
                login(loginResponse.accessToken, loginResponse.expiresAt, loginResponse.role);
                toast.success('로그인 성공');
                navigate('/dashboard');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || '로그인에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-900">로그인</h2>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    이메일
                </label>
                <input
                    {...register('email', {
                        required: '이메일을 입력해주세요',
                        pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: '유효한 이메일을 입력해주세요'
                        }
                    })}
                    type="email"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your@email.com"
                />
                {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    비밀번호
                </label>
                <input
                    {...register('password', { required: '비밀번호를 입력해주세요' })}
                    type="password"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="비밀번호"
                />
                {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
                {loading ? '로그인 중...' : '로그인'}
            </button>

            <div className="text-center space-y-2">
                <Link
                    to="/auth/reset-password"
                    className="text-sm text-blue-600 hover:text-blue-500"
                >
                    비밀번호를 잊으셨나요?
                </Link>
                <div>
                    <Link
                        to="/auth/signup"
                        className="text-sm text-blue-600 hover:text-blue-500"
                    >
                        계정이 없으신가요? 회원가입
                    </Link>
                </div>
            </div>
        </form>
    );
};

export default SignIn;
