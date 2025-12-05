# VARIABLES
APP_NAME=penny-app

# PHONY targets so Make does not conflict with file names
.PHONY: install dev build start test lint format docker-build docker-run

install:
	npm install

check-env:
	npm run check-env

setup-env:
	@echo "Setting up environment files..."
	@if [ -f ./.env.example]

dev: check-env
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

docker-build:
	docker build -t $(APP_NAME) .

docker-run:
	docker run -p 3000:3000 $(APP_NAME)
