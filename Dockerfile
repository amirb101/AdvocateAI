FROM node:20-alpine

WORKDIR /app

# Copy backend files
COPY backend/package*.json ./
RUN npm install

# Copy rest of backend
COPY backend/ .

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]

