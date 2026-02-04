# CRM Web Application

A modern, full-stack Customer Relationship Management (CRM) application built with React, TypeScript, and Supabase.

## 🚀 Features

- **User Authentication** - Secure sign up and login with Supabase Auth
- **Customer Management** - Add, view, and manage customer information
- **Sales Tracking** - Monitor sales pipeline and performance
- **Task Management** - Keep track of customer-related tasks
- **Activity Feed** - View recent activities across your CRM
- **Real-time Updates** - Data synced across all devices
- **Responsive Design** - Works perfectly on desktop and mobile

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **UI Components**: Custom components with Tailwind CSS
- **Routing**: React Router v6
- **Notifications**: Sonner (toast notifications)

## 📋 Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works fine)
- A Vercel account (for deployment, free tier works fine)

## 🔧 Setup Instructions

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new account
2. Create a new project (choose a region close to you)
3. Wait for the database to be ready (takes ~2 minutes)
4. Go to the SQL Editor in your Supabase dashboard
5. Copy the entire content from `supabase/schema.sql` file
6. Paste it into the SQL Editor and click "Run"
7. Go to Settings > API to find your:
   - `Project URL` (looks like: https://xxxxx.supabase.co)
   - `anon public` key (long string of characters)

### 2. Local Development

1. Clone or download this repository

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-project-url-here
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:5173](http://localhost:5173) in your browser

### 3. Deploy to Vercel

#### Option A: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow the prompts and add your environment variables when asked

#### Option B: Using Vercel Dashboard (Recommended)

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) and sign in

3. Click "New Project"

4. Import your GitHub repository

5. Configure the project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

6. Add Environment Variables:
   - Click "Environment Variables"
   - Add `VITE_SUPABASE_URL` with your Supabase project URL
   - Add `VITE_SUPABASE_ANON_KEY` with your Supabase anon key

7. Click "Deploy"

8. Wait for deployment to complete (usually 1-2 minutes)

9. Your app will be live at `https://your-project-name.vercel.app`

## 🎯 Usage

### First Time Setup

1. Open your deployed app
2. Click "Sign Up" and create an account
3. You'll be automatically logged in
4. Start by adding your first customer!

### Adding Customers

1. Go to the "Customers" page
2. Click "Add Customer"
3. Fill in the customer details
4. Click "Add Customer" to save

### Tracking Sales

1. Go to the "Sales" page
2. Click "Add Sale"
3. Select a customer from the dropdown
4. Enter sale amount, status, and description
5. Click "Add Sale" to save

### Managing Tasks

Tasks can be added from the Dashboard or from individual customer pages.

## 🔒 Security Features

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Secure authentication with Supabase Auth
- Environment variables for sensitive data
- HTTPS encryption on all connections

## 📱 Database Schema

The application uses the following main tables:

- **customers** - Customer information and contact details
- **sales** - Sales transactions and pipeline
- **tasks** - Customer-related tasks and reminders
- **interactions** - Customer interaction history
- **notes** - Customer notes
- **activities** - Activity feed/audit log

All tables have Row Level Security (RLS) policies to ensure data privacy.

## 🐛 Troubleshooting

### Can't login after deployment

- Make sure your environment variables are set correctly in Vercel
- Check that your Supabase project is active
- Verify the Supabase URL doesn't have a trailing slash

### Data not showing up

- Check browser console for errors
- Verify your Supabase RLS policies are set up correctly
- Make sure you ran the schema.sql file completely

### Build fails on Vercel

- Ensure all dependencies are in package.json (not devDependencies)
- Check that TypeScript has no errors: `npm run build` locally
- Verify environment variables are set

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Support

If you need help:

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Check the [Vercel Documentation](https://vercel.com/docs)
3. Open an issue in this repository

## 🎉 What's Next?

Ideas for extending this CRM:

- Add email integration
- Implement advanced filtering and search
- Add data visualization charts
- Create customer segmentation
- Add file uploads for documents
- Implement team collaboration features
- Add calendar integration
- Create mobile app version

---

Built with ❤️ using React, TypeScript, and Supabase
