package me.xyzo.blackwatchBE.config;

import me.xyzo.blackwatchBE.security.JwtAuthenticationEntryPoint;
import me.xyzo.blackwatchBE.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private static final String[] swaggerList = {"/swagger-ui/**",
            "/h2-console/**",
            "/favicon.ico",
            "/error",
            "/swagger-ui/**",
            "/swagger-resources/**",
            "/v3/api-docs/**"};


    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exception -> exception.authenticationEntryPoint(jwtAuthenticationEntryPoint))
                .authorizeHttpRequests(auth -> auth
                        // 1. 공용 접근 허용 (인증 불필요)
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers(SWAGGER_LIST).permitAll()
                        .requestMatchers("/actuator/**", "/error", "/", "/favicon.ico").permitAll()

                        // 2. [중요] 관리자 전용 API 보호
                        // ROLE_ADMIN 권한이 있는 사용자만 접근 가능
                        .requestMatchers("/admin/**").hasRole("ADMIN")

                        // 3. 기여자 전용 API 보호
                        // 기여자(CONTRIBUTOR) 또는 관리자(ADMIN)만 접근 가능
                        .requestMatchers("/contrib/**").hasAnyRole("CONTRIBUTOR", "ADMIN")

                        // 4. 일반 사용자도 접근 가능한 API (예: 데이터 조회)
                        // 로그인한 누구나 접근 가능
                        .requestMatchers(HttpMethod.GET, "/data/**").authenticated()
                        .requestMatchers("/account/**").authenticated()
                        .requestMatchers("/users/**").authenticated()

                        // 5. 그 외 모든 요청은 인증 필요
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // [보안 권장] 운영 환경에서는 구체적인 도메인(예: https://mydomain.com)만 허용해야 합니다.
        // 현재는 개발 편의를 위해 "*" 유지하되, 주석으로 남깁니다.
        configuration.setAllowedOriginPatterns(List.of("*")); 
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}