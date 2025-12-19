# Stage 1: Build Frontend
FROM node:20-slim as frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend .
RUN npm run build

# Stage 2: Build Backend
FROM rust:1.83-slim-bookworm as backend-builder
WORKDIR /app
COPY . .
RUN cargo build --release

# Stage 3: Runtime
FROM debian:bookworm-slim
WORKDIR /app

# Copy the binary from builder
COPY --from=backend-builder /app/target/release/suraga-website /app/suraga-website

# Copy built frontend assets
COPY --from=frontend-builder /app/frontend/dist ./public

# Set environment variables
ENV PORT=8080
ENV RUST_LOG=info

# Expose the port
EXPOSE 8080

# Run the binary
CMD ["./suraga-website"]
