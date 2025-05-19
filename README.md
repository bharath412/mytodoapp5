# My Fullstack Application

A modern fullstack application built with Spring Boot and Angular.

## Project Structure

```
my-fullstack-app/
├── backend/                          # Spring Boot project REST API
│   ├── src/
│   ├── pom.xml
│   └── ...
├── frontend/                         # Angular project + Tailwind CSS + Vite
│   ├── src/
│   ├── angular.json
│   ├── package.json
│   └── ...
```

## Backend (Spring Boot)

The backend is built with Spring Boot and provides a RESTful API.

### Features

- Spring Boot 3.2.0
- Spring Security with JWT authentication
- Spring Data JPA
- H2 in-memory database (for development)
- REST API endpoints

### Running the Backend

Navigate to the `backend` directory and run:

```bash
./mvnw spring-boot:run
```

The backend server will start on http://localhost:8080.

## Frontend (Angular)

The frontend is built with Angular and uses Tailwind CSS for styling with Vite as the build tool.

### Features

- Angular 17
- Tailwind CSS
- Vite
- Responsive design
- Standalone components

### Running the Frontend

Navigate to the `frontend` directory and run:

```bash
npm install
npm start
```

The frontend server will start on http://localhost:4200.

## Development

### Backend Development

- API endpoints are defined in controller classes
- Models are defined as JPA entities
- Spring Security provides authentication and authorization
- H2 database is used for development (can be replaced with any SQL database)

### Frontend Development

- Angular standalone components
- Tailwind CSS for styling
- Responsive design
- Services for API communication
- Lazy-loaded routes

## Building for Production

### Backend

```bash
./mvnw clean package
```

### Frontend

```bash
npm run build
```

The frontend build output will be in the `dist/frontend` directory.
