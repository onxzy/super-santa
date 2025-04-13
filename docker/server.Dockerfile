# syntax=docker.io/docker/dockerfile:1

# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install required dependencies including gcc and build tools for CGO
RUN apk add --no-cache git gcc musl-dev

# Download Go modules
COPY server/go.mod server/go.sum ./
RUN go mod download

# Copy source code
COPY server/ ./

# Build the application with CGO enabled
RUN CGO_ENABLED=1 GOOS=linux go build -o /app/server

# Final stage
FROM alpine:latest

WORKDIR /app

# Install dependencies required at runtime
RUN apk --no-cache add ca-certificates tzdata

# Copy binary and config from the builder stage
COPY --from=builder /app/server /app/server
COPY --from=builder /app/templates /app/templates

# Create directory for database if it doesn't exist
RUN mkdir -p /app/data

# Create non-root user for running the application
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app

USER appuser

# Expose the application port
EXPOSE 8080

# Define volumes for database and config
VOLUME ["/app/data", "/app/config.yaml"]

# Run the application
CMD ["/app/server"]