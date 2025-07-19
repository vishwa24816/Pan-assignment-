# EdTech Assignment Tracker: System Design

## 1. System Architecture

The system will be a monolithic application with a client-server architecture.

*   **Backend:** A Python-based web framework (Flask) will serve a RESTful API.
*   **Database:** A relational database (SQLite for development, PostgreSQL for production) will store all data.
*   **Frontend:** A simple single-page application (SPA) built with HTML, CSS, and JavaScript will consume the API.
*   **Authentication:** JSON Web Tokens (JWT) will be used for securing the API endpoints.

This architecture is simple to develop, deploy, and maintain for the initial prototype.

## 2. Core Entities and Relationships

The core entities of the system are `User`, `Assignment`, and `Submission`.

| Entity       | Attributes                                     | Description                               |
|--------------|------------------------------------------------|-------------------------------------------|
| **User**     | `id`, `username`, `password_hash`, `role`      | Represents a user of the system.          |
|              |                                                | `role` can be 'teacher' or 'student'.     |
| **Assignment**| `id`, `title`, `description`, `due_date`, `teacher_id` | Represents an assignment created by a teacher. |
| **Submission**| `id`, `assignment_id`, `student_id`, `content`, `submission_date` | Represents a student's submission for an assignment. |

### Relationships:

*   A **User** (teacher) can create multiple **Assignments**. (One-to-Many)
*   A **User** (student) can have multiple **Submissions**. (One-to-Many)
*   An **Assignment** can have multiple **Submissions**. (One-to-Many)

## 3. API Endpoints

All endpoints will be prefixed with `/api`.

### Authentication

*   `POST /auth/signup`: Create a new user (student or teacher).
*   `POST /auth/login`: Authenticate a user and receive a JWT.

### Assignments

*   `POST /assignments`: Create a new assignment (teacher only).
*   `GET /assignments`: Get a list of all assignments.
*   `GET /assignments/<id>`: Get details of a specific assignment.

### Submissions

*   `POST /assignments/<id>/submit`: Submit to an assignment (student only).
*   `GET /assignments/<id>/submissions`: View all submissions for an assignment (teacher only).

## 4. Authentication Strategy

*   **Roles:** The system will have two roles: `teacher` and `student`.
*   **JWT:** After a successful login, the server will issue a JWT containing the user's ID and role.
*   **Authorization:** API endpoints will be protected based on the user's role, which is extracted from the JWT. For example, creating an assignment will require a `teacher` role.

## 5. Future Scaling

*   **Microservices:** The monolithic application can be broken down into microservices (e.g., user service, assignment service, submission service).
*   **Database Scaling:** The database can be scaled by using read replicas, sharding, or moving to a more scalable database solution like a distributed SQL database.
*   **Load Balancing:** A load balancer can be introduced to distribute traffic across multiple instances of the application.
*   **Caching:** A caching layer (e.g., Redis) can be used to cache frequently accessed data.
*   **Asynchronous Tasks:** For tasks like processing large file uploads or sending notifications, a task queue (e.g., Celery with RabbitMQ or Redis) can be implemented.
