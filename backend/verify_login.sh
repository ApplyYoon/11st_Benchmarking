#!/bin/bash

# Generates a random email to ensure unique signup
EMAIL="test_$(date +%s)@example.com"
PASSWORD="password123"

echo "1. Signup..."
curl -s -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\", \"name\": \"Test User\"}"

echo -e "\n\n2. Login and Check Headers..."
LOGIN_RESPONSE=$(curl -v -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}" 2>&1)

echo "$LOGIN_RESPONSE"

if echo "$LOGIN_RESPONSE" | grep -q "SameSite=Lax"; then
  echo -e "\n\n[SUCCESS] Set-Cookie with SameSite=Lax FOUND"
else
  echo -e "\n\n[FAILURE] Set-Cookie with SameSite=Lax NOT FOUND"
fi

if echo "$LOGIN_RESPONSE" | grep -q "HttpOnly"; then
  echo "[SUCCESS] Set-Cookie with HttpOnly FOUND"
else
  echo "[FAILURE] Set-Cookie with HttpOnly NOT FOUND"
fi
