# Stage 1: Build Backend
FROM rust:1.83-slim-bookworm as backend-builder
RUN apt-get update && apt-get install -y --no-install-recommends build-essential pkg-config && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY Cargo.toml Cargo.lock* ./
COPY src/ ./src/
RUN cargo build --release

# Stage 2: Runtime
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=backend-builder /app/target/release/suraga-website /app/suraga-website
COPY public/ ./public/
ENV PORT=8080
ENV RUST_LOG=info
EXPOSE 8080
CMD ["./suraga-website"]
