# 🧪 LEAD CAPTURE API UNIT TESTS

## Overview
Comprehensive unit tests for lead capture API endpoint using Jest (TypeScript/Node.js) and Pytest (Python/Flask).

## Test Coverage Areas

### ✅ **Input Validation Tests**
- Required field validation (name, email, industry, budget, user_type, consent)
- Optional field validation (company, phone, message, source)
- Data type validation (email format, phone format, budget format)
- Length validation (min/max character limits)
- Enum validation (industry, user_type allowed values)

### ✅ **Security Tests**
- XSS attack detection and prevention
- SQL injection detection and prevention
- Input sanitization verification
- Suspicious pattern detection
- Security event logging verification

### ✅ **Rate Limiting Tests**
- Requests within limit acceptance
- Requests exceeding limit rejection
- Rate limit reset behavior
- Different IP address handling

### ✅ **Status Code Tests**
- 201 Created for successful lead creation
- 400 Bad Request for validation errors
- 409 Conflict for duplicate leads
- 429 Too Many Requests for rate limit exceeded
- 500 Internal Server Error for system failures

### ✅ **Error Handling Tests**
- Malformed JSON handling
- Empty request body handling
- Large payload handling
- Database error handling
- Network error handling

### ✅ **Edge Cases Tests**
- Unicode character handling
- HTML entity handling
- Boundary value testing
- Null/None value handling
- Optional field omission

## Test Files Structure

### **Jest/TypeScript Tests** (`tests/lead-capture.test.ts`)
```typescript
describe('Lead Capture API Endpoint', () => {
  describe('Success Cases', () => {
    // Test valid lead creation scenarios
  });
  
  describe('Input Validation', () => {
    // Test all validation rules
  });
  
  describe('Security Tests', () => {
    // Test XSS, SQL injection, sanitization
  });
  
  describe('Rate Limiting', () => {
    // Test rate limiting behavior
  });
  
  describe('Error Handling', () => {
    // Test error scenarios
  });
  
  describe('Status Code Compliance', () => {
    // Test HTTP status codes
  });
});
```

### **Pytest/Python Tests** (`tests/test_lead_capture.py`)
```python
class TestLeadValidation:
    """Test lead validation"""
    
    def test_valid_lead_data(self):
        """Test that valid lead data passes validation"""
    
    def test_missing_required_fields(self):
        """Test validation fails with missing required fields"""

class TestSecurityFeatures:
    """Test security features"""
    
    def test_xss_detection(self):
        """Test XSS detection and rejection"""
    
    def test_sql_injection_detection(self):
        """Test SQL injection detection and rejection"""

class TestLeadCaptureEndpoint:
    """Test lead capture API endpoint"""
    
    def test_successful_lead_creation(self):
        """Test successful lead creation"""
```

## Test Data Examples

### **Valid Lead Data**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "company": "Acme Corp",
  "phone": "+1 (555) 123-4567",
  "industry": "ecommerce",
  "budget": "$10,000",
  "message": "Interested in your influencer marketing platform",
  "user_type": "brand",
  "consent": true,
  "source": "website"
}
```

### **Invalid Lead Data Examples**
```json
{
  "name": "<script>alert('xss')</script>",
  "email": "invalid-email",
  "industry": "invalid-industry",
  "budget": "invalid-budget",
  "user_type": "invalid-type",
  "consent": false
}
```

## Security Test Payloads

### **XSS Payloads**
- `<script>alert("xss")</script>`
- `javascript:alert(1)`
- `<img src=x onerror=alert(1)>`
- `<svg onload=alert(1)>`

### **SQL Injection Payloads**
- `'; DROP TABLE users; --`
- `' OR '1'='1`
- `'; INSERT INTO users VALUES('hacker','password'); --`

## Expected Response Formats

### **Success Response (201)**
```json
{
  "success": true,
  "lead_id": "lead_1701234567_abc12345",
  "message": "Thank you for your interest! We'll contact you within 24 hours.",
  "code": "SUCCESS"
}
```

### **Validation Error Response (400)**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Name must be between 2 and 100 characters", "Valid email address is required"],
  "code": "VALIDATION_ERROR"
}
```

### **Security Violation Response (400)**
```json
{
  "success": false,
  "message": "Invalid input detected",
  "code": "SECURITY_VIOLATION"
}
```

### **Rate Limit Exceeded Response (429)**
```json
{
  "success": false,
  "message": "Too many lead submissions. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

## Test Execution

### **Jest Tests**
```bash
# Install dependencies
npm install --save-dev jest @types/jest ts-jest supertest

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test lead-capture.test.ts
```

### **Pytest Tests**
```bash
# Install dependencies
pip install -r requirements.txt

# Run tests
pytest tests/test_lead_capture.py -v

# Run tests with coverage
pytest tests/test_lead_capture.py --cov=api --cov-report=html

# Run specific test class
pytest tests/test_lead_capture.py::TestLeadValidation -v
```

## Validation Rules

### **Name Field**
- Required: Yes
- Min Length: 2 characters
- Max Length: 100 characters
- Allowed: Letters, numbers, spaces, basic punctuation
- Sanitization: Remove HTML tags, JavaScript, event handlers

### **Email Field**
- Required: Yes
- Format: Standard email regex
- Max Length: 254 characters
- Sanitization: Lowercase, trim whitespace

### **Phone Field**
- Required: No
- Format: International phone numbers with + prefix
- Pattern: `^\+?[\d\s\-\(\)]+$`
- Sanitization: Remove non-numeric characters except formatting

### **Industry Field**
- Required: Yes
- Allowed Values: ecommerce, saas, cpg, fashion, tech, healthcare, finance, travel
- Case Sensitivity: Lowercase only

### **Budget Field**
- Required: Yes
- Format: Currency with optional commas
- Pattern: `^\$\d{1,6}(,\d{3})*$`
- Max Value: $999,999

### **User Type Field**
- Required: Yes
- Allowed Values: brand, creator
- Case Sensitivity: Lowercase only

### **Consent Field**
- Required: Yes
- Type: Boolean
- Valid Values: true only (false must be explicitly rejected)

## Security Measures

### **Input Sanitization**
- Remove HTML tags: `<[^>]+>`
- Remove JavaScript protocol: `javascript:`
- Remove event handlers: `on\w+\s*=`
- Remove quotes: `"`, `'`
- Remove CSS expressions: `expression\s*\(`
- Trim whitespace

### **Threat Detection Patterns**
- XSS: `<script`, `javascript:`, `on\w+=`, `<img`, `<svg>`
- SQL Injection: `union select`, `drop table`, `insert into`, `--`, `/* */`
- Code Execution: `exec(`, `eval(`, `system(`, `passthru(`, `shell_exec(`

### **Rate Limiting**
- Limit: 5 requests per 15 minutes per IP
- Window: 15 minutes (900 seconds)
- Response: 429 status when exceeded
- Reset: Automatic after window expires

## Performance Considerations

### **Response Time Targets**
- Validation: < 50ms
- Database Save: < 100ms
- Security Check: < 25ms
- Total Response: < 200ms

### **Memory Usage**
- Input Size Limit: 10KB
- Sanitization Buffer: 5KB
- Response Object: < 1KB

### **Database Optimization**
- Index on email field for duplicate checking
- Async database operations
- Connection pooling
- Query optimization

## Monitoring & Logging

### **Security Events to Log**
- XSS attempts
- SQL injection attempts
- Rate limit violations
- Validation failures
- Suspicious input patterns

### **Business Metrics to Track**
- Lead conversion rate by industry
- Lead source effectiveness
- User type distribution
- Geographic distribution
- Time-based patterns

### **Error Rates to Monitor**
- Validation error rate: Target < 5%
- Security violation rate: Target < 1%
- Database error rate: Target < 0.1%
- Rate limit hit rate: Target < 2%

## Test Environment Setup

### **Jest Configuration** (`jest.config.js`)
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: [
    'api/**/*.ts',
    'utils/**/*.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### **Pytest Configuration** (`pytest.ini`)
```ini
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = 
    --strict-markers
    --strict-config
    --verbose
    --cov=api
    --cov-report=html
    --cov-report=term-missing
    --cov-fail-under=80
markers =
    slow: marks tests as slow (deselect with '-m "not slow"')
    integration: marks tests as integration tests
```

## Continuous Integration

### **GitHub Actions Example**
```yaml
name: Lead Capture Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18, 20]
        python-version: [3.9, 3.10, 3.11]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
    
    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: ${{ matrix.python-version }}
    
    - name: Install Node.js Dependencies
      run: npm ci
    
    - name: Install Python Dependencies
      run: pip install -r requirements.txt
    
    - name: Run Jest Tests
      run: npm test -- --coverage
    
    - name: Run Pytest Tests
      run: pytest tests/ --cov=api --cov-report=xml
    
    - name: Upload Coverage
      uses: codecov/codecov-action@v3
```

## Best Practices

### **Test Organization**
- Group related tests in describe blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Use fixtures for reusable test data

### **Assertion Quality**
- Test both positive and negative cases
- Verify exact values, not just types
- Include edge cases and boundary conditions
- Test error messages and status codes

### **Mock Strategy**
- Mock external dependencies
- Use consistent mock data
- Reset mocks between tests
- Verify mock calls

### **Coverage Goals**
- Statement Coverage: > 90%
- Branch Coverage: > 85%
- Function Coverage: > 90%
- Line Coverage: > 90%

---

**Created:** December 1, 2024  
**Frameworks:** Jest (TypeScript), Pytest (Python)  
**Coverage Areas:** Input Validation, Security, Rate Limiting, Status Codes, Error Handling, Edge Cases  
**Test Files:** `tests/lead-capture.test.ts`, `tests/test_lead_capture.py`