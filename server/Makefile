# VARIABLES
APP_NAME=penny-app

# PHONY targets so Make does not conflict with file names
.PHONY: install dev build start test lint format docker-build docker-run

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

db-up:
	docker compose up -d

db-down:
	docker compose down

db-logs:
	docker compose logs -f penny-db

prisma-generate:
	npx prisma generate

prisma-push:
	npx prisma db push

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



