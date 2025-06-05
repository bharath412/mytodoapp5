# ====== FRONTEND BUILD ======
FROM node:20 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build -- --configuration=production

# ====== BACKEND BUILD ======
FROM maven:3.9.6-eclipse-temurin-21 AS backend-build
WORKDIR /app
COPY backend/pom.xml backend/pom.xml
COPY backend/src backend/src
# Copy built frontend to backend static resources
COPY --from=frontend-build /app/frontend/dist/frontend/ backend/src/main/resources/static/
RUN mvn -f backend/pom.xml clean package -DskipTests

# ====== RUNTIME ======
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=backend-build /app/backend/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

