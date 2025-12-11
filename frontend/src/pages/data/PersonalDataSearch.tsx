import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { api } from '../../api/services';
import {
    PersonalDataSearchDto,
    PersonalDataSearchResultDto,
    PersonalDataMatchDto
} from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface SearchFormData {
    emails: { value: string }[];
    names: { value: string }[];
}

const PersonalDataSearch = () => {
    const [loading, setLoading] = useState(false);
    const [searchResult, setSearchResult] = useState<PersonalDataSearchResultDto | null>(null);
    const [searchHistory, setSearchHistory] = useState<PersonalDataSearchDto[]>([]);

    const { control, register, handleSubmit, reset } = useForm<SearchFormData>({
        defaultValues: {
            emails: [{ value: '' }],
            names: [{ value: '' }]
        }
    });

    const { fields: emailFields, append: appendEmail, remove: removeEmail } = useFieldArray({
        control,
        name: 'emails'
    });

    const { fields: nameFields, append: appendName, remove: removeName } = useFieldArray({
        control,
        name: 'names'
    });

    // 검색 실행
    const onSubmit = async (data: SearchFormData) => {
        const emails = data.emails.map(item => item.value).filter(email => email.trim() !== '');
        const names = data.names.map(item => item.value).filter(name => name.trim() !== '');

        if (emails.length === 0 && names.length === 0) {
            toast.error('최소 하나의 이메일 또는 이름을 입력해주세요.');
            return;
        }

        const searchData: PersonalDataSearchDto = {
            ...(emails.length > 0 && { emails }),
            ...(names.length > 0 && { names })
        };

        try {
            setLoading(true);
            const result = await api.data.findPersonalData(searchData);
            setSearchResult(result);

            // 검색 기록에 추가 (최대 5개까지 보관)
            setSearchHistory(prev => {
                const newHistory = [searchData, ...prev.slice(0, 4)];
                return newHistory;
            });

            if (result.totalFound > 0) {
                toast.success(`${result.totalFound}건의 유출 데이터에서 발견되었습니다.`);
            } else {
                toast.success('입력하신 정보는 유출 데이터에서 발견되지 않았습니다.');
            }
        } catch (error: any) {
            const message = error.response?.data?.message || '검색에 실패했습니다.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    // 검색 기록에서 다시 검색
    const searchFromHistory = (historyItem: PersonalDataSearchDto) => {
        reset({
            emails: historyItem.emails?.map(email => ({ value: email })) || [{ value: '' }],
            names: historyItem.names?.map(name => ({ value: name })) || [{ value: '' }]
        });
    };

    // 결과 아이템 색상
    const getMatchColor = (match: PersonalDataMatchDto) => {
        if (match.found) {
            return match.leakIds.length > 5
                ? 'bg-red-50 border-red-200'
                : 'bg-yellow-50 border-yellow-200';
        }
        return 'bg-green-50 border-green-200';
    };

    // 결과 아이템 아이콘
    const getMatchIcon = (match: PersonalDataMatchDto) => {
        if (match.found) {
            return match.leakIds.length > 5 ? (
                <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
            ) : (
                <svg className="h-6 w-6 text-yellow-500" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
            );
        }
        return (
            <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        );
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">개인정보 유출 검색</h1>
                <p className="mt-2 text-gray-600">
                    이메일 주소나 이름을 입력하여 데이터 유출 여부를 확인하세요.
                </p>
            </div>

            {/* 보안 안내 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-700">
                            <strong>개인정보 보호:</strong> 입력된 정보는 검색 목적으로만 사용되며 저장되지 않습니다.
                            타인의 개인정보를 무단으로 검색하는 것은 금지되어 있습니다.
                        </p>
                    </div>
                </div>
            </div>

            {/* 검색 폼 */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">검색 정보 입력</h2>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* 이메일 입력 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                이메일 주소
                            </label>
                            <div className="space-y-2">
                                {emailFields.map((field, index) => (
                                    <div key={field.id} className="flex items-center space-x-2">
                                        <input
                                            {...register(`emails.${index}.value`, {
                                                pattern: {
                                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                    message: '유효한 이메일 주소를 입력해주세요'
                                                }
                                            })}
                                            type="email"
                                            placeholder="example@domain.com"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        {emailFields.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeEmail(index)}
                                                className="p-2 text-red-600 hover:text-red-900"
                                            >
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => appendEmail({ value: '' })}
                                    className="text-sm text-blue-600 hover:text-blue-500"
                                >
                                    + 이메일 추가
                                </button>
                            </div>
                        </div>

                        {/* 이름 입력 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                이름
                            </label>
                            <div className="space-y-2">
                                {nameFields.map((field, index) => (
                                    <div key={field.id} className="flex items-center space-x-2">
                                        <input
                                            {...register(`names.${index}.value`, {
                                                minLength: {
                                                    value: 2,
                                                    message: '최소 2자 이상 입력해주세요'
                                                }
                                            })}
                                            type="text"
                                            placeholder="홍길동"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        {nameFields.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeName(index)}
                                                className="p-2 text-red-600 hover:text-red-900"
                                            >
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => appendName({ value: '' })}
                                    className="text-sm text-blue-600 hover:text-blue-500"
                                >
                                    + 이름 추가
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <LoadingSpinner size="sm" className="mr-2" />
                                        검색 중...
                                    </>
                                ) : (
                                    <>
                                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        검색
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* 검색 기록 */}
            {searchHistory.length > 0 && (
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">최근 검색</h3>
                        <div className="space-y-2">
                            {searchHistory.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                    <div className="text-sm text-gray-600">
                                        {item.emails && item.emails.length > 0 && (
                                            <span>이메일: {item.emails.join(', ')}</span>
                                        )}
                                        {item.emails && item.names && ' | '}
                                        {item.names && item.names.length > 0 && (
                                            <span>이름: {item.names.join(', ')}</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => searchFromHistory(item)}
                                        className="text-blue-600 hover:text-blue-500 text-sm"
                                    >
                                        다시 검색
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 검색 결과 */}
            {searchResult && (
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-medium text-gray-900">검색 결과</h3>
                            <div className="text-sm text-gray-500">
                                총 {searchResult.totalFound}건 발견
                            </div>
                        </div>

                        {searchResult.matches.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-green-400" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">안전합니다</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    입력하신 정보는 데이터 유출 기록에서 발견되지 않았습니다.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {searchResult.matches.map((match, index) => (
                                    <div
                                        key={index}
                                        className={`border rounded-lg p-4 ${getMatchColor(match)}`}
                                    >
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 mr-3 mt-0.5">
                                                {getMatchIcon(match)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-medium text-gray-900">
                                                        {match.email && `이메일: ${match.email}`}
                                                        {match.name && `이름: ${match.name}`}
                                                    </h4>
                                                    {match.found && (
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            match.leakIds.length > 5
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {match.leakIds.length}개 유출 발견
                                                        </span>
                                                    )}
                                                </div>

                                                {match.found ? (
                                                    <div className="mt-2">
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            이 정보가 다음 데이터 유출 사건에서 발견되었습니다:
                                                        </p>
                                                        <div className="space-y-1">
                                                            {match.leakIds.slice(0, 5).map((leakId, leakIndex) => (
                                                                <div key={leakIndex} className="text-sm">
                                                                    <a
                                                                        href={`/data/leaked/${leakId}`}
                                                                        className="text-blue-600 hover:text-blue-500 underline"
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        유출 데이터 #{leakId}
                                                                    </a>
                                                                </div>
                                                            ))}
                                                            {match.leakIds.length > 5 && (
                                                                <p className="text-xs text-gray-500">
                                                                    외 {match.leakIds.length - 5}건 더...
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="mt-3 p-3 bg-white bg-opacity-50 rounded border">
                                                            <h5 className="text-sm font-medium text-gray-900 mb-1">
                                                                권장 보안 조치
                                                            </h5>
                                                            <ul className="text-xs text-gray-600 space-y-1">
                                                                <li>• 해당 계정의 비밀번호를 즉시 변경하세요</li>
                                                                <li>• 2단계 인증(MFA)을 활성화하세요</li>
                                                                <li>• 관련 금융 계정을 모니터링하세요</li>
                                                                <li>• 피싱 이메일에 주의하세요</li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="mt-1 text-sm text-green-600">
                                                        이 정보는 데이터 유출 기록에서 발견되지 않았습니다.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 추가 안내 */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">추가 보안 팁</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                        <h4 className="font-medium text-gray-900 mb-2">예방 조치</h4>
                        <ul className="space-y-1">
                            <li>• 강력하고 고유한 비밀번호 사용</li>
                            <li>• 정기적인 비밀번호 변경</li>
                            <li>• 2단계 인증 활성화</li>
                            <li>• 의심스러운 이메일 주의</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-900 mb-2">유출 발견 시</h4>
                        <ul className="space-y-1">
                            <li>• 즉시 비밀번호 변경</li>
                            <li>• 관련 계정 보안 강화</li>
                            <li>• 금융 활동 모니터링</li>
                            <li>• 필요시 관련 기관 신고</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalDataSearch;