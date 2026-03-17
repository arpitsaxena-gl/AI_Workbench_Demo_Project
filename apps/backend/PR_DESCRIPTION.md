# PR Title

**fix: Add admin value in validateLogin response and add automated tests**

---

## Description

This PR fixes the `validateLogin` endpoint to correctly return the user's admin status in the response and introduces automated tests for the user router.

**Problem solved:**
- The `validateLogin` endpoint was returning `admin: false` for all users, regardless of their actual `isAdmin` value in the database.
- Clients could not rely on the login response to determine admin privileges without decoding the JWT.

**Change:**
- The response now includes `admin: user.isAdmin`, reflecting the user's actual admin status from the database.
- The JWT payload already contained `isAdmin`; the response body now exposes it for direct client use.

**Additional:**
- Jest and Supertest are added for automated testing.
- Tests cover `validateLogin` and `register` endpoints with success, failure, and edge cases.

---

## Entry Paths

**Path 1:** API endpoint `POST /api/v1/user/validateLogin`  
**Path 2:** API endpoint `POST /api/v1/user/register`

---

## Feature Flags

None.

---

## Component / Module Integration Details

**validateLogin:**
- Uses `Users.findOne({ userId: req.body.email })` to fetch the user.
- Returns `{ user, token, admin }` on success.
- `admin` is taken from `user.isAdmin` in the database.

**Integration:**
- Clients call `POST /api/v1/user/validateLogin` with `{ email, password }`.
- Response includes `admin` for UI role checks without JWT decoding.

**Code change:**
```javascript
res.status(200).send({ user: user.userId, token: token, admin: user.isAdmin });
```

---

## Navigation / Usage Flow

**Request flow:**
1. Client sends `POST { email, password }` to `/api/v1/user/validateLogin`.
2. Server validates credentials and returns `{ user, token, admin }`.
3. Client uses `admin` for role-based UI and routing.

**Register flow:**
1. Client sends `POST` with user data to `/api/v1/user/register`.
2. Server validates uniqueness and saves the user.
3. Server returns `201` with created user.

---

## Data Flow

**validateLogin:**
- **Input:** `{ email: string, password: string }`
- **Process:** User lookup → `bcrypt.compareSync` → JWT sign
- **Success:** `{ user, token, admin }` (200)
- **Errors:** `"user not found"` (400), `"password is incorrect"` (400)

**register:**
- **Input:** `{ name, userId, password, address1, address2, pincode, mobileNumber, isAdmin }`
- **Process:** User lookup → `bcrypt.hashSync` → save
- **Success:** Created user object (201)
- **Errors:** `"Username and email already exists"` (400), save error (500)

---

## Dependencies

**New devDependencies:**
- `jest` ^29.7.0 – test framework
- `supertest` ^6.3.4 – HTTP assertions for API tests

---

## JIRA Ticket

No Jira ticket provided.

---

## Demo / Screenshots / Evidence

Not applicable.

---

## Files Changed

**New Files Created**
- `__tests__/routers/user.test.js` – Tests for validateLogin and register
- `jest.config.js` – Jest configuration

**Modified Files**
- `routers/user.js` – Response now returns `admin: user.isAdmin` instead of `admin: false`
- `package.json` – Added Jest, supertest, and test scripts

**Deleted Files**

None.

---

## Testing Summary

**Automated tests:**
- 9 tests for `validateLogin` (5) and `register` (4)
- **validateLogin:** user not found, wrong password, missing password, success, admin user
- **register:** success, duplicate userId, save failure, admin creation

**Run tests:**
```bash
npm test
npm run test:coverage
```

**Coverage:** ~62.5% for `user.js` (validateLogin and register are fully covered; GET routes are not).

---

## Risk Assessment

**Low**

- Small change; only response body is corrected.
- Tests are added and passing.
- No breaking changes to existing behavior.

---

## Reviewer Checklist

- [ ] Code follows repository standards
- [ ] Logic aligns with Jira description (if provided)
- [ ] No unnecessary dependencies introduced
- [ ] Error handling implemented
- [ ] No security risks introduced
- [ ] Performance impact considered
- [ ] Tests updated if necessary
- [ ] Test coverage ≥ 85% *(validateLogin and register covered; overall user.js below 85% due to untested GET routes)*

---

## Notes

- `admin` may be `undefined` for users created before the `isAdmin` field existed; clients should treat `undefined` as non-admin.
- GET routes (`/`, `/:id`, `get/count`) are not covered by tests in this PR.
