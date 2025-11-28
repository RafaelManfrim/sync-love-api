#!/bin/bash

set -e # Fail fast em erros

echo "Iniciando atualização da aplicação..."

cd /var/www/sync-love-api

echo "Executando git pull..."
git pull

echo "Instalando dependências..."
npm install

echo "Realizando build..."
npm run build

echo "Rodando migrations do banco de dados..."
npx prisma migrate deploy

echo "Reiniciando no PM2..."
pm2 restart sync-love-api
pm2 start ecosystem.config.js
pm2 save

echo "Restartando o apache..."
sudo systemctl restart apache2

echo "Atualização concluída!"