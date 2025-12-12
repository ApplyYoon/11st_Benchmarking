#!/bin/bash

# Configuration
API_URL="http://localhost:8080/api/auth"
SCORE=0

# Clean up cookie file
rm -f cookies.txt

echo "1. Signup..."
SIGNUP_RESPONSE=$(curl -s -X POST "$API_URL/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test_$(date +%s)@example.com\", \"password\":\"password123\", \"name\":\"Test User\"}")
echo "$SIGNUP_RESPONSE"
echo ""

# Extract Email (simple grep/sed, assuming JSON format)
EMAIL=$(echo "$SIGNUP_RESPONSE" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)

if [ -z "$EMAIL" ]; then
  echo "[FAILURE] Signup failed, no email returned."
  exit 1
fi

echo "2. Login and Check Headers..."
# We use -v (verbose) to see headers, and stderr to capture them
LOGIN_RESPONSE=$(curl -v -c cookies.txt -X POST "$API_URL/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\", \"password\":\"password123\"}" 2>&1)

echo "$LOGIN_RESPONSE"
echo ""
echo ""

# Verify SameSite=Lax
if echo "$LOGIN_RESPONSE" | grep -q "SameSite=Lax"; then
  echo "[SUCCESS] Set-Cookie with SameSite=Lax FOUND"
  SCORE=$((SCORE+1))
else
  echo "[FAILURE] Set-Cookie with SameSite=Lax NOT FOUND"
fi

# Verify HttpOnly
if echo "$LOGIN_RESPONSE" | grep -q "HttpOnly"; then
  echo "[SUCCESS] Set-Cookie with HttpOnly FOUND"
  SCORE=$((SCORE+1))
else
  echo "[FAILURE] Set-Cookie with HttpOnly NOT FOUND"
fi

exit 0
