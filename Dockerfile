# Stage 1: Build Rust API/redirect service
FROM rust:1.87-bookworm AS builder
WORKDIR /app

COPY Cargo.toml Cargo.lock ./
COPY src ./src

RUN cargo build --release

# Stage 2: Minimal runtime
FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/target/release/suraga-website /usr/local/bin/suraga-website

ENV PORT=8080
EXPOSE 8080

CMD ["suraga-website"]
