# 🚀 **DEPLOY CHECKLIST - DO THIS NOW**

## 1. **Git Push** (Triggers Render)
```
git add .
git commit -m "fix: complete /api/auth skip (final 403)"
git push origin main
```

## 2. **Wait Render Deploy** (~2 min)
Check https://dashboard.render.com → Green ✓

## 3. **TEST LOGIN**
```
curl -X POST https://ticketing-backend-9byp.onrender.com/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"admin@ticketing.com","password":"admin123"}'
```

**Expected**: `{"token":"eyJ...", "role":"ADMIN"}`

## 4. **Update Vercel Frontend**
Vercel Dashboard → Environment vars:
```
NEXT_PUBLIC_API_URL=https://ticketing-backend-9byp.onrender.com
```

## 5. **Frontend Deploy** 
```
cd frontend
git add .
git commit -m "update api url"
git push
```

## ✅ **DONE** - Full-stack live!

**Postman**: Import POSTMAN_TESTS.json → Set `base_url = https://ticketing-backend-9byp.onrender.com` → Run all ✓
