package me.xyzo.blackwatchBE.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .addServersItem(new Server().url("/"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Authentication",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .info(new Info()
                        .title("BlackWatch Backend API")
                        .description("""
                                BlackWatch 보안 데이터 수집 및 분석 플랫폼 API
                                
                                ## 주요 기능
                                - **사용자 인증**: JWT 기반 인증 시스템
                                - **기여자 관리**: 기여자 신청, 승인, 권한 관리
                                - **MongoDB 직접 연결**: 기여자용 MongoDB 세션 생성 및 관리
                                - **데이터 조회**: 유출 데이터 및 취약점 정보 검색
                                - **개인정보 검색**: 개인정보 유출 여부 확인
                                
                                ## 데이터 입력 방식
                                **기여자**는 다음 과정을 통해 데이터를 입력합니다:
                                1. 기여자 신청 및 승인 (`/contrib/applications`)
                                2. MongoDB 세션 생성 (`/contrib/mongo-sessions`)  
                                3. 제공된 MongoDB 연결 정보로 직접 연결
                                4. 표준 MongoDB 클라이언트를 통한 데이터 CRUD
                                
                                ## 인증 방법
                                모든 API 호출 시 `Authorization: Bearer <JWT_TOKEN>` 헤더 필요
                                """)
                        .version("v2.0.0"));
    }
}