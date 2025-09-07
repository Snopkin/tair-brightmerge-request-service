# ---------- 1) UI build ----------
FROM node:20-alpine AS ui
WORKDIR /ui

COPY ui/brightmerge-ui/package*.json ./
RUN npm ci

COPY ui/brightmerge-ui/ ./
RUN npm run build
# Vite outputs to /ui/dist by default

# ---------- 2) Backend build ----------
FROM gradle:8.14.3-jdk21-alpine AS build
WORKDIR /app

# Bring project sources
COPY . .

# Replace Spring's static dir with the built UI (copying from the *ui* stage)
RUN rm -rf src/main/resources/static
COPY --from=ui /ui/dist/ /app/src/main/resources/static/

# Build the Spring Boot jar
RUN set -eux; \
    if [ -f ./gradlew ]; then \
      chmod +x ./gradlew; ./gradlew --no-daemon clean bootJar -x test; \
    else \
      gradle --no-daemon clean bootJar -x test; \
    fi; \
    echo "Built jars:" && ls -la build/libs && \
    cp "$(ls build/libs/*.jar | head -n1)" /tmp/app.jar

# ---------- 3) Runtime ----------
FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app

COPY --from=build /tmp/app.jar /app/app.jar

ENV SERVER_PORT=4141
EXPOSE 4141
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -Dfile.encoding=UTF-8"

CMD ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar --server.port=${SERVER_PORT}"]