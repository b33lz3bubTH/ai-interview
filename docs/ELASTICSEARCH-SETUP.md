# Elasticsearch & Kibana Integration Setup

## ✅ Current Status

Your tRPC microservices application is **successfully connected** to Docker Elasticsearch and Kibana instances!

## 🔌 Connection Details

- **Elasticsearch**: `http://localhost:9200` ✅ Connected
- **Kibana**: `http://localhost:5601` ✅ Running
- **Log Index**: `trpc-logs-*` ✅ Receiving logs
- **Current Index**: `trpc-logs-2025.08.16` (33+ log entries)

## 📊 Viewing Logs in Kibana

### **Step 1: Access Kibana**
Open your browser and go to: `http://localhost:5601`

### **Step 2: Create Index Pattern**
1. Go to **Stack Management** → **Index Patterns**
2. Click **Create index pattern**
3. Enter: `trpc-logs-*`
4. Click **Next step**
5. Set **Time field** to: `@timestamp`
6. Click **Create index pattern**

### **Step 3: View Logs**
1. Go to **Discover**
2. Select your `trpc-logs-*` index pattern
3. Set time range (e.g., Last 24 hours)
4. View and search your logs!

## 🧪 Testing Commands

```bash
# Test Elasticsearch connection
npm run test:elasticsearch

# Setup Kibana index pattern
npm run setup:kibana

# Check log status
npm run logs:status

# Monitor logs in real-time
npm run logs:monitor
```

## 📝 Log Format in Elasticsearch

Your logs are stored with this structure:
```json
{
  "@timestamp": "2025-08-16T08:39:01.013Z",
  "message": "Server running on port 3000",
  "severity": "info",
  "fields": {
    "service": "trpc-microservices",
    "environment": "development",
    "version": "1.0.0",
    "timestamp": "2025-08-16T08:39:01.013Z"
  }
}
```

## 🔧 Configuration

### **Environment Variables**
```bash
ELASTIC_URL=http://localhost:9200
ELASTIC_USERNAME=elastic
ELASTIC_PASSWORD=changeme
```

### **Docker Containers**
- **Elasticsearch**: Port 9200
- **Kibana**: Port 5601

## 🚀 What's Working

✅ **Daily log rotation** with file compression  
✅ **Elasticsearch ingestion** of all application logs  
✅ **Structured JSON logging** with metadata  
✅ **Automatic index creation** with daily naming  
✅ **Real-time log streaming** to Elasticsearch  

## 🎯 Next Steps

1. **Access Kibana** and create the index pattern
2. **Explore your logs** in the Discover view
3. **Create dashboards** for monitoring
4. **Set up alerts** based on log patterns
5. **Configure log retention** policies

## 🆘 Troubleshooting

### **If logs aren't appearing:**
```bash
# Check Elasticsearch connection
curl http://localhost:9200

# Check if indices exist
curl "http://localhost:9200/_cat/indices/trpc-logs-*"

# Test log ingestion
npm run test:elasticsearch
```

### **If Kibana isn't accessible:**
```bash
# Check container status
docker ps | grep kibana

# Check container logs
docker logs <kibana-container-id>
```

---

**🎉 Your logging pipeline is now fully operational!** 