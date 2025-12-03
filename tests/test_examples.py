"""
@license
SPDX-License-Identifier: Apache-2.0
"""

"""
Simple Working Example - Lead Capture API Tests
This file demonstrates the test structure without import dependencies.
"""
import re

# Test Structure Example

def test_lead_validation_example():
    """Example of lead validation test"""
    # Valid lead data
    valid_lead = {
        'name': 'John Doe',
        'email': 'john.doe@example.com',
        'industry': 'ecommerce',
        'budget': '$10,000',
        'user_type': 'brand',
        'consent': True
    }
    
    # Test validation function
    validation_result = validate_lead_input(valid_lead)
    assert validation_result['valid'] is True
    assert validation_result['errors'] == []

def test_invalid_email_example():
    """Example of email validation test"""
    invalid_emails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com',
        ''
    ]
    
    for email in invalid_emails:
        lead_data = {
            'name': 'John Doe',
            'email': email,
            'industry': 'ecommerce',
            'budget': '$10,000',
            'user_type': 'brand',
            'consent': True
        }
        
        validation_result = validate_lead_input(lead_data)
        assert validation_result['valid'] is False
        assert 'email' in str(validation_result['errors'])

def test_xss_detection_example():
    """Example of XSS detection test"""
    xss_payloads = [
        '<script>alert("xss")</script>',
        'javascript:alert(1)',
        '<img src=x onerror=alert(1)>',
        '<svg onload=alert(1)>'
    ]
    
    for payload in xss_payloads:
        lead_data = {
            'name': payload,
            'email': 'test@example.com',
            'industry': 'ecommerce',
            'budget': '$10,000',
            'user_type': 'brand',
            'consent': True
        }
        
        security_result = check_security_threats(str(lead_data))
        assert security_result['is_suspicious'] is True
        assert any('XSS' in threat for threat in security_result['threats'])

def test_sql_injection_detection_example():
    """Example of SQL injection detection test"""
    sql_payloads = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "'; INSERT INTO users VALUES('hacker','password'); --"
    ]
    
    for payload in sql_payloads:
        lead_data = {
            'name': 'John Doe',
            'email': 'test@example.com',
            'message': payload,
            'industry': 'ecommerce',
            'budget': '$10,000',
            'user_type': 'brand',
            'consent': True
        }
        
        security_result = check_security_threats(str(lead_data))
        assert security_result['is_suspicious'] is True
        assert any('SQL' in threat for threat in security_result['threats'])

def test_rate_limiting_example():
    """Example of rate limiting test"""
    from datetime import datetime, timedelta
    
    # Simulate rate limiter
    rate_limiter = {}
    ip_address = '192.168.1.1'
    limit = 5
    window = 900  # 15 minutes
    
    now = datetime.utcnow()
    
    # Initialize rate limiter data
    if ip_address not in rate_limiter:
        rate_limiter[ip_address] = []
    
    # Add 5 requests (within limit)
    for i in range(5):
        rate_limiter[ip_address].append(now)
    
    # Check if allowed
    is_allowed = len(rate_limiter[ip_address]) < limit
    assert is_allowed is True
    
    # Add 6th request (exceeds limit)
    rate_limiter[ip_address].append(now)
    
    is_allowed = len(rate_limiter[ip_address]) < limit
    assert is_allowed is False

def test_status_code_examples():
    """Example of status code tests"""
    
    # Test 201 Created
    success_response = {
        'status_code': 201,
        'body': {
            'success': True,
            'lead_id': 'lead_123_abc12345',
            'message': 'Thank you for your interest!',
            'code': 'SUCCESS'
        }
    }
    
    assert success_response['status_code'] == 201
    assert success_response['body']['success'] is True
    assert success_response['body']['code'] == 'SUCCESS'
    
    # Test 400 Bad Request
    validation_error_response = {
        'status_code': 400,
        'body': {
            'success': False,
            'message': 'Validation failed',
            'errors': ['Name is required'],
            'code': 'VALIDATION_ERROR'
        }
    }
    
    assert validation_error_response['status_code'] == 400
    assert validation_error_response['body']['success'] is False
    assert validation_error_response['body']['code'] == 'VALIDATION_ERROR'
    
    # Test 429 Too Many Requests
    rate_limit_response = {
        'status_code': 429,
        'body': {
            'success': False,
            'message': 'Too many lead submissions. Please try again later.',
            'code': 'RATE_LIMIT_EXCEEDED'
        }
    }
    
    assert rate_limit_response['status_code'] == 429
    assert rate_limit_response['body']['code'] == 'RATE_LIMIT_EXCEEDED'

# Helper Functions (would be in separate modules)

def validate_lead_input(lead_data):
    """Validate lead input data"""
    errors = []
    
    # Required fields
    required_fields = ['name', 'email', 'industry', 'budget', 'user_type', 'consent']
    for field in required_fields:
        if field not in lead_data or not lead_data[field]:
            errors.append(f'{field} is required')
    
    # Name validation
    if 'name' in lead_data:
        name = lead_data['name']
        if not name or len(name) < 2 or len(name) > 100:
            errors.append('Name must be between 2 and 100 characters')
    
    # Email validation
    if 'email' in lead_data:
        email = lead_data['email']
        import re
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email) or len(email) > 254:
            errors.append('Valid email address is required')
    
    # Industry validation
    if 'industry' in lead_data:
        valid_industries = ['ecommerce', 'saas', 'cpg', 'fashion', 'tech', 'healthcare', 'finance', 'travel']
        if lead_data['industry'] not in valid_industries:
            errors.append('Invalid industry selection')
    
    # Budget validation
    if 'budget' in lead_data:
        budget = lead_data['budget']
        budget_pattern = r'^\$\d{1,6}(,\d{3})*$'
        if not re.match(budget_pattern, budget):
            errors.append('Invalid budget format')
    
    # User type validation
    if 'user_type' in lead_data:
        if lead_data['user_type'] not in ['brand', 'creator']:
            errors.append('Invalid user type')
    
    # Consent validation
    if 'consent' in lead_data:
        if not isinstance(lead_data['consent'], bool) or not lead_data['consent']:
            errors.append('Consent is required')
    
    return {
        'valid': len(errors) == 0,
        'errors': errors
    }

def check_security_threats(input_string):
    """Check for security threats in input"""
    import re
    
    threats = []
    
    # XSS patterns
    xss_patterns = [
        r'<script\b[^<]*(?:(?!<\/script>)<[^<]*<\/script>)',
        r'javascript:',
        r'on\w+\s*=',
        r'<img[^>]*>',
        r'<svg[^>]*>'
    ]
    
    # SQL injection patterns
    sql_patterns = [
        r'union\s+select',
        r'drop\s+table',
        r'insert\s+into',
        r'--',
        r'/\*.*\*/',
        r'exec\s*\(',
        r'eval\s*\(',
        r'system\s*\(',
        r'passthru\s*\(',
        r'shell_exec\s*\('
    ]
    
    for pattern in xss_patterns:
        if re.search(pattern, input_string, re.IGNORECASE):
            threats.append('XSS attempt detected')
    
    for pattern in sql_patterns:
        if re.search(pattern, input_string, re.IGNORECASE):
            threats.append('SQL injection attempt detected')
    
    return {
        'is_suspicious': len(threats) > 0,
        'threats': threats
    }

def test_input_sanitization_example():
    """Example of input sanitization test"""
    unsanitized_input = '<script>alert("xss")</script>John Doe'
    
    # Sanitize input
    import re
    sanitized = re.sub(r'<[^>]+>', '', unsanitized_input)  # Remove HTML tags
    sanitized = re.sub(r'javascript:', '', sanitized, flags=re.IGNORECASE)  # Remove JS protocol
    sanitized = re.sub(r'on\w+\s*=', '', sanitized, flags=re.IGNORECASE)  # Remove event handlers
    sanitized = sanitized.replace('"', '').replace("'", '')  # Remove quotes
    sanitized = sanitized.strip()  # Trim whitespace
    
    # Verify sanitization
    assert '<script>' not in sanitized
    assert 'javascript:' not in sanitized
    assert 'John Doe' in sanitized

def test_edge_cases_example():
    """Example of edge case testing"""
    
    # Unicode characters
    unicode_lead = {
        'name': 'Jöhn Döe',
        'email': 'john.doe@example.com',
        'company': 'Acme 公司',
        'message': 'Hello 🌍!',
        'industry': 'ecommerce',
        'budget': '$10,000',
        'user_type': 'brand',
        'consent': True
    }
    
    validation_result = validate_lead_input(unicode_lead)
    assert validation_result['valid'] is True
    
    # Boundary values
    boundary_lead = {
        'name': 'A' * 100,  # Maximum length
        'email': 'test@example.com',
        'industry': 'ecommerce',
        'budget': '$999,999',  # Maximum reasonable budget
        'user_type': 'brand',
        'consent': True
    }
    
    validation_result = validate_lead_input(boundary_lead)
    assert validation_result['valid'] is True
    
    # Null optional fields
    null_optional_lead = {
        'name': 'John Doe',
        'email': 'john.doe@example.com',
        'company': None,
        'phone': None,
        'industry': 'ecommerce',
        'budget': '$10,000',
        'user_type': 'brand',
        'consent': True
    }
    
    validation_result = validate_lead_input(null_optional_lead)
    assert validation_result['valid'] is True

# Test Execution Example
if __name__ == '__main__':
    print("Running lead capture API test examples...")
    
    try:
        test_lead_validation_example()
        print("Lead validation test passed")
    except AssertionError as e:
        print(f"Lead validation test failed: {e}")
    
    try:
        test_invalid_email_example()
        print("Invalid email test passed")
    except AssertionError as e:
        print(f"Invalid email test failed: {e}")
    
    try:
        test_xss_detection_example()
        print("XSS detection test passed")
    except AssertionError as e:
        print(f"XSS detection test failed: {e}")
    
    try:
        test_sql_injection_detection_example()
        print("SQL injection detection test passed")
    except AssertionError as e:
        print(f"SQL injection detection test failed: {e}")
    
    try:
        test_rate_limiting_example()
        print("Rate limiting test passed")
    except AssertionError as e:
        print(f"Rate limiting test failed: {e}")
    
    try:
        test_status_code_examples()
        print("Status code test passed")
    except AssertionError as e:
        print(f"Status code test failed: {e}")
    
    try:
        test_input_sanitization_example()
        print("Input sanitization test passed")
    except AssertionError as e:
        print(f"Input sanitization test failed: {e}")
    
    try:
        test_edge_cases_example()
        print("Edge cases test passed")
    except AssertionError as e:
        print(f"Edge cases test failed: {e}")
    
    print("\nAll test examples completed!")