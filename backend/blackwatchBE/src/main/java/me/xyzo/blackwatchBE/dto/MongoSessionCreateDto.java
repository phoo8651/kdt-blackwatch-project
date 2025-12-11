package me.xyzo.blackwatchBE.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "MongoDB 세션 생성 요청")
public class MongoSessionCreateDto {

    @Schema(description = "세션 설명 (선택적)", example = "크롤링 데이터 업로드용 세션")
    private String description; // 세션 설명

    @Schema(description = "세션 지속 시간 (시간 단위, 선택적)",
            example = "24", minimum = "1", maximum = "72")
    private Integer durationHours; // 선택적, 기본값 사용 시 null

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getDurationHours() { return durationHours; }
    public void setDurationHours(Integer durationHours) { this.durationHours = durationHours; }
}