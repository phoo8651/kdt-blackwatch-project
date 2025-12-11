import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../api/services';
import {
    ContributionApplicationDto,
    ContributionApplicationStatusDto
} from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ContributorApplication = () => {
    const { role } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState<ContributionApplicationStatusDto | null>(null);

    const { register, handleSubmit, formState: { errors }, watch } = useForm<ContributionApplicationDto>();

    // 현재 신청 상태 확인
    const checkApplicationStatus = async () => {
        try {
            setLoading(true);
            const status = await api.contribution.getMyApplicationStatus();
            setApplicationStatus(status);
        } catch (error: any) {
            // 404 에러는 신청 내역이 없다는 의미이므로 정상
            if (error.response?.status !== 404) {
                console.error('Failed to check application status:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    // 신청서 제출
    const onSubmit = async (data: ContributionApplicationDto) => {
        try {
            setSubmitting(true);
            await api.contribution.submitApplication(data);
            toast.success('기여자 신청이 제출되었습니다. 검토 후 연락드리겠습니다.');
            await checkApplicationStatus();
        } catch (error: any) {
            const message = error.response?.data?.message || '신청 제출에 실패했습니다.';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    // 신청 상태에 따른 색상 및 텍스트
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'PENDING':
                return {
                    color: 'bg-yellow-100 text-yellow-800',
                    text: '검토 중',
                    description: '신청서가 검토 중입니다. 결과를 기다려주세요.'
                };
            case 'ACCEPT':
                return {
                    color: 'bg-green-100 text-green-800',
                    text: '승인됨',
                    description: '축하합니다! 기여자로 승인되었습니다.'
                };
            case 'TEMPORARY_ACCEPT':
                return {
                    color: 'bg-blue-100 text-blue-800',
                    text: '임시 승인',
                    description: '임시 기여자로 승인되었습니다.'
                };
            case 'REJECT':
                return {
                    color: 'bg-red-100 text-red-800',
                    text: '거절됨',
                    description: '신청이 거절되었습니다. 다시 신청하실 수 있습니다.'
                };
            default:
                return {
                    color: 'bg-gray-100 text-gray-800',
                    text: status,
                    description: ''
                };
        }
    };

    useEffect(() => {
        checkApplicationStatus();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    // 이미 기여자인 경우
    if (role === 'CONTRIBUTOR' || role === 'ADMIN') {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <svg className="mx-auto h-12 w-12 text-green-400 mb-4" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-green-900 mb-2">
                        이미 기여자입니다
                    </h3>
                    <p className="text-green-700">
                        현재 기여자 권한을 보유하고 있습니다.
                        <a href="/contribution/dashboard" className="text-green-600 hover:text-green-500 underline ml-1">
                            기여자 대시보드
                        </a>에서 활동을 관리하세요.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">기여자 신청</h1>
                <p className="mt-2 text-gray-600">
                    BlackWatch 플랫폼의 기여자가 되어 보안 데이터를 제공하고 커뮤니티에 기여하세요.
                </p>
            </div>

            {/* 현재 신청 상태 */}
            {applicationStatus && (
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">현재 신청 상태</h2>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-3">
                                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusInfo(applicationStatus.status).color}`}>
                                    {getStatusInfo(applicationStatus.status).text}
                                </span>
                                <span className="text-sm text-gray-500">
                                    신청일: {new Date(applicationStatus.createdAt).toLocaleDateString()}
                                </span>
                                {applicationStatus.updatedAt !== applicationStatus.createdAt && (
                                    <span className="text-sm text-gray-500">
                                        수정일: {new Date(applicationStatus.updatedAt).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                            <p className="mt-2 text-sm text-gray-600">
                                {getStatusInfo(applicationStatus.status).description}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* 기여자 혜택 안내 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h2 className="text-lg font-medium text-blue-900 mb-4">기여자 혜택</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                        <svg className="flex-shrink-0 h-6 w-6 text-blue-600 mr-3 mt-0.5" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-blue-900">MongoDB 직접 연결</p>
                            <p className="text-xs text-blue-700">데이터베이스에 직접 연결하여 효율적으로 데이터를 입력할 수 있습니다.</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <svg className="flex-shrink-0 h-6 w-6 text-blue-600 mr-3 mt-0.5" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-blue-900">고급 도구 접근</p>
                            <p className="text-xs text-blue-700">전문적인 보안 데이터 분석 도구에 접근할 수 있습니다.</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <svg className="flex-shrink-0 h-6 w-6 text-blue-600 mr-3 mt-0.5" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM9 9a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-blue-900">커뮤니티 참여</p>
                            <p className="text-xs text-blue-700">보안 전문가 커뮤니티에 참여하여 네트워킹할 수 있습니다.</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <svg className="flex-shrink-0 h-6 w-6 text-blue-600 mr-3 mt-0.5" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-blue-900">기여 인센티브</p>
                            <p className="text-xs text-blue-700">양질의 데이터 제공 시 인센티브를 받을 수 있습니다.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 신청서 또는 재신청 */}
            {(!applicationStatus || applicationStatus.status === 'REJECT') && (
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-6">
                            {applicationStatus?.status === 'REJECT' ? '재신청서 작성' : '신청서 작성'}
                        </h2>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
                                        연락처 *
                                    </label>
                                    <input
                                        {...register('contact', {
                                            required: '연락처를 입력해주세요',
                                            pattern: {
                                                value: /^[\w\.-]+@[\w\.-]+\.\w+$|^\d{2,3}-?\d{3,4}-?\d{4}$/,
                                                message: '유효한 이메일 또는 전화번호를 입력해주세요'
                                            }
                                        })}
                                        type="text"
                                        placeholder="이메일 또는 전화번호"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {errors.contact && (
                                        <p className="mt-1 text-sm text-red-600">{errors.contact.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="handle" className="block text-sm font-medium text-gray-700">
                                        핸들/닉네임 *
                                    </label>
                                    <input
                                        {...register('handle', {
                                            required: '핸들/닉네임을 입력해주세요',
                                            minLength: {
                                                value: 2,
                                                message: '최소 2자 이상 입력해주세요'
                                            }
                                        })}
                                        type="text"
                                        placeholder="온라인에서 사용하는 닉네임"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {errors.handle && (
                                        <p className="mt-1 text-sm text-red-600">{errors.handle.message}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="jobs" className="block text-sm font-medium text-gray-700">
                                    직업/소속 *
                                </label>
                                <textarea
                                    {...register('jobs', {
                                        required: '직업/소속을 입력해주세요',
                                        minLength: {
                                            value: 10,
                                            message: '최소 10자 이상 입력해주세요'
                                        }
                                    })}
                                    rows={3}
                                    placeholder="현재 직업, 소속 기관, 전문 분야 등을 상세히 작성해주세요"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.jobs && (
                                    <p className="mt-1 text-sm text-red-600">{errors.jobs.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="motivation" className="block text-sm font-medium text-gray-700">
                                    지원 동기 *
                                </label>
                                <textarea
                                    {...register('motivation', {
                                        required: '지원 동기를 입력해주세요',
                                        minLength: {
                                            value: 50,
                                            message: '최소 50자 이상 입력해주세요'
                                        }
                                    })}
                                    rows={4}
                                    placeholder="BlackWatch 기여자가 되고 싶은 이유와 어떤 방식으로 기여할 계획인지 구체적으로 작성해주세요"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.motivation && (
                                    <p className="mt-1 text-sm text-red-600">{errors.motivation.message}</p>
                                )}
                                <p className="mt-1 text-sm text-gray-500">
                                    현재 글자 수: {watch('motivation')?.length || 0}/50 (최소)
                                </p>
                            </div>

                            {/* 약관 동의 */}
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            {...register('law', { required: '법적 고지사항에 동의해주세요' })}
                                            type="checkbox"
                                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label className="font-medium text-gray-700">
                                            법적 고지사항 동의 *
                                        </label>
                                        <p className="text-gray-500">
                                            제공하는 모든 데이터는 합법적으로 수집된 것이며, 개인정보보호법 및 관련 법령을 준수함을 확인합니다.
                                        </p>
                                        {errors.law && (
                                            <p className="text-red-600">{errors.law.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            {...register('license', { required: '라이선스 조건에 동의해주세요' })}
                                            type="checkbox"
                                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label className="font-medium text-gray-700">
                                            데이터 라이선스 동의 *
                                        </label>
                                        <p className="text-gray-500">
                                            제공한 데이터는 BlackWatch 플랫폼에서 연구 및 보안 목적으로 사용될 수 있음에 동의합니다.
                                        </p>
                                        {errors.license && (
                                            <p className="text-red-600">{errors.license.message}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {submitting ? '제출 중...' : '신청서 제출'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 추가 안내 */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    신청 안내사항
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                    <p>• 신청서 검토 기간은 일반적으로 3-5 영업일 소요됩니다.</p>
                    <p>• 기여자 승인 후 별도의 온보딩 과정이 진행됩니다.</p>
                    <p>• 기여자는 데이터 품질 가이드라인을 준수해야 합니다.</p>
                    <p>• 부적절한 데이터 제공 시 기여자 자격이 취소될 수 있습니다.</p>
                    <p>• 문의사항이 있으시면 contact@blackwatch.kr로 연락해주세요.</p>
                </div>
            </div>
        </div>
    );
};

export default ContributorApplication;