# PRD: Live Learning System (V1)

Enable teachers to create live classes and students to join them in real time, with live participation visibility, attendance tracking, and basic interaction — without video storage.

---

## User

-   Can sign up with a selected role: **teacher** or **student**
-   Role can be changed later via dashboard
-   A user may act as both teacher and student over time

---

## Teacher Capabilities

1. Create a live class by providing:
    - Class title
    - Maximum class size (capacity)
2. Generate a sharable class link
3. Start and end a class session
4. View all classes created by them with:
    - Title
    - Created date & time
    - Total attendees (unique)
    - Max class size
    - Class duration
5. If class is created by him, then he can’t join own class as well as others class at the same time.
6. View live count of participants during a class
7. Take class via sharing screen, screen audio and mic audio.

---

## Student Capabilities

1. Join a live class using a class link
2. View class details:
    - Title
    - Teacher name
    - Total attendees
    - Class duration
3. View all classes they have attended
4. Participate via live comments

---

## System Rules & Constraints

1. A user can be active in only one live class at a time
2. A class cannot exceed its configured capacity
3. Only users with a valid class link can join a class
4. Class participation is real-time and ephemeral (not stored as video)

---

## Live Features (Real-time)

1. Live participant count
2. Live comments stream
3. Live attendance tracking
4. Presence detection (join / leave / disconnect)

---

## Attendance

-   Attendance is recorded automatically when a user joins a class
-   Attendance ends when:
    -   User leaves the class
    -   Class ends
-   Attendance record includes:
    -   User ID
    -   Class ID
    -   Join timestamp
    -   Leave timestamp
    -   Duration attended

---

## Out of Scope (V1)

-   Video streaming & recording
-   Chat moderation
-   Notifications
-   Payments
-   Course materials
-   Whiteboard
-   Talk to attendees in live

---

## Scale Requirements (Non-functional)

-   Support up to 1M concurrent users
-   Support up to 1M concurrent live classes
-   Horizontal scalability
-   Stateless backend services
