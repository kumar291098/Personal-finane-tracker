package com.finance.security;

import com.finance.util.JwtUtil;
import com.finance.model.AccessLevel;
import com.finance.repository.UserRepository;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
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

    // Allow these paths without JWT
    private static final List<String> PUBLIC_PATHS = List.of(
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/refresh",
        "/api/auth/forgot-password",
        "/api/auth/forgot-password/request-otp",
        "/api/auth/forgot-password/verify-otp",
        "/api/users/register",
        "/api/users/login",
        "/api/actuator/health",
        "/api/actuator/info"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        System.out.println("🔍 JWT Filter - Processing request: " + method + " " + path);

        // ✅ Skip JWT check for OPTIONS preflight requests
        if ("OPTIONS".equals(method)) {
            System.out.println("✅ Skipping OPTIONS request");
            filterChain.doFilter(request, response);
            return;
        }

        // ✅ Skip JWT check for public paths
        if (isPublicPath(path)) {
            System.out.println("✅ Public path, skipping JWT check: " + path);
            filterChain.doFilter(request, response);
            return;
        }

        System.out.println("🔐 Protected path, checking JWT: " + path);

        final String authHeader = request.getHeader("Authorization");
        System.out.println("📋 Authorization header: " + (authHeader != null ? "Present" : "Missing"));
        
        String username = null;
        String jwt = null;

        // Only process if we have a proper Authorization header
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
            System.out.println("🎫 JWT token extracted, length: " + jwt.length());
            
            try {
                username = jwtUtil.extractUsername(jwt);
                System.out.println("👤 Username extracted: " + username);
                
                // Check token expiration
                if (jwtUtil.isTokenExpired(jwt)) {
                    System.out.println("⏰ Token expired");
                    // Don't set authentication, let Spring Security handle it
                } else {
                    System.out.println("✅ Token is valid and not expired");
                    
                    // Validate token and set authentication
                    if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        if (jwtUtil.validateToken(jwt, username)) {
                            // Extract userId from token for additional context
                            Long userId = jwtUtil.extractUserId(jwt);
                            final String tokenUsername = username;
                            final String tokenValue = jwt;
                            String accessLevel = userRepository.findByUsername(tokenUsername)
                                .map(user -> user.getAccessLevel().name())
                                .orElseGet(() -> "demo".equalsIgnoreCase(tokenUsername)
                                    ? AccessLevel.ADMIN.name()
                                    : jwtUtil.extractAccessLevel(tokenValue));
                            System.out.println("🆔 User ID extracted: " + userId);
                            
                            // Create authentication token with user authorities
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
                            
                            // Add userId to the authentication details for easy access in controllers
                            request.setAttribute("userId", userId);
                            request.setAttribute("username", username);
                            request.setAttribute("accessLevel", accessLevel);
                            
                            SecurityContextHolder.getContext().setAuthentication(authToken);
                            System.out.println("✅ Authentication set successfully for user: " + username);
                        } else {
                            System.out.println("❌ Token validation failed");
                        }
                    }
                }
                
            } catch (Exception e) {
                System.out.println("❌ Token parsing error: " + e.getMessage());
                // Don't set authentication, let Spring Security handle the error
            }
        } else {
            System.out.println("❌ Missing or invalid Authorization header");
            // Don't set authentication, let Spring Security handle it
        }

        System.out.println("➡️ Proceeding to next filter/controller");
        filterChain.doFilter(request, response);
    }

    private boolean isPublicPath(String path) {
        return PUBLIC_PATHS.stream().anyMatch(publicPath -> 
            path.equals(publicPath) || path.startsWith(publicPath + "/")
        );
    }
}
