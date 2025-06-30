# Canadian Investment Tracker

A comprehensive web application for tracking and managing Canadian registered investment accounts including RRSP, TFSA, RPP, DPSP, FHSA, and RESP.

## Features

- **Account Management**: Track multiple registered investment accounts
- **Transaction History**: Record contributions, withdrawals, and transfers
- **Contribution Planning**: Plan RRSP contributions with tax refund estimates
- **CRA Integration**: Enter actual limits from your Notice of Assessment
- **Couple Support**: Add spouse/partner for joint financial planning
- **Pension Adjustments**: Automatic RRSP room adjustments for RPP/DPSP contributions
- **Real-time Data**: Powered by Supabase for real-time updates
- **Secure Authentication**: Email/password authentication with row-level security
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **PWA Support**: Install as a progressive web app

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Charts**: Chart.js with React Chart.js 2
- **Forms**: React Hook Form
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Netlify

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/canadian-investment-tracker.git
cd canadian-investment-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Run the SQL migrations in the Supabase SQL editor (see FRESH_SETUP_GUIDE.md)

4. Configure environment variables:
```bash
cp .env.example .env
```
Edit `.env` and add your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:5173](http://localhost:5173) in your browser

## Database Schema

The application uses the following main tables:

- **users**: User profiles with contribution limits and couple relationships
- **accounts**: Investment accounts (RRSP, TFSA, RPP, DPSP, FHSA, RESP)
- **transactions**: Financial transactions with automatic pension adjustments
- **goals**: Financial goals and targets
- **couples**: Relationship data for shared account management

## Key Features

### Account Types Supported
- **RRSP**: Registered Retirement Savings Plan
- **TFSA**: Tax-Free Savings Account
- **RPP**: Registered Pension Plan (with automatic pension adjustments)
- **DPSP**: Deferred Profit Sharing Plan (with automatic pension adjustments)
- **FHSA**: First Home Savings Account
- **RESP**: Registered Education Savings Plan

### CRA Compliance
- Enter actual contribution limits from your Notice of Assessment
- Automatic pension adjustment calculations for RPP/DPSP contributions
- RRSP room tracking with carry-forward amounts
- Tax refund estimation tools

### Couple Features
- Add spouse/partner as additional account holder
- Shared login credentials with individual account ownership
- Combined portfolio overview and reporting
- Individual and joint contribution planning

## Authentication

The app uses Supabase Auth with:
- Email/password authentication
- Row Level Security (RLS) for data protection
- Automatic user profile creation on signup
- Support for couple account sharing

## Deployment

### Netlify Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy to Netlify:
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables in Netlify dashboard

### Environment Variables for Production

Set these in your deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@canadianinvestmenttracker.com or create an issue on GitHub.

## Acknowledgments

- Built for Canadian investors and financial planning
- Compliant with CRA regulations and PIPEDA privacy requirements
- Inspired by the need for better investment tracking tools in Canada
- Automatic pension adjustment calculations for accurate RRSP room tracking