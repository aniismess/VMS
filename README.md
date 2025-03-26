# Sri Sathya Sai Seva Organisation - Volunteer Management System

A modern, full-stack web application for managing volunteers at the Sri Sathya Sai Seva Organisation. Built with Next.js, TypeScript, and Supabase.

![Sri Sathya Sai Logo](https://ssssompcg.org/assets/images/sd5-464x464.jpg)

## Features

- 🔐 **Authentication System**
  - Secure login/signup with Supabase Auth
  - Role-based access control
  - Protected routes

- 👥 **Volunteer Management**
  - Add, edit, and delete volunteer records
  - Track volunteer status (Active, Registered, Cancelled)
  - Bulk import volunteers via Excel/CSV
  - Search and filter volunteers

- 📊 **Dashboard**
  - Real-time statistics
  - Quick overview of volunteer statuses
  - Recent volunteer activities
  - Export data to Excel

- 🎨 **Modern UI/UX**
  - Responsive design
  - Dark/Light mode support
  - Bilingual support (English/Hindi)
  - Toast notifications
  - Loading states and error handling

## Tech Stack

- **Frontend:**
  - Next.js 14 (App Router)
  - TypeScript
  - Tailwind CSS
  - Shadcn/ui components
  - React Query for data fetching
  - XLSX for Excel handling

- **Backend:**
  - Supabase (PostgreSQL)
  - Supabase Auth
  - Real-time subscriptions

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- Supabase account
- Git

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/volunteer-management-system.git
   cd volunteer-management-system
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up your environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Volunteers Table
```sql
create table volunteers_volunteers (
  sai_connect_id text primary key,
  full_name text,
  age integer,
  mobile_number text,
  aadhar_number text,
  gender text,
  sss_district text,
  samiti_or_bhajan_mandli text,
  education text,
  special_qualifications text,
  sevadal_training_certificate boolean default false,
  past_prashanti_service boolean default false,
  last_service_location text,
  other_service_location text,
  prashanti_arrival timestamp with time zone,
  prashanti_departure timestamp with time zone,
  duty_point text,
  is_cancelled boolean default false,
  created_by_id uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

### Registered Volunteers Table
```sql
create table registered_volunteers (
  sai_connect_id text primary key references volunteers_volunteers(sai_connect_id),
  batch text,
  service_location text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

## Usage

### Admin Login
1. Navigate to `/login`
2. Enter your admin credentials
3. Access the dashboard and volunteer management features

### Managing Volunteers

#### Adding a New Volunteer
1. Click "Add Volunteer" in the sidebar
2. Fill in the volunteer details
3. Submit the form

#### Importing Volunteers
1. Click "Upload Volunteer Data" card
2. Select an Excel/CSV file
3. The system will process and import the data

#### Updating Volunteer Status
1. Navigate to the volunteers list
2. Use the dropdown menu for each volunteer
3. Select the desired action (Edit, Cancel, Delete)

### Dashboard Features
- View total volunteers count
- Track active, registered, and cancelled volunteers
- Search and filter volunteers
- Export data to Excel

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Sri Sathya Sai Seva Organisation
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## Support

For support, please contact the system administrator or create an issue in the repository.

---

Made with ❤️ for Sri Sathya Sai Seva Organisation
