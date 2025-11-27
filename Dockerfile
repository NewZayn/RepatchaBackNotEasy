# 1. Usa imagem oficial do Node
FROM node:20-alpine

# 2. Define o diretório de trabalho
WORKDIR /app

# 3. Copia apenas arquivos de dependências primeiro
COPY package*.json ./

# 4. Instala dependências (melhor para performance)
RUN npm install --production

# 5. Copia todo o código do backend
COPY . .

# 6. Expõe a porta da aplicação
EXPOSE 3000

# 7. Comando de inicialização
CMD ["npm", "start"]
