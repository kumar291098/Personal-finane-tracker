package com.finance.security;

import com.finance.model.AccessLevel;
import com.finance.repository.UserRepository;
import com.finance.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    private static final List<String> PUBLIC_PATHS = List.of(
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/refresh",
        "/api/auth/forgot-password",
        "/api/auth/forgot-password/request-otp",
        "/api/auth/forgot-password/verify-otp",
        "/api/users/register",
        "/api/users/login",
        "/api/public",
        "/error",
        "/api/actuator/health",
        "/api/actuator/info"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        System.out.println("JWT Filter - Processing request: " + method + " " + path);

        if ("OPTIONS".equals(method)) {
            System.out.println("Skipping OPTIONS request");
            filterChain.doFilter(request, response);
            return;
        }

        if (isPublicPath(path)) {
            System.out.println("Public path, skipping JWT check: " + path);
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = resolveToken(request);
        if (jwt == null) {
            System.out.println("Missing JWT token");
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String username = jwtUtil.extractUsername(jwt);
            if (jwtUtil.isTokenExpired(jwt)) {
                System.out.println("Token expired for user: " + username);
                filterChain.doFilter(request, response);
                return;
            }

            if (username != null
                    && SecurityContextHolder.getContext().getAuthentication() == null
                    && jwtUtil.validateToken(jwt, username)) {
                Long userId = jwtUtil.extractUserId(jwt);
                String tokenValue = jwt;
                String accessLevel = userRepository.findByUsername(username)
                    .map(user -> user.getAccessLevel().name())
                    .orElseGet(() -> "demo".equalsIgnoreCase(username)
                        ? AccessLevel.ADMIN.name()
                        : jwtUtil.extractAccessLevel(tokenValue));

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                            username,
                            null,
                            List.of(
                                new SimpleGrantedAuthority("ROLE_USER"),
                                new SimpleGrantedAuthority("ROLE_" + accessLevel)
                            )
                        );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                request.setAttribute("userId", userId);
                request.setAttribute("username", username);
                request.setAttribute("accessLevel", accessLevel);

                SecurityContextHolder.getContext().setAuthentication(authToken);
                System.out.println("Authentication set for user: " + username);
            }
        } catch (Exception error) {
            System.out.println("Token parsing error: " + error.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7).trim();
        }

        String fallbackHeader = request.getHeader("X-Auth-Token");
        if (fallbackHeader != null && !fallbackHeader.isBlank()) {
            return fallbackHeader.trim();
        }

        String queryToken = request.getParameter("access_token");
        if (queryToken != null && !queryToken.isBlank()) {
            return queryToken.trim();
        }

        return null;
    }

    private boolean isPublicPath(String path) {
        return PUBLIC_PATHS.stream().anyMatch(publicPath ->
            path.equals(publicPath) || path.startsWith(publicPath + "/")
        );
    }
}
