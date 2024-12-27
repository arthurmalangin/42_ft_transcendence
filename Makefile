all : up

up:
	@echo "Docker up"
	@mkdir -p ~/data/wordpress
	@mkdir -p ~/data/mariadb
	@mkdir -p ~/data/website
	@docker compose -f ./srcs/docker-compose.yml up --build -d
	@docker ps

clear: down stop
	@echo "Clear volumes..."
	@docker volume rm -f `docker volume ls`
	@sudo rm -rf /home/arthur/data

prune:
	@docker system prune -af

down:
	@echo "Docker down.."
	@docker compose -f ./srcs/docker-compose.yml down -v

stop:
	@echo "Docker stop"
	@docker compose -f ./srcs/docker-compose.yml stop

start:
	@docker compose -f ./srcs/docker-compose.yml start

status: 
	@docker ps

re: clear all

.PHONY: all clear re stop down up start