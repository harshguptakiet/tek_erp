# Getting Started - Build Edubharti MVP

**Goal**: Launch MVP in 3 months with 10 pilot schools  
**Team**: 2-3 developers  
**Budget**: $2000 (including infrastructure for 3 months)

---

## Week 1: Project Setup

### Day 1-2: Repository & Development Environment

```bash
# Create project
npx create-nx-workspace@latest edubharti --preset=nest

cd edubharti

# Install dependencies
npm install @nestjs/common @nestjs/core @nestjs/platform-express
npm install @prisma/client prisma
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install bcrypt class-validator class-transformer
npm install @nestjs/config
npm install redis ioredis
npm install @nestjs/bull bull

# Dev dependencies
npm install -D @types/node @types/bcrypt @types/passport-jwt
npm install -D typescript ts-node tsx
npm install -D jest @nestjs/testing
npm install -D eslint prettier
```

### Project Structure
```
edubharti/
├── apps/
│   └── api/
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   ├── users/
│       │   │   ├── schools/
│       │   │   ├── students/
│       │   │   ├── teachers/
│       │   │   ├── classes/
│       │   │   ├── subjects/
│       │   │   ├── content/
│       │   │   ├── assignments/
│       │   │   ├── assessments/
│       │   │   ├── attendance/
│       │   │   ├── fees/
│       │   │   └── notifications/
│       │   ├── common/
│       │   │   ├── decorators/
│       │   │   ├── guards/
│       │   │   ├── interceptors/
│       │   │   ├── filters/
│       │   │   └── pipes/
│       │   ├── config/
│       │   ├── database/
│       │   ├── events/
│       │   └── main.ts
│       ├── test/
│       └── Dockerfile
├── libs/
│   └── shared/
│       ├── src/
│       │   ├── types/
│       │   ├── utils/
│       │   └── constants/
│       └── tsconfig.json
├── prisma/
│   ├── schema.prisma  # Use your existing 268-model schema!
│   ├── migrations/
│   └── seed.ts
├── .env
├── .env.example
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

### Day 3: Database Setup

```bash
# Copy your existing schema.prisma to prisma/schema.prisma
cp c:/teach/schema.prisma prisma/schema.prisma

# Create .env file
cat > .env << EOF
DATABASE_URL="postgresql://postgres:password@localhost:5432/edubharti"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3000
EOF

# Start PostgreSQL and Redis
docker-compose up -d

# Run migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

### Day 4-5: Core Setup

#### 1. Main Application (`apps/api/src/main.ts`)
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  // CORS
  app.enableCors();
  
  // API prefix
  app.setGlobalPrefix('api/v1');
  
  await app.listen(process.env.PORT || 3000);
  console.log(`🚀 Application running on: http://localhost:${process.env.PORT || 3000}/api/v1`);
}
bootstrap();
```

#### 2. App Module (`apps/api/src/app.module.ts`)
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SchoolsModule } from './modules/schools/schools.module';
import { DatabaseModule } from './database/database.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    EventsModule,
    AuthModule,
    UsersModule,
    SchoolsModule,
    // Add other modules as you build them
  ],
})
export class AppModule {}
```

#### 3. Database Module (`apps/api/src/database/database.module.ts`)
```typescript
import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
```

#### 4. Prisma Service (`apps/api/src/database/prisma.service.ts`)
```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

#### 5. Docker Compose (`docker-compose.yml`)
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: edubharti
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/var/lib/redis

volumes:
  postgres_data:
  redis_data:
```

---

## Week 2: Authentication & Users

### Auth Module Structure
```
modules/auth/
├── auth.controller.ts
├── auth.service.ts
├── auth.module.ts
├── strategies/
│   ├── jwt.strategy.ts
│   └── local.strategy.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   └── roles.guard.ts
├── decorators/
│   ├── current-user.decorator.ts
│   └── roles.decorator.ts
└── dto/
    ├── login.dto.ts
    ├── register.dto.ts
    └── auth-response.dto.ts
```

### Key Implementations

#### Auth Service (`modules/auth/auth.service.ts`)
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        authentication: {
          create: {
            passwordHash: hashedPassword,
          },
        },
        profile: {
          create: {
            firstName: dto.firstName,
            lastName: dto.lastName,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        authentication: true,
        profile: true,
      },
    });

    if (!user || !user.authentication) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.authentication.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  private generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.profile?.firstName,
        lastName: user.profile?.lastName,
      },
    };
  }
}
```

### Current User Decorator
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

### JWT Guard
```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

---

## Week 3: Schools & Multi-Tenancy

### School Module
```typescript
// modules/schools/schools.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSchoolDto } from './dto';

@Injectable()
export class SchoolsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSchoolDto, userId: string) {
    // Create tenant for school
    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.name,
        type: 'SCHOOL',
      },
    });

    // Create school
    const school = await this.prisma.school.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        tenantId: tenant.id,
        organizationId: dto.organizationId,
        address: dto.address,
        // ... other fields
      },
    });

    // Assign user as school admin
    await this.prisma.userRole.create({
      data: {
        userId,
        roleId: 'SCHOOL_ADMIN_ROLE_ID',
        tenantId: tenant.id,
      },
    });

    return school;
  }

  async findAll(tenantId: string) {
    return this.prisma.school.findMany({
      where: { tenantId },
      include: {
        organization: true,
      },
    });
  }
}
```

### Multi-Tenancy Interceptor
```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Attach tenant ID to request
    if (user?.tenantId) {
      request.tenantId = user.tenantId;
    }
    
    return next.handle();
  }
}
```

---

## Week 4: Students & Classes

### Quick implementations:
- Student enrollment
- Class & section management
- Teacher assignments
- Basic timetable

**Code patterns similar to above** - use Prisma for all database operations.

---

## Weeks 5-8: Learning Features

### Priority Order:
1. **Content Management** (Week 5)
   - Upload PDFs, videos
   - AWS S3 integration
   - Content organization

2. **Assignments** (Week 6)
   - Create assignments
   - Submit assignments
   - File uploads

3. **Assessments** (Week 7)
   - Question bank
   - Create exams
   - Take exams
   - Auto-grading (MCQ)

4. **Grading & Results** (Week 8)
   - Manual grading
   - Grade book
   - Report cards

---

## Weeks 9-12: Essential Operations

1. **Attendance** (Week 9)
   - Manual attendance marking
   - Reports

2. **Fee Management** (Week 10)
   - Fee structures
   - Fee records
   - Payment tracking

3. **Payments** (Week 11)
   - Razorpay integration
   - Payment processing
   - Receipts

4. **Notifications** (Week 12)
   - Email (SendGrid)
   - SMS (Twilio)
   - In-app notifications

5. **Analytics Dashboard** (Week 12)
   - Basic metrics
   - Charts (Chart.js)

---

## Testing Strategy

### Unit Tests
```typescript
describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AuthService, PrismaService, JwtService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should register a user', async () => {
    const dto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    };

    const result = await service.register(dto);
    expect(result.accessToken).toBeDefined();
  });
});
```

### Integration Tests
```typescript
describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.accessToken).toBeDefined();
      });
  });
});
```

---

## Deployment (Month 3)

### Dockerfile
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Deploy to DigitalOcean
```bash
# Create droplet (4GB RAM, 2 vCPUs - $24/month)
doctl compute droplet create edubharti \
  --size s-2vcpu-4gb \
  --image ubuntu-22-04-x64 \
  --region blr1

# SSH and install Docker
ssh root@your-droplet-ip
apt update && apt install -y docker.io docker-compose

# Clone repo and deploy
git clone your-repo
cd edubharti
docker-compose up -d
```

---

## Month-by-Month Checklist

### Month 1
- [x] Week 1: Project setup, database, auth
- [x] Week 2: Users, schools, multi-tenancy
- [x] Week 3: Students, classes, teachers
- [x] Week 4: Subjects, basic timetable

### Month 2
- [x] Week 5: Content management
- [x] Week 6: Assignments
- [x] Week 7: Assessments
- [x] Week 8: Grading

### Month 3
- [x] Week 9: Attendance
- [x] Week 10: Fee management
- [x] Week 11: Payments
- [x] Week 12: Notifications, analytics, deploy!

---

## Success Criteria

By end of Month 3, you should have:
- ✅ Production deployment
- ✅ 10 pilot schools onboarded
- ✅ 500+ students using daily
- ✅ Core workflows functional:
  - Student enrollment
  - Content delivery
  - Assignment submission
  - Exam taking
  - Attendance marking
  - Fee payment
- ✅ <200ms API response time
- ✅ Mobile-responsive web app
- ✅ Zero critical bugs

**Then**: Onboard 100 more schools in Month 4-6 and iterate based on feedback.

---

**Good luck! 🚀**

Remember: **Ship fast, iterate quickly, scale intelligently.**

