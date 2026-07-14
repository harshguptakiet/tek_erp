# Tekurious ERP - Educational Management Platform

A comprehensive educational management system built with NestJS, Prisma, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites

- Node.js v20+ 
- Docker Desktop (for PostgreSQL and Redis)
- npm or yarn

### Installation

1. **Clone and Install Dependencies**
```bash
cd tekurious
npm install
```

2. **Start Docker Services**
```bash
# Make sure Docker Desktop is running first!
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379

3. **Set up Environment Variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Generate Prisma Client**
```bash
npx prisma generate
```

5. **Run Database Migrations**
```bash
npx prisma migrate dev --name init
```

6. **Start the Development Server**
```bash
npm run serve
```

The API will be available at: `http://localhost:3000/api/v1`

## 📁 Project Structure

```
tekurious/
├── apps/
│   └── tekurious_erp/
│       └── src/
│           ├── modules/          # Feature modules
│           │   ├── auth/         # Authentication
│           │   ├── users/        # User management
│           │   ├── schools/      # School management
│           │   ├── students/     # Student management
│           │   └── teachers/     # Teacher management
│           ├── common/           # Shared utilities
│           │   ├── decorators/
│           │   ├── guards/
│           │   ├── interceptors/
│           │   ├── filters/
│           │   └── pipes/
│           ├── database/         # Prisma service
│           ├── events/           # Event bus
│           ├── config/           # Configuration
│           └── main.ts           # Bootstrap
├── prisma/
│   └── schema.prisma            # Database schema (268 models)
├── docker-compose.yml           # Docker services
└── .env                         # Environment variables
```

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run serve

# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format

# Build for production
npm run build
```

### Database Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create a migration
npx prisma migrate dev --name your_migration_name

# Run migrations
npx prisma migrate deploy

# Open Prisma Studio (Database GUI)
npx prisma studio

# Reset database (development only!)
npx prisma migrate reset
```

## 📊 Database Schema

The project uses a comprehensive schema with:
- **268 models** covering all aspects of educational management
- Multi-tenancy support
- Complete RBAC (Role-Based Access Control)
- Event-driven architecture
- Soft deletes
- Audit logging

## 🏗️ Architecture

### Phase 1: MVP (Months 1-3)
- **Architecture**: Modular Monolith
- **Services**: 1 (All modules in one app)
- **Database**: 1 PostgreSQL instance
- **Infrastructure**: Docker Compose on VPS

### Future Phases
See `architecture-docs/IMPLEMENTATION_GUIDE.md` for the complete roadmap.

## 🔐 Environment Variables

Key environment variables (see `.env.example`):

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/tekurious_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
AWS_S3_BUCKET=your-bucket
RAZORPAY_KEY_ID=your-key
SENDGRID_API_KEY=your-key
TWILIO_ACCOUNT_SID=your-sid
```

## 📚 Documentation

- **Implementation Guide**: `architecture-docs/IMPLEMENTATION_GUIDE.md`
- **Requirements**: `requirements/` folder
- **Database Schema**: `schema.prisma`
- **Architecture Docs**: `architecture-docs/` folder

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🚢 Deployment

### Docker Build

```bash
# Build Docker image
docker build -t tekurious-erp .

# Run container
docker run -p 3000:3000 tekurious-erp
```

### Production Deployment

See `architecture-docs/IMPLEMENTATION_GUIDE.md` for detailed deployment instructions.

## 📝 License

Proprietary - All Rights Reserved

## 👥 Team

Built with ❤️ by the Tekurious team

---

## 🆘 Troubleshooting

### Docker not starting
```bash
# Check if Docker Desktop is running
docker ps

# Restart Docker Desktop if needed
```

### Database connection issues
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check logs
docker logs tekurious_postgres
```

### Prisma Client issues
```bash
# Regenerate Prisma Client
npx prisma generate

# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

## 📞 Support

For issues and questions, contact the development team.
