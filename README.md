# Prometheus Alert to Nextcloud Talk Forwarder

A production-ready Node.js service that forwards Prometheus alerts to a Nextcloud Talk chat room via webhooks.

## Features

- Receives Prometheus alerts via webhook
- Forwards formatted alert messages to Nextcloud Talk
- Production-ready with:
  - Rate limiting with metrics for auto-scaling
  - Structured logging with Pino
  - Environment validation
  - Prometheus metrics
  - Health check endpoint
  - TypeScript for type safety
- Containerized with multi-stage builds for minimal image size

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and configure your environment variables:
   ```bash
   cp .env.example .env
   ```
4. For production, build and start:
   ```bash
   npm run build
   npm start
   ```

## Configuration

Configure the following environment variables:

### Server Configuration
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment ('development', 'production', 'test')
- `LOG_LEVEL`: Logging level ('fatal', 'error', 'warn', 'info', 'debug', 'trace')

### Nextcloud Configuration
- `NEXTCLOUD_URL`: Your Nextcloud instance URL
- `NEXTCLOUD_TALK_ROOM`: The room token where alerts will be sent
- `NEXTCLOUD_BOT_USERNAME`: Bot username for authentication
- `NEXTCLOUD_BOT_PASSWORD`: Bot password for authentication

### Rate Limiting
- `RATE_LIMIT_PER_MINUTE`: Maximum requests per minute (default: 120)
- `RATE_LIMIT_WINDOW_MS`: Rate limit window in milliseconds (default: 60000)

## API Endpoints

### Webhook
- `POST /webhook`: Receives Prometheus alerts

### Monitoring
- `GET /health`: Health check endpoint
- `GET /metrics`: Prometheus metrics endpoint
- `GET /metrics/ratelimit`: Rate limit metrics for scaling

## Kubernetes Deployment

### Auto-scaling

The service provides metrics for Kubernetes HPA (Horizontal Pod Autoscaler) through the `/metrics/ratelimit` endpoint. You can configure HPA to scale based on the rate limit usage:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: prometheus-nextcloud-forwarder
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: prometheus-nextcloud-forwarder
  minReplicas: 1
  maxReplicas: 10
  metrics:
  - type: Pods
    pods:
      metric:
        name: rate_limit_usage_ratio
      target:
        type: AverageValue
        averageValue: 0.8  # Scale up when usage is at 80%
```

### Prometheus Service Monitor

To scrape metrics with Prometheus, configure a ServiceMonitor:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: prometheus-nextcloud-forwarder
spec:
  selector:
    matchLabels:
      app: prometheus-nextcloud-forwarder
  endpoints:
  - port: http
    path: /metrics
```

## Prometheus AlertManager Configuration

Add the following to your Prometheus Alertmanager configuration:

```yaml
receivers:
  - name: 'nextcloud-talk'
    webhook_configs:
      - url: 'http://your-service:3000/webhook'
        send_resolved: true
```

## Monitoring and Logging

### Available Metrics

- `rate_limit_hits_total`: Counter of rate limit hits
- `rate_limit_usage_ratio`: Current ratio of rate limit usage (0-1)
- Standard HTTP metrics (requests, latency, etc.)

### Log Format

Logs are in JSON format in production and prettified in development. Each log entry includes:
- Timestamp
- Log level
- Request path (for HTTP requests)
- Alert details (when processing alerts)
- Error details (when applicable)

## Development

```bash
# Run tests
npm test

# Run with watch mode
npm run dev

# Build for production
npm run build
```

