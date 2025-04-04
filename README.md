# Volunteer Management System

A comprehensive system for managing volunteers for Sri Sathya Sai Seva Organisations. Built with Next.js, Supabase, and Tailwind CSS.

## Features

- Admin Authentication & Management
- Volunteer Registration & Management
- Real-time Updates
- Dark Mode Support
- Mobile Responsive Design
- Excel Upload/Download
- Comprehensive Dashboard

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript
- **Styling:** Tailwind CSS, Shadcn/ui
- **Backend:** Supabase (Auth, Database)
- **State Management:** React Context
- **Deployment:** Vercel

## Deployment Instructions

1. **Prerequisites**
   - A Vercel account
   - A Supabase project
   - Git installed on your machine

2. **Environment Variables**
   Required environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Deploy to Vercel**
   - Fork this repository
   - Go to [Vercel](https://vercel.com)
   - Create a new project
   - Import your forked repository
   - Add the environment variables
   - Deploy!

4. **Post-Deployment**
   - Set up your first admin user in Supabase
   - Configure authentication settings in Supabase
   - Test the application

## Local Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your Supabase credentials

4. Run the development server:
   ```bash
   npm run dev
   ```

## Database Schema

The application uses the following main tables in Supabase:
- `admin_users`: Stores admin user information
- `volunteers_volunteers`: Stores volunteer information
- `registered_volunteers`: Stores registered volunteer information

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.

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
