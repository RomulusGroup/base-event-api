# Backend API Documentation

## Overview
This is a monolithic NestJS API for the Base Sports Ticketing system. It manages events, registrations, and asynchronous ticket generation via BullMQ.

## API Endpoints

### Public RSVP
- `POST /api/v1/events/rsvp`
  - Register for an event.
  - Requires: `fullName`, `email`, `phoneNumber`, `eventId`, `isAttending`, `bringingPlusOne`, `plusOneName` (conditional).
  - Returns: `201 Created` with `ticketNumber` and `qrCode` (Base64).

### Admin Management
- `GET /api/v1/admin/dashboard`
  - Get overall statistics (total events, total attendees).
- `GET /api/v1/admin/events`
  - List all events.
- `POST /api/v1/admin/events`
  - Create a new event.
  - Form Data: `title`, `description`, `date`, `location`, `maxCapacity`, `ticketPrefix`, `flyer` (file).
- `GET /api/v1/admin/events/:id/attendees`
  - List all attendees for a specific event.

## Database & Migrations
- **TypeORM**: Used for MySQL interaction.
- **Migrations**: Required for schema updates.
  - `npm run migration:generate`
  - `npm run migration:run`
- **Seeding**:
  - `npm run seed` (Populates initial event data).

## Asynchronous Workers
- **Queue**: `email-queue`
- **Jobs**: `dispatch_rsvp_email`
  - Sends a confirmation email with an embedded QR code using the Resend SDK.
