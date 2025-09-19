# --- STAGE 1: Build da Aplicação ---
FROM node:20-alpine AS builder

WORKDIR /app

# Instala dependências de sistema necessárias para módulos nativos (se houver)
# Mantido do seu Dockerfile original. Se forem apenas para o build,
# você pode removê-las do estágio 'runner' se não forem necessárias em tempo de execução.
RUN apk add --no-cache python3 build-base pkgconf cairo-dev jpeg-dev pango-dev giflib-dev pixman-dev

# Copia os arquivos package.json e package-lock.json (ou yarn.lock)
COPY package*.json ./

# Instala TODAS as dependências (incluindo devDependencies necessárias para o build)
RUN npm install

# Copia o restante do código-fonte
COPY . .

# EXECUTA O COMANDO DE BUILD
# Este é o passo crucial que estava faltando.
# Assume que você tem um script 'build' no seu package.json (ex: "build": "tsc")
RUN npm run build

# --- STAGE 2: Execução da Aplicação (Runtime) ---
FROM node:20-alpine AS runner

WORKDIR /app

# Re-instala dependências de sistema se forem necessárias para módulos nativos EM TEMPO DE EXECUÇÃO
# Se as libs 'cairo-dev', etc. são apenas para o processo de build, você pode remover esta linha.
RUN apk add --no-cache python3 build-base pkgconf cairo-dev jpeg-dev pango-dev giflib-dev pixman-dev

# Copia apenas os arquivos package.json para instalar as dependências de produção
COPY package*.json ./

# Instala APENAS as dependências de produção
RUN npm install --only=production

# Copia os arquivos compilados (a pasta 'dist') do estágio 'builder'
COPY --from=builder /app/dist ./dist

# Se você tiver outros arquivos estáticos ou de configuração que precisam estar na imagem final
# e não estão dentro de 'dist', você pode copiá-los aqui. Ex:
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/config.json ./config.json

# Define o comando para iniciar a aplicação
CMD ["node", "dist/main.js"]
