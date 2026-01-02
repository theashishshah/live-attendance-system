# Technical Design Document

**Project:** Live Learning Management System (LLMS)  
**Version:** v1  
**Author:** Ashish Shah
**Status:** Draft

---

## 1. Overview

This document describes the technical design for LLMS v1, a real-time learning system where teachers create live classes and students join via links. The system supports live participation visibility, comments, and attendance tracking, without video storage.

The design prioritizes:

-   Horizontal scalability
-   Stateless backend services
-   Real-time correctness
-   Strong invariants

---

## 2. Goals & Non-Goals

### Goals

-   Support up to 1M concurrent users
-   Support up to 1M concurrent live classes
-   Enforce single active class per user
-   Track attendance accurately
-   Provide live participant counts and comments

### Non-Goals (V1)

-   Video streaming & recording
-   Chat moderation
-   Notifications
-   Payments
-   Persistent media storage

## 3. High-Level Architecture

```pgsql
Clients (Web (for now)/ Mobile)
        |
        |  REST (Auth, Class Metadata)
        v
API Gateway / Load Balancer
        |
        v
Stateless API Servers (Node.js)
        |
        |---- MongoDB (Users, Classes, Attendance)
        |
        |---- Redis Cluster (Presence, Capacity, Locks)
        |
        v
WebSocket Gateway (ws)
        |
        v
Redis Pub/Sub (Fan-out events)
```

## 4. Core Concepts & Invariants

### 4.1 User Capability Model

Users have **capabilities**, not fixed identities.

```ts
User {
  id
  email
  capabilities: ["TEACHER", "STUDENT"]
}
```

A user’s **current activity state** determines behavior, not their role.

---

### 4.2 Single Active Class Invariant

A user can be active in **only one live class at a time**.

This invariant is enforced via **atomic operations in Redis**, not via database locks.

## 5. Data Models (Persistent)

### 5.1 User (MongoDB)

```ts
User {
  _id
  name
  email
  passwordHash
  capabilities
  createdAt
}
```

---

### 5.2 Class (MongoDB)

```ts
Class {
  _id
  title
  createdBy (userId)
  capacity
  status: CREATED | LIVE | ENDED
  createdAt
  startedAt?
  endedAt?
}

```

---

### 5.3 Attendance (MongoDB)

```ts
Attendance {
  _id
  userId
  classId
  joinedAt
  leftAt
  durationSeconds
}
```

Attendance is written **once**, after class exit or class end.

---

## 6. Real-Time State (Ephemeral)

### 6.1 Redis Presence Model

#### User Presence

```
user:{userId}:activeClass -> classId (TTL)
```

#### Class Presence

```
class:{classId}:participants -> Set<userId>
class:{classId}:capacity -> number
```

TTL ensures crash recovery.

---

## 7. Join Class Flow (Critical Path)

1. **Join Request**
2. **Validate class exists & is LIVE**
3. **Atomically set:**
    ```
    SET user:{userId}:activeClass classId NX EX 30
    ```
    - If step 3 fails → reject (already active)
4. **Check capacity**
5. **Add user to:**
    ```
    SADD class:{classId}:participants userId
    ```
6. **Broadcast updated count via WebSocket**

---

## 8. Teacher Constraints

-   When a teacher starts a class, they are marked active
-   **Active teachers:**
    -   Cannot create another class
    -   Cannot join any class (including their own)
-   Same invariant applies to students and teachers
-   No special-case logic.

---

## 9. WebSocket Design

### Connection

```
ws://server/ws?token=JWT
```

### Events

| Event             | Direction       | Purpose             |
| ----------------- | --------------- | ------------------- |
| JOIN_CLASS        | Client → Server | Join live class     |
| LEAVE_CLASS       | Client → Server | Leave class         |
| HEARTBEAT         | Client → Server | Presence keep-alive |
| PARTICIPANT_COUNT | Server → Client | Live count          |
| COMMENT           | Bidirectional   | Live comments       |

WebSocket server is stateless; Redis is source of truth.

---

## 10. Attendance Lifecycle

1. User joins class → `joinedAt`
2. User leaves / disconnects → `leftAt`
3. Duration computed
4. Record persisted to MongoDB

**No attendance is written during live session.**

---

## 11. Authentication

### Auth Model

Authentication is **cookie-based**, using short-lived access tokens and rotating refresh tokens.

### Tokens

-   **Access Token**

    -   JWT
    -   Short-lived (e.g., 10–15 minutes)
    -   Stored in **HttpOnly, Secure cookie**

-   **Refresh Token**
    -   Long-lived
    -   Rotated on each use
    -   Stored **hashed** in database
    -   Stored in **HttpOnly, Secure cookie**

### Cookie Attributes

-   `HttpOnly` — prevents JS access (mitigates XSS)
-   `Secure` — HTTPS only
-   `SameSite=Strict` (or `Lax` if cross-site needed)
-   Path-scoped where possible

---

### HTTP Authentication

-   Cookies are automatically sent with each request
-   No Authorization headers used

---

### WebSocket Authentication

-   WebSocket handshake includes cookies automatically
-   Authentication is performed during connection upgrade
-   Server validates access token from cookies
-   Auth context is bound to the WebSocket connection

---

### CSRF Protection

-   State-changing requests require CSRF token
-   CSRF token is:
    -   Generated per session
    -   Stored server-side or signed
    -   Sent via custom header (e.g., `X-CSRF-Token`)
-   WebSocket connections are protected via:
    -   SameSite cookies
    -   Origin validation during handshake

---

### Logout

-   Refresh token is invalidated server-side
-   Cookies are cleared

## 12. Error Handling

-   All errors use centralized `AppError`
-   All responses use standard envelope with `sendRespones` and `sendFailure`
-   Error codes are stable and machine-readable

---

## 13. Scalability Considerations

| Concern          | Solution              |
| ---------------- | --------------------- |
| 1M users         | Stateless API + Redis |
| Presence         | TTL-based locks       |
| Fan-out          | Redis Pub/Sub         |
| Failures         | Auto cleanup via TTL  |
| Horizontal scale | No in-memory state    |

---

## 14. Tradeoffs & Decisions

### Why Redis for presence?

-   Atomic ops
-   TTL
-   Low latency

### Why not DB for attendance during live?

-   DB contention
-   Latency
-   Not needed for real-time truth

---

## 15. Future Work (Post V1)

-   Video streaming
-   Moderation
-   Notifications
-   Analytics
-   Recording
