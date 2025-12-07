# VARIABLES
APP_NAME=penny-app

# PHONY targets so Make does not conflict with file names
.PHONY: install dev build start test lint format docker-build docker-run

# Environment variables
DATABASE_URL ?= "postgresql://test_user:test_password@localhost:5432/penny?schema=public"

install:
	npm install

check-env:
	@if [ ! -f .env ]; then \
		echo ".env file is missing!"; \
		exit 1; \
	fi
	@if [ ! -f .env.example ]; then \
		echo ".env.example file is missing!"; \
		exit 1; \
	fi
	@echo "Checking .env keys..."
	@missing_keys=$$(grep -v '^\s*#' .env.example | cut -d '=' -f1 | while read key; do \
		grep -q "^$$key=" .env || echo $$key; \
	done); \
	if [ -n "$$missing_keys" ]; then \
		echo "Missing keys in .env:"; \
		echo "$$missing_keys"; \
		exit 1; \
	fi
	@echo "All env keys are present!"

	# Run Prisma migrate dev (create migration & apply)
prisma-migrate-dev:
	@echo "Running Prisma migrate dev..."
	DATABASE_URL=$(DATABASE_URL) npx prisma migrate dev --name init

# Reset the database (DROP + migrate + generate)
prisma-migrate-reset:
	@echo "Resetting the database..."
	DATABASE_URL=$(DATABASE_URL) npx prisma migrate reset --force

# Generate Prisma client
prisma-generate:
	@echo "Generating Prisma client..."
	DATABASE_URL=$(DATABASE_URL) npx prisma generate

# Push schema to DB without migrations
prisma-push:
	@echo "Pushing schema to DB..."
	DATABASE_URL=$(DATABASE_URL) npx prisma db push

# Show migration status
prisma-migrate-status:
	@echo "Checking migration status..."
	DATABASE_URL=$(DATABASE_URL) npx prisma migrate status

db-up:
	docker compose up -d

db-down:
	docker compose down

db-logs:
	docker compose logs -f penny-db

dev: check-env db-up prisma-generate
	npm run start:dev

build: install check-env
	npm run build

start: check-env
	npm run start:prod

test:
	npm run test

test-watch:
	npm run test:watch

lint:
	npm run lint

lint-fix:
	npm run lint -- --fix

format:
	npm run format

	# Makefile for Prisma tasks









