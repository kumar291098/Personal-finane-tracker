package com.finance.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        
        System.out.println("🚫 Authentication failed: " + authException.getMessage());
        System.out.println("📍 Request URI: " + request.getRequestURI());
        System.out.println("🔑 Authorization header: " + request.getHeader("Authorization"));
        
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"Authentication required\",\"message\":\"" + authException.getMessage() + "\"}");
        response.getWriter().flush();
    }
}