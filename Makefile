.PHONY: start stop status

start:
	@echo "Starting MongoDB..."
	@docker compose -f ./mongodb/docker-compose.yml up -d mongodb
	@echo "MongoDB started. You can access it at mongodb://localhost:27017"

stop:
	@echo "Stopping MongoDB..."
	@docker compose -f ./mongodb/docker-compose.yml down
	@echo "MongoDB stopped."

status:
	@echo "Checking MongoDB status..."
	@docker compose -f ./mongodb/docker-compose.yml ps