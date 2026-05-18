package com.finance.monitoring;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Component;

@Component
public class AiCacheMetrics {
    private final Counter cacheRequests;
    private final Counter cacheHits;
    private final Counter cacheMisses;
    private final Counter cacheErrors;
    private final Counter cacheDisabled;
    private final Counter cachePuts;
    private final Counter databaseCalls;
    private final Counter databaseLoads;
    private final Counter estimatedSavedMs;
    private final Timer cacheLookupTimer;
    private final Timer databaseLoadTimer;
    private final AtomicLong lastDatabaseLoadMs = new AtomicLong();

    public AiCacheMetrics(MeterRegistry meterRegistry) {
        this.cacheRequests = Counter.builder("finance.ai.context.cache.requests")
                .description("AI context cache lookup attempts")
                .register(meterRegistry);
        this.cacheHits = Counter.builder("finance.ai.context.cache.hits")
                .description("AI context cache hits")
                .register(meterRegistry);
        this.cacheMisses = Counter.builder("finance.ai.context.cache.misses")
                .description("AI context cache misses")
                .register(meterRegistry);
        this.cacheErrors = Counter.builder("finance.ai.context.cache.errors")
                .description("AI context cache lookup or write errors")
                .register(meterRegistry);
        this.cacheDisabled = Counter.builder("finance.ai.context.cache.disabled")
                .description("AI context cache lookups skipped because Redis is not configured")
                .register(meterRegistry);
        this.cachePuts = Counter.builder("finance.ai.context.cache.puts")
                .description("AI context payloads written to cache")
                .register(meterRegistry);
        this.databaseCalls = Counter.builder("finance.ai.context.database.calls")
                .description("Repository calls used to build AI context after cache miss")
                .register(meterRegistry);
        this.databaseLoads = Counter.builder("finance.ai.context.database.loads")
                .description("AI context database load operations after cache miss")
                .register(meterRegistry);
        this.estimatedSavedMs = Counter.builder("finance.ai.context.cache.estimated_saved_ms")
                .baseUnit("milliseconds")
                .description("Estimated database time saved by cache hits")
                .register(meterRegistry);
        this.cacheLookupTimer = Timer.builder("finance.ai.context.cache.lookup.duration")
                .description("AI context cache lookup duration")
                .publishPercentileHistogram()
                .register(meterRegistry);
        this.databaseLoadTimer = Timer.builder("finance.ai.context.database.load.duration")
                .description("AI context database load duration after cache miss")
                .publishPercentileHistogram()
                .register(meterRegistry);

        meterRegistry.gauge(
                "finance.ai.context.database.last_load_ms",
                lastDatabaseLoadMs,
                AtomicLong::get
        );
    }

    public void recordCacheHit(long durationNanos) {
        cacheRequests.increment();
        cacheHits.increment();
        cacheLookupTimer.record(durationNanos, TimeUnit.NANOSECONDS);

        long savedMs = lastDatabaseLoadMs.get();
        if (savedMs > 0) {
            estimatedSavedMs.increment(savedMs);
        }
    }

    public void recordCacheMiss(long durationNanos) {
        cacheRequests.increment();
        cacheMisses.increment();
        cacheLookupTimer.record(durationNanos, TimeUnit.NANOSECONDS);
    }

    public void recordCacheDisabled(long durationNanos) {
        cacheRequests.increment();
        cacheDisabled.increment();
        cacheLookupTimer.record(durationNanos, TimeUnit.NANOSECONDS);
    }

    public void recordCacheError(long durationNanos) {
        cacheRequests.increment();
        cacheErrors.increment();
        cacheLookupTimer.record(durationNanos, TimeUnit.NANOSECONDS);
    }

    public void recordCachePut() {
        cachePuts.increment();
    }

    public void recordDatabaseLoad(long durationNanos, int repositoryCalls) {
        long durationMs = TimeUnit.NANOSECONDS.toMillis(durationNanos);
        lastDatabaseLoadMs.set(durationMs);
        databaseLoads.increment();
        databaseCalls.increment(repositoryCalls);
        databaseLoadTimer.record(durationNanos, TimeUnit.NANOSECONDS);
    }
}
