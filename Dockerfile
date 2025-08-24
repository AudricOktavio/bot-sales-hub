# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.16.0

# ----------------------------
# Build Stage
# ----------------------------
FROM node:${NODE_VERSION}-alpine AS build

WORKDIR /usr/src/app

# Fix OpenSSL/crypto issues on Alpine
RUN apk add --no-cache libc6-compat

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# ----------------------------
# Production Stage
# ----------------------------
FROM nginx:alpine AS production

ENV NODE_ENV=production

COPY --from=build /usr/src/app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
