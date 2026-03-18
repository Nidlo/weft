# =============================================================================
# StitchHub Frontend — Makefile
# =============================================================================
# Self-contained interface for the Next.js frontend.
# Deployment is handled by Vercel (push to main → auto-deploy).
#
# Usage:
#   make setup     — First-time local setup
#   make dev       — Start dev server (port 3000)
#   make test      — Run all tests
#   make build     — Production build
#   make help      — Show all commands
# =============================================================================

.DEFAULT_GOAL := help
SHELL := /bin/bash

# =============================================================================
# SETUP
# =============================================================================

.PHONY: setup install env

setup: install env ## Full local setup (yarn install + env file)
	@echo ""
	@echo "  Frontend setup complete!"
	@echo "  Run 'make dev' to start the dev server."
	@echo ""

install: ## Install dependencies (yarn)
	yarn install

env: ## Create .env.local from example if missing
	@if [ ! -f .env.local ]; then \
		if [ -f .env.example ]; then \
			cp .env.example .env.local; \
		else \
			echo "NEXT_PUBLIC_API_URL=https://backend.stitchhub.test" > .env.local; \
			echo "NEXT_PUBLIC_WS_URL=ws://localhost:8080" >> .env.local; \
		fi; \
		echo ".env.local created — update values as needed"; \
	else \
		echo ".env.local already exists"; \
	fi

# =============================================================================
# DEVELOPMENT
# =============================================================================

.PHONY: dev build start

dev: ## Start Next.js dev server (port 3000, Turbopack)
	yarn dev --port 3000

build: ## Production build
	yarn build

start: ## Start production server (after build)
	yarn start

# =============================================================================
# TESTING
# =============================================================================

.PHONY: test test-watch test-coverage test-e2e

test: ## Run all unit/component tests (Vitest)
	yarn test --run

test-watch: ## Run tests in watch mode
	yarn test:watch

test-coverage: ## Run tests with coverage report
	yarn test:coverage

test-e2e: ## Run Playwright E2E tests
	yarn test:e2e

# =============================================================================
# CODE QUALITY
# =============================================================================

.PHONY: lint format format-check typecheck check

lint: ## Run ESLint
	yarn lint

format: ## Format code with Prettier
	yarn format

format-check: ## Check formatting (CI-friendly, no changes)
	yarn format:check

typecheck: ## Run TypeScript type checking
	yarn tsc --noEmit

check: lint format-check typecheck ## Run all checks (lint + format + types)

# =============================================================================
# UTILITIES
# =============================================================================

.PHONY: clean analyze

clean: ## Remove build artifacts and caches
	rm -rf .next out node_modules/.cache
	@echo "Build caches cleared"

analyze: ## Analyze bundle size (requires @next/bundle-analyzer)
	ANALYZE=true yarn build

# =============================================================================
# HELP
# =============================================================================

.PHONY: help

help: ## Show this help message
	@echo ""
	@echo "  StitchHub Frontend — Commands"
	@echo "  ════════════════════════════════════════════════════════════"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "  Deployment:"
	@echo "    Vercel handles deployment automatically."
	@echo "    Push to main   → production deploy"
	@echo "    Push to staging → preview deploy"
	@echo ""
