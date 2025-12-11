import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { api } from '../../api/services';
import { ResetPasswordRequestDto } from '../../types';

const ResetPassword = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordRequestDto>();

    const onSubmit = async (data: ResetPasswordRequestDto) => {
        try {
            setLoading(true);
            await api.auth.resetPasswordRequest(data);
            toast.success('이메일로 인증번호가 전송되었습니다.');
            navigate('/auth/reset-password/confirm', { state: { email: data.email } });
        } catch (error: any) {
            toast.error(error.response?.data?.message || '요청에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-900">비밀번호 재설정</h2>
            <p className="text-center text-gray-600">
                등록된 이메일 주소를 입력하시면 인증번호를 전송해드립니다.
            </p>

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

            <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
                {loading ? '전송 중...' : '인증번호 전송'}
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

export default ResetPassword;