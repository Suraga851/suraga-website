# Build Stage
FROM rust:1.83-slim-bookworm as builder

WORKDIR /app
COPY . .

# Build for release
RUN cargo build --release

# Runtime Stage
FROM debian:bookworm-slim

WORKDIR /app

# Copy the binary from builder
COPY --from=builder /app/target/release/suraga-website /app/suraga-website

# Copy static assets
COPY public ./public

# Set environment variables
ENV PORT=8080
ENV RUST_LOG=info

# Expose the port
EXPOSE 8080

# Run the binary
CMD ["./suraga-website"]
