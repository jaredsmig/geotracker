# React Web App Dockerfile
FROM node:20 AS build
WORKDIR /app
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
COPY . .
RUN npm install
RUN echo $VITE_API_URL
RUN chmod +x node_modules/.bin/tsc node_modules/.bin/vite && npm run build

FROM nginx:alpine AS production
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist .
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
