all : up

up:
	@echo "Docker up"
	@docker compose -f ./docker-compose.yml up --build
	@docker ps

silent:
	@echo "Docker up"
	@docker compose -f ./docker-compose.yml up --build -d
	@docker ps

clear: down stop
	@echo "Clear volumes..."
	@docker volume rm -f `docker volume ls`

prune:
	@docker system prune -af

down:
	@echo "Docker down.."
	@docker compose -f ./docker-compose.yml down -v

stop:
	@echo "Docker stop"
	@docker compose -f ./docker-compose.yml stop

start:
	@docker compose -f ./docker-compose.yml start

status: 
	@docker ps

re: clear all

.PHONY: all clear re stop down up start silent