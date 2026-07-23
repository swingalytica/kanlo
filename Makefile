.PHONY: dev-start dev-stop dev-status

dev-start:
	@echo "Starting development environment..."
	@docker compose -f docker-compose.dev.yml up -d
	@echo "Development environment started."
	@echo "MongoDB: mongodb://localhost:27017"

dev-stop:
	@echo "Stopping development environment..."
	@docker compose -f docker-compose.dev.yml down
	@echo "Development environment stopped."

dev-status:
	@echo "Checking development environment status..."
	@docker compose -f docker-compose.dev.yml ps