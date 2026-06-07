# Auth Testing Playbook (Crescent Loom)

This app uses Emergent-managed Google OAuth.

## Quick Test Identity Setup
```bash
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var token = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'test.curator@crescentloom.com',
  name: 'Test Curator',
  picture: 'https://via.placeholder.com/150',
  is_admin: true,
  created_at: new Date().toISOString()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: token,
  expires_at: new Date(Date.now()+7*24*3600*1000).toISOString(),
  created_at: new Date().toISOString()
});
print('Token: ' + token);
print('User ID: ' + userId);
"
```

## Test backend (curl)
```
curl -X GET "$BASE/api/auth/me" -H "Authorization: Bearer $TOKEN"
curl -X GET "$BASE/api/wishlist" -H "Authorization: Bearer $TOKEN"
curl -X GET "$BASE/api/admin/orders" -H "Authorization: Bearer $TOKEN"
```

## Test browser
```python
await page.context.add_cookies([{
  "name": "session_token",
  "value": TOKEN,
  "domain": "artisan-crescent.preview.emergentagent.com",
  "path": "/",
  "httpOnly": True,
  "secure": True,
  "sameSite": "None"
}])
await page.goto("https://artisan-crescent.preview.emergentagent.com/account")
```

## Clean
```
db.users.deleteMany({email: /test\.curator/});
db.user_sessions.deleteMany({session_token: /test_session/});
```
