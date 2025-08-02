# Parcel Delivery API

## Project Overview

The Parcel Delivery API is a secure, modular, and role-based backend system inspired by courier platforms like Pathao Courier and Sundarban. Built with **Express.js**, **TypeScript**, and **MongoDB (Mongoose)**, it enables senders to create and manage parcel deliveries, receivers to track and confirm delivery, and admins to oversee and control the entire delivery ecosystem.

### Key Objectives
- Provide JWT-based authentication with three distinct roles: **admin**, **sender**, and **receiver**.
- Enforce role-based authorization so that each actor can only perform permitted operations.
- Maintain full auditability of parcel status changes via embedded **status logs**.
- Support parcel creation, status tracking, cancellation, delivery confirmation, and administrative controls in a robust, extensible API.

### Technology Stack
- **Runtime / Server:** Node.js, Express.js
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Password Security:** bcrypt hashing
- **Deployment:** (e.g., Vercel / your chosen platform)
- **Testing / Exploration:** Postman collection

### Core Features
- **User Roles & Authentication**
  - JWT-based login for `admin`, `sender`, and `receiver`.
  - Secure password hashing with bcrypt.
  - Role-aware middleware to guard endpoints.

- **Parcel Management**
  - Parcel creation (typically by senders) with automatic fee calculation.
  - Unique, human-readable tracking ID (`TRK-YYYYMMDD-XXXXXX`).
  - Embedded `statusLogs` array capturing every change (status, who updated, when, optional location/note).
  - Flags for lifecycle control: canceled, returned, blocked, held, delivered.

- **Status Flow & Permissions**
  - **Valid status transitions** enforced:
    - Sender: can cancel only if current status is `Requested`.
    - Receiver: can mark from `In Transit` → `Delivered`.
    - Admin/Super Admin: can modify almost any field and change status (with side effects, e.g., setting delivery timestamp).
  - Automatic setting of `actualDeliveryDate` when a parcel is delivered.

- **Search, Filtering & Pagination**
  - Filter parcels by status, role ownership (sender/receiver), and other query parameters.
  - Full-text-like search over fields such as tracking ID, title, and receiver details.
  - Sorting, field selection, and paginated responses.

- **Auditability**
  - Every update (field change or status change) appends a descriptive entry to `statusLogs` so history is preserved.

- **Fee Calculation**
  - Base fee augmented by weight and dimensional weight.
  - Extensible logic for future distance-based or promotional pricing.

- **Admin Controls**
  - View/manage all parcels and users.
  - Block or unblock users or parcels.
  - Override statuses and assignment.

### Sample Actors & Permissions
| Role      | Can Create Parcel | Can Cancel | Can Update Status | Can View All Parcels | Can Override Any Field |
|-----------|-------------------|------------|-------------------|----------------------|------------------------|
| Sender    | ✅                | ✅ (if Requested) | ❌ (only cancel)     | ✅ (own only)         | ❌                     |
| Receiver  | ❌                | ❌         | ✅ (In Transit → Delivered) | ✅ (incoming only)    | ❌                     |
| Admin      | ✅                | ✅         | ✅                 | ✅ (all)              | ✅                     |

### API Design Highlights
- `POST /parcels` — Create a new parcel (typically by sender)
- `GET /parcels/me` — Get parcels relevant to current user (sender/receiver) with filters
- `PATCH /parcels/:id` — Update parcel fields or status according to role rules
- Authentication endpoints: login/register with role assignment
- Status tracking is embedded; fetching a parcel returns the full history in `statusLogs`

### Response Consistency
All endpoints return structured responses with:
```json
{
  "success": true,
  "message": "...",
  "data": { ... },
  "meta": { ... } // when applicable (pagination, totals)
}
