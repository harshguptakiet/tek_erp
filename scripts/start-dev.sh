#!/bin/bash

echo "🚀 Starting Tekurious Development Environment..."

# Start Docker containers
echo "📦 Starting Docker containers..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker exec tekurious_postgres pg_isready -U postgres > /dev/null 2>&1; do
  sleep 1
done

echo "✅ PostgreSQL is ready!"

# Run Prisma migrations
echo "🔄 Running database migrations..."
cd apps/tekurious_erp
npx prisma migrate dev

echo "🎉 Development environment is ready!"
echo ""
echo "📊 PgAdmin: http://localhost:5050"
echo "   Email: admin@tekurious.com"
echo "   Password: admin"
echo ""
echo "🚀 Run 'npm run dev' to start the application"
