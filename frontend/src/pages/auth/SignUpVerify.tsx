import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { api } from '../../api/services';
import { SignupVerifyDto } from '../../types';

const SignUpVerify = () => {
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || '';

    const { register, handleSubmit, formState: { errors } } = useForm<SignupVerifyDto>({
        defaultValues: { email }
    });

    const onSubmit = async (data: SignupVerifyDto) => {
        try {
            setLoading(true);
            await api.auth.signupVerify(data);
            toast.success('회원가입이 완료되었습니다.');
            navigate('/auth/signin');
        } catch (error: any) {
            toast.error(error.response?.data?.message || '회원가입에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    if (!email) {
        return (
            <div className="text-center">
                <p className="text-red-600 mb-4">잘못된 접근입니다.</p>
                <Link to="/auth/signup" className="text-blue-600 hover:text-blue-500">
                    회원가입으로 돌아가기
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-900">이메일 인증</h2>
            <p className="text-center text-gray-600">
                {email}로 전송된 인증 코드를 입력해주세요.
            </p>

            <input {...register('email')} type="hidden" />

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
                />
                {errors.code && (
                    <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    사용자명
                </label>
                <input
                    {...register('username', { required: '사용자명을 입력해주세요' })}
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="사용자명"
                />
                {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
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
                {loading ? '처리 중...' : '계정 생성'}
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

export default SignUpVerify;