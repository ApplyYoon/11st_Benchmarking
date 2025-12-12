# Future Database Architecture Plan

This document outlines the architectural implementation plan for the upcoming database migration. The goal is to separate concerns and ensure scalability for handling "lifetime" order history storage without latency.

## 1. Database Separation
The system will be split into three distinct database domains:

### **1. User Database (`User_DB`)**
- **Purpose**: dedicated storage for user profiles and authentication data.
- **Key Fields**: `userId` (Primary Key), `username`, `password`, `email`, etc.

### **2. Product Database (`Product_DB`)**
- **Purpose**: Centralized catalog for product information.
- **Key Fields**: `productId` (Primary Key), `name`, `price`, `category`, `stock`, etc.

### **3. Order Database (`Order_DB`)**
- **Purpose**: Permanent storage of all order history.
- **Type**: **NoSQL** (to handle massive scale and flexible schema).

---

## 2. Order_DB Architecture Strategy

The `Order_DB` requires a specific **Sharding** and **Partitioning** strategy to ensure high performance and low latency for history lookups.

### **A. Horizontal Sharding (By User ID)**
To distribute the load, data will be physically split across different database instances based on the `userId`.

- **Logic**: Modulo Sharding
  - **Shard A**: Stores orders for Users with **Odd** IDs (e.g., 1, 3, 5...).
  - **Shard B**: Stores orders for Users with **Even** IDs (e.g., 2, 4, 6...).
- **Benefit**: Distributes write/read load evenly across servers.

### **B. Vertical Partitioning (By Year)**
Within each Shard, data will be further partitioned by time (Year) to keep indices small and queries fast.

- **Logic**: Range Partitioning based on Order Date.
  - `Order_2023` (Collection/Table)
  - `Order_2024` (Collection/Table)
  - `Order_2025` (Collection/Table)
- **Benefit**: Historical data does not slow down queries for recent data. Archiving is seamless.

---

## 3. Data Flow & Implementation Notes

### **Write Path (Order Creation)**
1.  **Input**: User `101` orders Product `50`.
2.  **Routing**:
    - `userId` is `101` (Odd) → Route to **Shard A**.
    - Current Year is `2025` → Target Partition `Order_2025`.
3.  **Storage**: Insert document `{ "userId": 101, "productId": 50, "date": "2025-12-13", ... }`.

### **Read Path (History Lookup)**
1.  **Input**: Get history for User `102`.
2.  **Routing**:
    - `userId` is `102` (Even) → Connect to **Shard B**.
3.  **Aggregation**:
    - Query `Order_2025`, `Order_2024`, etc., potentially in parallel or lazily depending on UI needs (e.g., "Show recent 6 months" vs "Show 2023 history").

## 4. Implementation Prompt (For Future AI)
> **If the user asks to "Implement the Database Plan":**
> 1. Refer to this document.
> 2. Spin up NoSQL containers (e.g., MongoDB Sharded Cluster or separate instances).
> 3. Implement a Database Router/Resolver in the Backend (Spring Boot) to handle the `Odd/Even` routing logic.
> 4. Implement dynamic collection/table selection based on the current year.
