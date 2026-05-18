package com.finance.config;

import java.net.URI;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisPassword;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;

@Configuration
public class RedisConfig {

    @Bean
    @ConditionalOnExpression("'${app.redis.url:}' != ''")
    public LettuceConnectionFactory redisConnectionFactory(@Value("${app.redis.url}") String redisUrl) {
        URI uri = URI.create(redisUrl);
        RedisStandaloneConfiguration redisConfiguration = new RedisStandaloneConfiguration();
        redisConfiguration.setHostName(uri.getHost());
        redisConfiguration.setPort(uri.getPort() == -1 ? 6379 : uri.getPort());

        String userInfo = uri.getUserInfo();
        if (userInfo != null && !userInfo.isBlank()) {
            String[] parts = userInfo.split(":", 2);
            if (parts.length == 2 && !parts[1].isBlank()) {
                redisConfiguration.setPassword(RedisPassword.of(parts[1]));
            } else if (parts.length == 1 && !parts[0].isBlank()) {
                redisConfiguration.setPassword(RedisPassword.of(parts[0]));
            }
        }

        LettuceClientConfiguration.LettuceClientConfigurationBuilder clientBuilder =
                LettuceClientConfiguration.builder();
        if ("rediss".equalsIgnoreCase(uri.getScheme())) {
            clientBuilder.useSsl();
        }

        return new LettuceConnectionFactory(redisConfiguration, clientBuilder.build());
    }
}
