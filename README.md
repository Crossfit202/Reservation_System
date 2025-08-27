# Hotel Reservation System - Spring Boot Backend

This project is the backend for a hotel reservation platform, built with Java and Spring Boot. It includes user management, room management, reservation management, and payment processing via Stripe.

## Features
- OAuth2 authentication (Google, Facebook)
- Role-based access control (Guest, Admin, Manager)
- CRUD APIs for users, rooms, reservations, payments
- Stripe payment integration
- PostgreSQL database

## Getting Started
1. Ensure you have Java 17+, Maven, and PostgreSQL installed.
2. Clone this repository.
3. Configure your database settings in `src/main/resources/application.properties`.
4. Run `mvn spring-boot:run` to start the backend server.

## Project Structure
- `src/main/java/.../entity` - JPA entities
- `src/main/java/.../repository` - Spring Data repositories
- `src/main/java/.../service` - Business logic
- `src/main/java/.../controller` - REST controllers
- `src/main/java/.../config` - Security and app configuration

## Next Steps
- Implement entities and repositories
- Set up OAuth2 and Stripe integration
- Build REST APIs

---

For questions or issues, please contact the project maintainer.
