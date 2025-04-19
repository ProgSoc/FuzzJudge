FROM node:22-alpine as build

# Set the working directory
WORKDIR /app
# Copy the necessary files
COPY . .
# Install dependencies
RUN npm install --frozen-lockfile --prefer-offline --no-audit --progress=false

ARG VITE_BACKEND_URL
# Set the environment variable for the backend URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
# Build the application
RUN npm run build


FROM nginx
# Copy the built application from the previous stage
COPY --from=0 /app/dist /usr/share/nginx/html
# Copy the nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port the app runs on
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]