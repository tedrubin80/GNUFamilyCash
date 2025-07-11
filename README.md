# Family GnuCash - Online Accounting System

A complete online version of GnuCash built with Next.js, featuring password protection, MySQL database integration, Google Drive backups, and multi-user support.

## 🚀 Features

### Core Accounting
- **Double-Entry Bookkeeping**: Full double-entry accounting system
- **Chart of Accounts**: Hierarchical account structure with Asset, Liability, Income, Expense, and Equity accounts
- **Transaction Management**: Multi-split transactions with detailed tracking
- **Account Reconciliation**: Bank reconciliation workflow
- **Financial Reporting**: P&L statements, balance sheets, and custom reports
- **Budget Management**: Create and track budgets vs actuals

### Security & Access Control
- **Password Protected**: Zero public access - all pages require authentication
- **Multi-User Support**: Family member accounts with role-based permissions
  - **Admin**: Full access including backend configuration
  - **User**: Read/write access to accounting data
  - **Read-Only**: View-only access to reports and data
- **Secure Sessions**: JWT-based authentication with session expiration

### Data Management
- **MySQL Database**: Full persistence with Prisma ORM
- **Google Drive Integration**: Automated backups and restore functionality
- **Import/Export**: Support for CSV, OFX, QIF, and GnuCash XML formats
- **Data Validation**: Transaction balancing and data integrity checks

### Admin Features
- **User Management**: Create/edit/disable family member accounts
- **System Configuration**: Currency, date formats, fiscal year settings
- **Backup Management**: Schedule and manage Google Drive backups
- **Audit Trail**: Track all changes and user activities

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 + React + TypeScript
- **Backend**: Next.js API Routes
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **File Processing**: PapaParse for CSV handling
- **Cloud Integration**: Google Drive API

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- MySQL server (local or cloud)
- Google Drive API credentials (optional, for backups)

### Setup Steps

1. **Clone and Install Dependencies**
   \`\`\`bash
   git clone <repository-url>
   cd family-gnucash
   npm install
   \`\`\`

2. **Environment Configuration**
   Create \`.env.local\` file:
   \`\`\`env
   # Database
   DATABASE_URL="mysql://username:password@localhost:3306/family_accounting"
   
   # NextAuth.js
   NEXTAUTH_SECRET="your-super-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Google Drive Integration (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GOOGLE_REFRESH_TOKEN="your-google-refresh-token"
   
   # App Settings
   APP_NAME="Family GnuCash"
   DEFAULT_CURRENCY="USD"
   \`\`\`

3. **Database Setup**
   \`\`\`bash
   # Generate Prisma client
   npx prisma generate
   
   # Push schema to database
   npx prisma db push
   
   # (Optional) View database in browser
   npx prisma studio
   \`\`\`

4. **Create Default Admin User**
   \`\`\`bash
   # Run the seed script to create initial admin user
   npm run db:seed
   \`\`\`

5. **Start Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Access Application**
   - Open http://localhost:3000
   - Login with default admin credentials:
     - Username: \`admin\`
     - Password: \`admin123\`

## 🔧 Configuration

### Google Drive Setup (Optional)
1. Create a Google Cloud Console project
2. Enable the Google Drive API
3. Create OAuth 2.0 credentials
4. Add credentials to your \`.env.local\` file
5. Test connection in Admin > Settings

### User Management
Access the admin panel at `/admin` to:
- Create family member accounts
- Set user roles and permissions
- Configure system settings
- Manage backups and data

### Database Management
\`\`\`bash
# Apply schema changes
npm run db:migrate

# Reset database (careful!)
npm run db:reset

# Generate Prisma client after schema changes
npm run db:generate
\`\`\`

## 📊 Usage

### Getting Started
1. **Setup Accounts**: Create your chart of accounts (Assets, Liabilities, Income, Expenses)
2. **Add Family Members**: Create user accounts for family members with appropriate roles
3. **Record Transactions**: Enter your financial transactions with double-entry splits
4. **Create Budgets**: Set up monthly/yearly budgets for expense tracking
5. **Generate Reports**: View financial statements and reports
6. **Reconcile Accounts**: Match transactions with bank statements

### Best Practices
- **Regular Backups**: Enable automatic Google Drive backups
- **Account Reconciliation**: Reconcile bank accounts monthly
- **Budget Tracking**: Review budget vs actual regularly
- **User Permissions**: Use appropriate roles for family members
- **Data Security**: Change default passwords immediately

## 🔒 Security

### Authentication
- All pages require login - zero public access
- Secure password hashing with bcrypt
- JWT session tokens with expiration
- Role-based access control

### Data Protection
- User-scoped data isolation
- SQL injection prevention with Prisma
- CSRF protection via NextAuth.js
- Secure environment variable handling

### Best Practices
- Regular security updates
- Strong password requirements
- Session timeout configuration
- Audit trail monitoring

## 🚀 Deployment

### Production Deployment
1. **Build Application**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Environment Variables**
   - Set production \`DATABASE_URL\`
   - Generate new \`NEXTAUTH_SECRET\`
   - Update \`NEXTAUTH_URL\` to your domain

3. **Database Migration**
   \`\`\`bash
   npx prisma migrate deploy
   \`\`\`

4. **Deploy** (choose one):
   - **Vercel**: \`vercel --prod\`
   - **Docker**: Use included Dockerfile
   - **Manual**: \`npm start\` on your server

### Scaling Considerations
- Use cloud MySQL (AWS RDS, PlanetScale, etc.)
- Enable database connection pooling
- Configure CDN for static assets
- Set up monitoring and logging

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For support and questions:
- Check the documentation in \`/docs\`
- Review the FAQ section
- Submit issues on GitHub
- Contact the development team

---

**Family GnuCash** - Complete online accounting for modern families 💰📊