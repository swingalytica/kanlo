.PHONY: mongodb

mongodb:
	@echo "Starting MongoDB..."
	@docker compose -f ./mongodb/docker-compose.yml up -d mongodb
	@echo "MongoDB started. You can access it at mongodb://localhost:27017"