# Multi-stage build for Java backend
# Stage 1: Build
FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /build

# Copy pom.xml
COPY pom.xml .

# Download dependencies (this layer can be cached)
RUN mvn dependency:resolve

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy jar from build stage
COPY --from=build /build/target/finance-tracker-*.jar app.jar

# Expose port
EXPOSE 8080

# Set environment variables for DB connection
ENV SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/finance_tracker
ENV SPRING_DATASOURCE_USERNAME=postgres
ENV SPRING_DATASOURCE_PASSWORD=root
ENV SPRING_JPA_HIBERNATE_DDL_AUTO=update

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
