package me.xyzo.blackwatchBE.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import me.xyzo.blackwatchBE.config.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String token = getTokenFromRequest(request);

        // 토큰이 있고, 파싱(검증)이 성공한 경우에만 로직 수행
        if (StringUtils.hasText(token)) {
            Claims claims = jwtUtil.extractClaims(token);

            if (claims != null) {
                String userId = claims.getSubject();
                String role = claims.get("role", String.class);

                // [중요] Spring Security 규격에 맞춰 "ROLE_" 접두사 추가
                // 예: DB의 "ADMIN" -> Spring의 "ROLE_ADMIN"
                SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);
                
                // 권한 리스트 생성
                List<SimpleGrantedAuthority> authorities = Collections.singletonList(authority);

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userId, null, authorities);

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}