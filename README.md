# PS8 Complaint & Helpdesk Ticket System

A full-stack complaint and helpdesk ticketing system designed for customers to submit, track, and manage support issues, and for administrators to triage tickets, assign departments, manage departments, and monitor operational resolution metrics.

## 1. Project Purpose

The PS8 Helpdesk System streamlines communication between customers and support staff. Customers submit tickets with priorities and optional screenshots, engage in comment threads, and track resolution progress. Administrators oversee all incoming tickets across departments, update ticket lifecycle statuses, manage departmental categories, and view analytics on ticket volume, priorities, and average resolution times.

## 2. Implemented Features

### Authentication & Authorization
- Customer registration with name, email, and password.
- Secure password hashing using `bcryptjs`.
- Role-based access control with two roles: `customer` and `admin`.
- Protection against role escalation during registration (`role` defaults to `customer`).
- JWT-based authentication for protected backend routes.
- Automatic session restoration with local storage token persistence.

### Customer Ticket Operations
- Customer ticket list displaying only the authenticated customer's tickets (`/tickets`).
- Ticket creation form with Title, Category, Priority (Low, Medium, High), Description, and optional Screenshot URL (`/tickets/new`).
- Automatic generation of unique, human-readable ticket IDs (e.g., `TKT-1001`).
- Customer ticket detail view with complete ticket metadata and comment history (`/tickets/:id`).
- Ticket editing for editable fields (Title, Category, Priority, Description, Screenshot URL) when the ticket is Open or In Progress (`/tickets/:id/edit`).
- Restricted ticket reopening: A resolved ticket can be reopened exactly once by the customer. Repeated reopen requests or manual API bypasses are rejected.

### Ticket Comments
- Interactive comment thread on individual ticket pages.
- Access restricted to the ticket's customer or administrators.
- Real-time comment association with author name, role, and timestamps.
- Validation ensuring empty comments are rejected.

### Admin Ticket Management
- Centralized administration console viewing all tickets across customers (`/admin/tickets`).
- Filtering tickets by status (`Open`, `In Progress`, `Resolved`, `Closed`).
- Filtering tickets by priority (`Low`, `Medium`, `High`).
- Filtering tickets by department.
- Inline status updating and departmental reassignment.

### Department Management
- Dedicated administration interface (`/admin/departments`).
- Create departments with name and description.
- Edit existing department names and descriptions.
- Delete departments safely: any tickets referencing the deleted department have their department reference reset to `null` to prevent dangling references.

### Admin Dashboard & Analytics
- Live dashboard powered directly by MongoDB records (`/admin/dashboard`).
- Total ticket counts.
- Tickets grouped by status (`Open`, `In Progress`, `Resolved`, `Closed`).
- Tickets grouped by priority (`Low`, `Medium`, `High`).
- Resolution statistics: Total resolved tickets and average resolution time in hours computed from stored timestamps.
- Total active departments and registered customers.

### Schema Explanations
- `reopenCount`: Stored on the `Ticket` model (default: `0`). When a customer reopens a ticket with status `Resolved`, `reopenCount` increments to `1` and status transitions back to `Open`. If `reopenCount >= 1`, subsequent reopen attempts return HTTP 400.
- `timestamps: true`: Enabled on the `Ticket` model to record `createdAt` and `updatedAt`. This provides accurate ticket creation dates and enables average resolution time calculation (`updatedAt - createdAt` for resolved/closed tickets).

## 3. Technology Stack

- **Frontend**: React 19, Vite, React Router v7/v8, Plain CSS.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB Atlas with Mongoose.
- **Authentication**: JSON Web Tokens (`jsonwebtoken`).
- **Password Hashing**: `bcryptjs`.

## 4. Folder Structure

```text
ps8-helpdesk/
├── backend/
│   ├── app.js
│   ├── package.json
│   ├── package-lock.json
│   ├── seed.js
│   ├── .env
│   ├── .env.example
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authcontroller.js
│   │   ├── commentController.js
│   │   ├── dashboardController.js
│   │   ├── departmentController.js
│   │   └── ticketController.js
│   ├── middleware/
│   │   ├── allowRoles.js
│   │   ├── allowrules.js
│   │   ├── authHandler.js
│   │   └── authhandler.js
│   ├── models/
│   │   ├── comment.js
│   │   ├── department.js
│   │   ├── ticket.js
│   │   └── user.js
│   └── routes/
│       ├── authroutes.js
│       ├── dashboard.js
│       ├── departmentRoutes.js
│       └── ticketRoutes.js
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       ├── api.js
│       ├── components/
│       │   ├── Navbar.jsx
│       │   └── ProtectedRoute.jsx
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   ├── authContextInstance.js
│       │   └── useAuth.js
│       └── pages/
│           ├── AdminDashboard.jsx
│           ├── AdminDepartments.jsx
│           ├── AdminTicketList.jsx
│           ├── CreateTicket.jsx
│           ├── CustomerTicketList.jsx
│           ├── EditTicket.jsx
│           ├── Login.jsx
│           ├── NotFound.jsx
│           ├── Register.jsx
│           └── TicketDetails.jsx
├── .gitignore
└── README.md
```

## 5. Prerequisites

- Node.js (v18.0.0 or higher, tested with Node.js v26)
- npm (v9.0.0 or higher)
- Active internet connection for MongoDB Atlas access

## 6. Backend Installation Commands

Navigate to the `backend` folder and install dependencies:

```bash
cd backend
npm install
```

## 7. Frontend Installation Commands

Navigate to the `frontend` folder and install dependencies:

```bash
cd frontend
npm install
```

## 8. Environment Variable Configuration

Create a `.env` file in the `backend/` directory using `backend/.env.example` as a template:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
```

Optional frontend environment configuration:
To point the frontend to a non-default API URL, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

## 9. MongoDB Atlas Setup

1. Log in to [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create or select a cluster.
3. In **Database Access**, create a database user with read/write privileges.
4. In **Network Access**, whitelist your IP address (or `0.0.0.0/0` for development).
5. Retrieve your connection string from **Database** > **Connect** > **Drivers**.
6. Set `MONGO_URI` in `backend/.env` with your username, password, and database name.

## 10. Database Seed Instructions

To populate the database with sample users, departments, at least 10 tickets, and initial comments:

```bash
cd backend
npm run seed
```

This creates:
- 1 Admin user (`admin@example.com`)
- 2 Customer users (`customer1@example.com`, `customer2@example.com`)
- 4 Departments (`Technical Support`, `Billing & Accounts`, `Customer Service`, `IT Infrastructure`)
- 12 Sample tickets across all statuses (`Open`, `In Progress`, `Resolved`, `Closed`) and priorities (`Low`, `Medium`, `High`)
- Initial ticket comments

## 11. Commands to Start Backend and Frontend

### Start the Backend Server
```bash
cd backend
npm start
```
The backend server runs on `http://localhost:3000`.

### Start the Frontend Dev Server
```bash
cd frontend
npm run dev
```
The frontend dev server runs on `http://localhost:5173`.

## 12. Application Routes and Role Permissions

### Frontend Routes
| Route | Role Permission | Purpose |
| --- | --- | --- |
| `/login` | Public | User authentication |
| `/register` | Public | Customer account registration |
| `/tickets` | Customer | Customer ticket dashboard |
| `/tickets/new` | Customer | Submit new support ticket |
| `/tickets/:id` | Customer / Admin | View ticket details and comments |
| `/tickets/:id/edit` | Customer / Admin | Edit ticket fields |
| `/admin/tickets` | Admin | Manage all tickets and filters |
| `/admin/departments` | Admin | Manage department master list |
| `/admin/dashboard` | Admin | System analytics and resolution metrics |

### Backend API Endpoints
| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | Service health verification |
| `POST` | `/api/auth/register` | Public | Customer registration |
| `POST` | `/api/auth/login` | Public | User authentication & JWT generation |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |
| `GET` | `/api/tickets` | Authenticated | List tickets (filtered by role and query params) |
| `POST` | `/api/tickets` | Authenticated | Create a new ticket |
| `GET` | `/api/tickets/:id` | Owner / Admin | Retrieve ticket by ID |
| `PUT` | `/api/tickets/:id` | Owner / Admin | Update ticket fields |
| `PATCH` | `/api/tickets/:id/status` | Admin | Update ticket status |
| `PATCH` | `/api/tickets/:id/assign` | Admin | Assign department |
| `POST` | `/api/tickets/:id/reopen` | Owner / Admin | Reopen resolved ticket (1-time maximum) |
| `GET` | `/api/tickets/:id/comments` | Owner / Admin | List ticket comments |
| `POST` | `/api/tickets/:id/comments` | Owner / Admin | Post ticket comment |
| `GET` | `/api/departments` | Authenticated | List all departments |
| `POST` | `/api/departments` | Admin | Create department |
| `PUT` | `/api/departments/:id` | Admin | Update department |
| `DELETE` | `/api/departments/:id` | Admin | Delete department and clear ticket references |
| `GET` | `/api/dashboard` | Admin | Fetch system analytics |

## 13. How to Run Frontend Checks and Production Build

### Run Frontend Linter
```bash
cd frontend
npm run lint
```

### Run Frontend Production Build
```bash
cd frontend
npm run build
```
Build output is generated in `frontend/dist/`.

## 14. Sample Local Testing Credentials

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@example.com` | `admin123` |
| Customer 1 | `customer1@example.com` | `customer123` |
| Customer 2 | `customer2@example.com` | `customer123` |

## 15. Deployment Instructions

### Backend Deployment (e.g. Render, Railway, AWS)
1. Configure environment variables in the host dashboard: `PORT`, `MONGO_URI`, and `JWT_SECRET`.
2. Build command: `npm install`.
3. Start command: `node app.js`.
4. Ensure CORS settings allow requests from your deployed frontend origin.

### Frontend Deployment (e.g. Vercel, Netlify)
1. Set the root directory to `frontend`.
2. Build command: `npm run build`.
3. Output directory: `dist`.
4. Configure environment variable `VITE_API_URL` pointing to your deployed backend URL.

## 16. Limitations

- Tickets accept external image URLs for screenshots; direct binary multipart file uploads are not part of the project specification.
- Email notifications are not configured as per the project specification.
- Offline browser automation via Playwright requires an internet connection to download local browser binaries in sandboxed test environments; however, all application functionality is verified via automated test suites and live dev servers.
