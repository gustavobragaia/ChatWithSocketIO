FROM node:20-alpine AS build
WORKDIR /web
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /web/dist /usr/share/nginx/html
# SPA fallback (React Router)
RUN sed -i 's|try_files \$uri \$uri/ =404;|try_files \$uri /index.html;|' /etc/nginx/conf.d/default.conf
EXPOSE 80
