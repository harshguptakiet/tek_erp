# How to Run Tekurious ERP

## ✅ Available Commands

Now that scripts are added to package.json, you can use these commands:

### Development Server

```bash
# Any of these will work:
npm run serve
npm run start
npm run dev

# Or use NX directly:
npx nx serve tekurious_erp
```

**Note**: First time will be slow (building webpack, TypeScript compilation). Subsequent starts will be faster.

### Build Application

```bash
npm run build

# Or with NX:
npx nx build tekurious_erp
```

### Database Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio (Database GUI)
npm run prisma:studio

# Reset database (WARNING: Deletes all data!)
npm run prisma:reset
```

### Code Quality

```bash
# Run linter
npm run lint

# Format code
npm run format

# Run tests
npm run test
```

---

## 🚀 Complete Startup Sequence

### Step 1: Start Docker (if not running)
```bash
# Open Docker Desktop, then:
docker-compose up -d
```

Check if containers are running:
```bash
docker ps
```

You should see:
- tekurious_postgres
- tekurious_redis

### Step 2: Run Database Migration (First time only)
```bash
npm run prisma:migrate
```

Enter migration name: `init`

This creates all 268 tables in your database.

### Step 3: Start Development Server
```bash
npm run serve
```

**First run will take 30-60 seconds to build.**

Wait for:
```
🚀 Tekurious ERP is running on: http://localhost:3000/api/v1
```

### Step 4: Test the API
Open another terminal and test:

```bash
curl http://localhost:3000/api/v1/auth/me
```

Should return 401 Unauthorized (expected, since no token provided).

---

## ⚡ Quick Commands Reference

| What you want | Command |
|---------------|---------|
| Start server | `npm run serve` |
| Build app | `npm run build` |
| Database GUI | `npm run prisma:studio` |
| Run migrations | `npm run prisma:migrate` |
| Format code | `npm run format` |
| Run tests | `npm run test` |

---

## 🐛 Troubleshooting

### "Command not found" or scripts don't work
**Solution**: Make sure you're in the correct directory:
```bash
cd c:\teach\tekurious
```

### Server build is very slow first time
**Expected behavior**. NX needs to:
1. Build webpack configuration
2. Compile TypeScript
3. Generate source maps
4. Set up watch mode

**First run**: 30-60 seconds  
**Subsequent runs**: 5-10 seconds (hot reload)

### "Cannot connect to database"
**Solution**:
```bash
# Check if PostgreSQL is running
docker ps | findstr postgres

# If not running, start Docker services
docker-compose up -d
```

### "Prisma Client not generated"
**Solution**:
```bash
npm run prisma:generate
```

### Port 3000 already in use
**Solution**: Change PORT in `.env`:
```env
PORT=3001
```

Then restart server.

---

## 🎯 Development Workflow

### Daily Development
```bash
# 1. Start Docker (once per day)
docker-compose up -d

# 2. Start dev server
npm run serve

# 3. Make changes to code
# Server auto-reloads on file changes

# 4. Test your changes
# Use curl, Postman, or Thunder Client

# 5. When done
# Ctrl+C to stop server
```

### When Schema Changes
```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration
npm run prisma:migrate

# 3. Generate client
npm run prisma:generate

# 4. Restart server
npm run serve
```

---

## 📝 Next Steps

Once server is running:

1. **Test Authentication APIs** - See `TESTING_CHECKLIST.md`
2. **Open Prisma Studio** - `npm run prisma:studio`
3. **Start Building** - Next module: Users Module

---

## 💡 Pro Tips

### Use Prisma Studio for Debugging
```bash
npm run prisma:studio
```
Opens at http://localhost:5555 - Great for viewing database records.

### Watch Mode is Enabled
Server automatically reloads when you save files. No need to restart!

### Use VS Code Extensions
- **Prisma** - Syntax highlighting for schema
- **REST Client** or **Thunder Client** - Test APIs directly in VS Code
- **ESLint** - Code quality
- **Prettier** - Code formatting

---

**Ready to code! 🚀**
