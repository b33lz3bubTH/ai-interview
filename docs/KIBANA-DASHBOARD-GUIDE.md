# 🌐 Kibana Dashboard Guide - Centralized Log Monitoring

## 🚀 **Quick Start: View Your Logs**

### **Step 1: Access Kibana**
```
🌐 Open: http://localhost:5601
```

### **Step 2: Create Index Pattern (First Time)**
1. **Stack Management** → **Index Patterns**
2. **Create index pattern**
3. **Pattern name**: `trpc-logs-*`
4. **Time field**: `@timestamp`
5. **Create index pattern**

### **Step 3: View Logs**
1. **Discover** → Select `trpc-logs-*`
2. **Time range**: Last 24 hours
3. **🎉 View your centralized logs!**

## 📊 **Dashboard Features**

### **🔍 Search & Filter**
- **Free text search**: Type any term
- **Field filters**: Click `+` next to field values
- **Time filtering**: Use time picker

### **📋 Available Log Fields**
```
message          → Log message content
severity         → Log level (info/warn/error)
fields.service   → Service name
fields.environment → Environment
fields.version   → App version
@timestamp      → Log timestamp
```

## 🎯 **Sample Queries to Try**

### **Basic Searches**
```kql
# All logs
* 

# Only errors
severity:error

# Specific service
fields.service:trpc-microservices

# Development environment
fields.environment:development
```

### **Advanced Searches**
```kql
# Logs containing "started"
message:*started*

# Logs from last hour
@timestamp:[now-1h TO now]

# Errors in development
severity:error AND fields.environment:development

# Multiple services (if you have them)
fields.service:(trpc-microservices OR user-service)
```

### **Time-Based Queries**
```kql
# Last 15 minutes
@timestamp:[now-15m TO now]

# Today
@timestamp:[now/d TO now]

# This week
@timestamp:[now/w TO now]
```

## 📈 **Creating Visualizations**

### **1. Log Volume Over Time**
- **Type**: Line chart
- **X-axis**: `@timestamp` (Date Histogram)
- **Y-axis**: Count
- **Filter**: `*`

### **2. Log Level Distribution**
- **Type**: Pie chart
- **Slices**: `severity` (Terms)
- **Size**: Count

### **3. Top Log Messages**
- **Type**: Data table
- **Rows**: `message` (Terms)
- **Size**: Count
- **Sort**: Count (Descending)

### **4. Service Activity**
- **Type**: Bar chart
- **X-axis**: `fields.service` (Terms)
- **Y-axis**: Count

## 🎨 **Building Your Dashboard**

### **Step 1: Create Visualizations**
1. **Visualize Library** → **Create visualization**
2. Choose chart type
3. Select `trpc-logs-*` index pattern
4. Configure metrics and buckets
5. **Save** with descriptive names

### **Step 2: Create Dashboard**
1. **Dashboard** → **Create dashboard**
2. **Add** your saved visualizations
3. **Add** saved search for raw logs
4. **Arrange** components as needed
5. **Save** as "tRPC Microservices Monitoring"

## 🔍 **Real-Time Monitoring**

### **Live Log Stream**
1. **Discover** → Select index pattern
2. **Auto-refresh**: Set to 5-10 seconds
3. **Time range**: Last 15 minutes
4. **Watch logs in real-time!**

### **Alert Setup (Future)**
- **Stack Management** → **Rules and Alerts**
- **Create rule** for error thresholds
- **Set notifications** for critical issues

## 📱 **Dashboard Layout Example**

```
┌─────────────────────────────────────────────────────────┐
│                    tRPC Microservices Monitoring        │
├─────────────────────────────────────────────────────────┤
│  [Time Range Picker]                    [Refresh]      │
├─────────────────────────────────────────────────────────┤
│  📊 Log Volume Over Time                                │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                    Line Chart                       │ │
│  └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  📈 Log Levels          📋 Top Messages                │
│  ┌─────────────┐        ┌─────────────────────────────┐ │
│  │ Pie Chart   │        │ Data Table                  │ │
│  │             │        │                             │ │
│  └─────────────┘        └─────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  📝 Recent Logs (Saved Search)                         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Raw log entries with filters                        │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 🚨 **Monitoring Best Practices**

### **Daily Checks**
- **Log volume** - Sudden spikes/drops
- **Error rates** - Monitor `severity:error`
- **Service health** - Check startup/shutdown logs

### **Weekly Reviews**
- **Performance trends** - Response times, throughput
- **Error patterns** - Common failure modes
- **Resource usage** - Memory, CPU patterns

### **Monthly Analysis**
- **Usage patterns** - Peak hours, seasonal trends
- **Service reliability** - Uptime, error rates
- **Capacity planning** - Growth trends

## 🆘 **Troubleshooting**

### **Logs Not Appearing?**
```bash
# Check Elasticsearch
curl http://localhost:9200

# Check indices
curl "http://localhost:9200/_cat/indices/trpc-logs-*"

# Test connection
npm run test:elasticsearch
```

### **Dashboard Issues?**
- **Clear browser cache**
- **Check index pattern** exists
- **Verify time range** is correct
- **Refresh page**

### **Performance Issues?**
- **Reduce time range** (e.g., Last 1 hour)
- **Add filters** to narrow search
- **Use saved searches** for common queries

## 🎯 **Next Steps**

1. **✅ View your logs** in Discover
2. **📊 Create basic visualizations**
3. **🎨 Build your dashboard**
4. **🔍 Set up saved searches**
5. **⏰ Configure auto-refresh**
6. **🚨 Set up alerts** (future)

---

**🎉 You now have a powerful centralized logging dashboard!**

**Access it at**: `http://localhost:5601` 