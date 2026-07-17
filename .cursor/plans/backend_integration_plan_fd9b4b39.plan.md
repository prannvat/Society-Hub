---
name: Backend Integration Plan
overview: Define the backend API changes and database schema updates required to support the Union Committee Validation System with university entities, committee request workflows, and union admin roles.
todos: []
isProject: false
---

# Backend Integration Plan for Union Committee Validation System

## Current Backend Gap Analysis

Based on the subagent findings, your backend currently has:
- Society-scoped admin roles (`MEMBER`, `COMMITTEE`, `PRESIDENT`)  
- Basic `/me` endpoint with free-text `university` field
- Society CRUD with instant creation (no approval queue)
- Membership join API that ignores `joinPolicy` enforcement
- Admin API stubs for membership requests (defined but not enforced in UI)

**Missing for union validation:**
- University as a managed entity (currently free text)
- Union admin roles and permissions
- Committee request workflow and approval system
- Society registration approval queue
- Student verification mechanisms

## Required Database Schema Changes

### 1. University Entity
```sql
CREATE TABLE universities (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  short_name VARCHAR(100),
  domain VARCHAR(100), -- for email verification
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE university_settings (
  university_id UUID PRIMARY KEY REFERENCES universities(id),
  require_email_verification BOOLEAN DEFAULT false,
  allow_self_society_creation BOOLEAN DEFAULT true,
  require_society_approval BOOLEAN DEFAULT false,
  require_committee_approval BOOLEAN DEFAULT true,
  max_societies_per_student INTEGER DEFAULT 10,
  default_join_policy VARCHAR(50) DEFAULT 'OPEN',
  committee_request_expiry_days INTEGER DEFAULT 30
);
```

### 2. Union Admin Roles
```sql
CREATE TABLE union_admin_roles (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL, -- FK to your users table
  university_id UUID NOT NULL REFERENCES universities(id),
  role VARCHAR(50) NOT NULL, -- 'UnionAdmin', 'UnionModerator'
  permissions TEXT[], -- array of permission strings
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID -- FK to user who granted this role
);
```

### 3. Committee Requests
```sql
CREATE TABLE committee_requests (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  society_id UUID NOT NULL, 
  university_id UUID NOT NULL REFERENCES universities(id),
  requested_role VARCHAR(50) NOT NULL, -- 'Committee', 'President'
  current_role VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'
  justification TEXT NOT NULL,
  supporting_evidence TEXT[],
  requested_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by UUID, -- FK to union admin user
  reviewer_comments TEXT,
  expires_at TIMESTAMP,
  INDEX idx_university_status (university_id, status),
  INDEX idx_user_society (user_id, society_id)
);
```

### 4. Society Registration Updates
```sql
-- Add to existing societies table
ALTER TABLE societies ADD COLUMN university_id UUID REFERENCES universities(id);
ALTER TABLE societies ADD COLUMN registration_status VARCHAR(50) DEFAULT 'APPROVED';
ALTER TABLE societies ADD COLUMN proof_of_recognition_url TEXT;
ALTER TABLE societies ADD COLUMN requested_by UUID;
ALTER TABLE societies ADD COLUMN approved_by UUID;
ALTER TABLE societies ADD COLUMN approved_at TIMESTAMP;

-- Migration: populate university_id from existing university text field
-- UPDATE societies SET university_id = (SELECT id FROM universities WHERE name = societies.university);
```

### 5. User Verification
```sql
-- Add to existing users table
ALTER TABLE users ADD COLUMN university_id UUID REFERENCES universities(id);
ALTER TABLE users ADD COLUMN is_verified_student BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN verification_method VARCHAR(50); -- 'email_domain', 'manual', 'sso'
ALTER TABLE users ADD COLUMN verified_at TIMESTAMP;
ALTER TABLE users ADD COLUMN verified_by UUID;
```

## Required API Endpoints

### 1. University Management APIs
```
GET /universities
GET /universities/:id
POST /universities (union admin only)
PATCH /universities/:id (union admin only)
GET /universities/:id/settings
PATCH /universities/:id/settings (union admin only)
```

### 2. Union Admin APIs
```
GET /me?include=unionAdminRoles
GET /union-admin/universities/:universityId/committee-requests
POST /union-admin/committee-requests/:id/approve
POST /union-admin/committee-requests/:id/reject  
POST /union-admin/committee-requests/bulk-approve
POST /union-admin/committee-requests/bulk-reject
GET /union-admin/universities/:universityId/analytics
GET /union-admin/universities/:universityId/members
```

### 3. Committee Request APIs
```
POST /committee-requests (student creates request)
GET /committee-requests/me (student views their requests)
PATCH /committee-requests/:id (student edits pending request)
DELETE /committee-requests/:id (student cancels request)
GET /committee-requests/:id/status (public status check)
```

### 4. Enhanced Society APIs
```
POST /societies (now requires approval if university settings require it)
GET /societies/:id/registration-status
POST /union-admin/society-requests/:id/approve
POST /union-admin/society-requests/:id/reject
```

### 5. Enhanced Membership APIs
```
POST /memberships/join (now enforces joinPolicy and verification status)
GET /admin/societies/:id/membership-requests (existing, needs UI integration)
POST /admin/membership-requests/:id/approve (existing)
POST /admin/membership-requests/:id/reject (existing)
```

## API Security & Authorization

### 1. Permission System
```typescript
// New permission types needed
type UnionPermission = 
  | 'APPROVE_COMMITTEES'
  | 'APPROVE_SOCIETIES' 
  | 'MODERATE_CONTENT'
  | 'MANAGE_UNIVERSITY_SETTINGS'
  | 'VIEW_ANALYTICS'
  | 'MANAGE_MEMBERS'
  | 'BULK_ACTIONS';

// Authorization middleware for union admin endpoints
function requireUnionAdmin(universityId: string, permission: UnionPermission) {
  // Check user has union admin role for this university with required permission
}
```

### 2. Enhanced API Client Headers
The frontend will send these new headers for union admin operations:
```
Authorization: Bearer <token>
x-admin-university-id: <universityId>  // for union admin context
x-admin-society-id: <societyId>        // existing society admin context
```

### 3. Rate Limiting
Implement rate limiting for:
- Committee request creation: 1 per society per user per week
- Society registration: 2 per user per month
- Bulk operations: 100 items per request max

## Business Logic Changes

### 1. Committee Role Promotion Flow
**Before:** President directly assigns Committee role via `PATCH /memberships/:id/role`
**After:** 
1. User submits committee request via `POST /committee-requests`
2. Request enters `PENDING` state with expiry (30 days default)
3. Union admin approves/rejects via union dashboard
4. On approval, membership role is automatically updated
5. User receives notification of decision

### 2. Society Creation Flow  
**Before:** `POST /societies` creates society instantly, user becomes President
**After:**
1. Check university settings: if `require_society_approval = true`
2. Create society with `registration_status = 'PENDING'`  
3. Store `proof_of_recognition_url` from request
4. Union admin reviews and approves via union dashboard
5. On approval, set status to `APPROVED`, grant President role to creator

### 3. Membership Join Flow
**Before:** `POST /memberships/join` always succeeds
**After:**
1. Check society `joinPolicy`:
   - `OPEN`: immediate join (existing behavior)
   - `APPROVAL_REQUIRED`: create membership request, notify society admins
   - `VERIFIED_STUDENTS_ONLY`: check user `is_verified_student`, reject if false
2. Enforce verification status before allowing joins

### 4. Student Verification Options
Implement one or more verification methods:
- **Email domain verification:** Check user email against university domain list
- **Manual verification:** Union admin manually approves students 
- **SSO integration:** Use university SSO claims for automatic verification

## Data Migration Strategy

### 1. University Seeding
```sql
-- Create default universities from existing society.university values
INSERT INTO universities (id, name, short_name)
SELECT DISTINCT uuid_generate_v4(), university, university 
FROM societies 
WHERE university IS NOT NULL;

-- Link existing societies to university entities  
UPDATE societies s 
SET university_id = u.id
FROM universities u 
WHERE s.university = u.name;
```

### 2. Backward Compatibility
- Keep existing `university` text field during transition
- Maintain existing society admin APIs alongside new union admin APIs
- Gradual rollout: start with committee approval, then add society approval

## Integration Timeline

### Phase 1: Foundation (Week 1)
- Create university entities and settings tables
- Add union admin roles system
- Update `/me` endpoint to include union admin roles

### Phase 2: Committee Requests (Week 2) 
- Implement committee request CRUD APIs
- Add approval/rejection endpoints for union admins
- Update membership role assignment to check for approved requests

### Phase 3: Society Registration (Week 3)
- Add society approval workflow
- Implement union admin society management APIs  
- Update society creation flow based on university settings

### Phase 4: Enhanced Enforcement (Week 4)
- Implement student verification system
- Enforce joinPolicy rules in membership API
- Add analytics and monitoring for union admins

## Testing Requirements

### 1. API Contract Testing
- Ensure all existing society admin APIs continue working
- Test new union admin endpoints with proper authorization
- Verify rate limiting and permission enforcement

### 2. Workflow Testing  
- Test complete committee request approval flow
- Verify society registration approval workflow
- Test membership join enforcement for different joinPolicy values

### 3. Migration Testing
- Test university data migration with existing societies
- Verify backward compatibility during transition period
- Test rollback procedures if needed

## Documentation Deliverables

1. **Updated OpenAPI specification** with all new endpoints
2. **Database schema migration scripts** with rollback procedures  
3. **API integration guide** for frontend team
4. **Admin user guide** for union administrators
5. **Deployment guide** with environment variable updates

This plan provides your backend team with everything needed to implement the union committee validation system while maintaining compatibility with existing functionality.