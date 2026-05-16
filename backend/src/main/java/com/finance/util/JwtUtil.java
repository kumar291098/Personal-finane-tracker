package com.finance.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final String SECRET = "uL5drT9t2yU7LgfWe9KrFbWpEqpUvMNs"; // must be at least 256 bits for HS256

    private final long EXPIRATION_TIME = 86400000; // 24 hours (86400000 milliseconds)

    private final Key key = Keys.hmacShaKeyFor(SECRET.getBytes());

    public String generateToken(String username, Long userId) {
        return generateToken(username, userId, "FREE");
    }

    public String generateToken(String username, Long userId, String accessLevel) {
        return Jwts.builder()
                .setSubject(username)
                .claim("userId", userId)
                .claim("accessLevel", accessLevel)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims extractClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
    }

    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    public Long extractUserId(String token) {
        return extractClaims(token).get("userId", Long.class);
    }

    public String extractAccessLevel(String token) {
        String accessLevel = extractClaims(token).get("accessLevel", String.class);
        return accessLevel == null || accessLevel.isBlank() ? "FREE" : accessLevel;
    }

    public boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }

    public boolean validateToken(String token, String username) {
        return extractUsername(token).equals(username) && !isTokenExpired(token);
    }
}
