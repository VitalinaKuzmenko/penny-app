# VARIABLES
APP_NAME=penny-app

.PHONY: install dev build start test lint format

DATABASE_URL ?= "postgresql://test_user:test_password@localhost:5432/penny?schema=public"

install:
	pnpm install

check-env:
	@if [ ! -f .env ]; then \
		echo ".env file is missing!"; exit 1; \
	fi
	@if [ ! -f .env.example ]; then \
		echo ".env.example file is missing!"; exit 1; \
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

prisma-generate:
	DATABASE_URL=$(DATABASE_URL) pnpm prisma generate

prisma-migrate-dev:
	DATABASE_URL=$(DATABASE_URL) pnpm prisma migrate dev --name init

prisma-migrate-deploy:
	DATABASE_URL=$(DATABASE_URL) pnpm prisma migrate deploy

dev: check-env
	pnpm run start:dev

build: check-env
	pnpm run build

start: check-env
	pnpm run start:prod

test:
	pnpm run test

lint:
	pnpm run lint

format:
	pnpm run format

db-up:
	docker compose up -d

db-down:
	docker compose down

db-logs:
	docker compose logs -f penny-db
