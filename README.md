# Visitor Check-In System

A modern, professional visitor management system built with React, TypeScript, and Supabase. Perfect for office reception desks, co-working spaces, and any organization that needs to track visitor check-ins and check-outs.

![Visitor Check-In System](https://atlas-check-in.netlify.app/)

## ✨ Features

### 🚪 **Guest Check-In**
- Simple, intuitive check-in form for visitors
- Capture visitor details: name, company, phone, email, purpose, and host
- No authentication required for guests
- Responsive design works on tablets and mobile devices

### 👨‍💼 **Admin Dashboard**
- Secure admin authentication with email/password
- Real-time visitor list with search and filtering
- One-click visitor check-out functionality
- Comprehensive analytics dashboard

### 📊 **Analytics & Reporting**
- Today's visitor count
- Currently checked-in visitors
- Average visit duration
- Weekly visitor trends
- Real-time updates

### 🔒 **Security & Privacy**
- Row Level Security (RLS) with Supabase
- Secure admin authentication
- Guest data protection
- Environment-based configuration

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - Modern UI library
- **TypeScript 5.5.3** - Type safety
- **Tailwind CSS 3.4.1** - Utility-first styling
- **Vite 5.4.2** - Fast build tool
- **Lucide React** - Beautiful icons

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Robust database
- **Supabase Auth** - Authentication system
- **Row Level Security** - Database security

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **WebContainer** - Browser-based development

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account
- Modern web browser

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd visitor-checkin-system
npm install
```

### 2. Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API to get your credentials
3. Click "Connect to Supabase" in the Bolt interface, or manually create `.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup
Run the migration to create the visitors table:
- Go to your Supabase dashboard
- Navigate to SQL Editor
- Copy and paste the contents of `supabase/migrations/initial-seed.sql`
- Execute the query

### 4. Create Admin User
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user"
3. Create an admin account with email/password
4. Optionally disable email confirmation in Auth settings

### 5. Start Development
```bash
npm run dev
```

Visit `http://localhost:5173` to see your visitor check-in system!

## 📱 Usage

### For Guests
1. Open the application
2. Fill out the check-in form with your details
3. Click "Check In" - you're all set!

### For Administrators
1. Click "Admin" in the navigation bar
2. Sign in with your admin credentials
3. Access visitor management and analytics
4. Check out visitors when they leave

## 🏗️ Project Structure

```
src/
├── components/
│   ├── AuthButton.tsx      # Admin authentication
│   ├── CheckInForm.tsx     # Guest check-in form
│   ├── Dashboard.tsx       # Analytics dashboard
│   └── VisitorList.tsx     # Visitor management
├── lib/
│   └── supabase.ts         # Supabase client & types
├── App.tsx                 # Main application
└── main.tsx               # Application entry point

supabase/
└── migrations/
    └── initial-seed.sql    # Database schema
```

## 🎨 Customization

### Styling
The app uses Tailwind CSS for styling. Key design elements:
- **Colors**: Blue primary, with green/orange accents
- **Typography**: Clean, professional fonts
- **Layout**: Responsive grid system
- **Components**: Rounded corners, subtle shadows

### Branding
Update the header section in `src/App.tsx`:
```tsx
<h1 className="text-4xl font-bold text-gray-900 mb-2">
  Your Company Name
</h1>
```

### Form Fields
Modify the check-in form in `src/components/CheckInForm.tsx` to add/remove fields as needed.

## 🔧 Configuration

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Policies
The system uses Row Level Security with policies that allow:
- Public read/write access for visitor check-ins
- Admin access for visitor management
- Secure data isolation

## 📊 Database Schema

### Visitors Table
```sql
- id (uuid, primary key)
- name (text, required)
- company (text, optional)
- phone (text, optional)
- email (text, optional)
- purpose (text, optional)
- host_name (text, optional)
- checked_in_at (timestamp)
- checked_out_at (timestamp, nullable)
- status ('checked_in' | 'checked_out')
- created_at (timestamp)
- updated_at (timestamp)
```

## 🚢 Deployment

### Netlify (Recommended)
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Set environment variables in Netlify dashboard
4. Configure domain (optional)

### Other Platforms
The built application is a static site that can be deployed to:
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

## 🔒 Security Considerations

- **Admin Authentication**: Uses Supabase Auth with email/password
- **Data Protection**: Row Level Security ensures data isolation
- **Environment Variables**: Sensitive keys stored securely
- **HTTPS**: Always use HTTPS in production

## 🆘 Support

### Common Issues

**"Permission denied for schema public"**
- Ensure the database migration has been run
- Check Supabase RLS policies are correctly set

**Admin can't sign in**
- Verify admin user exists in Supabase Auth
- Check email/password are correct
- Ensure email confirmation is disabled (if needed)

**Visitors not appearing**
- Check Supabase connection
- Verify environment variables
- Check browser console for errors

### Getting Help
- Review Supabase documentation
- Contact support team

## 🎯 Roadmap

- [ ] Email notifications for hosts
- [ ] Visitor badges/QR codes
- [ ] Advanced reporting
- [ ] Mobile app
- [ ] Integration with calendar systems
- [ ] Visitor photos
- [ ] Multi-location support

---

**Built with ❤️ using React, TypeScript, and Supabase**