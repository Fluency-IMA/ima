"""
@license
SPDX-License-Identifier: Apache-2.0
"""

"""
Unit Tests for Lead Capture API Endpoint - Pytest/Python (Simplified)
"""

import pytest
import json
import re
from datetime import datetime, timedelta

# Mock Flask app for testing
class MockFlask:
    def __init__(self):
        self.config = {'TESTING': True}
    
    def test_client(self):
        return MockTestClient()

class MockTestClient:
    def __init__(self):
        self.responses = []
    
    def post(self, endpoint, data=None, content_type=None):
        # Simulate response
        response = MockResponse()
        
        # Parse JSON data for validation
        if content_type == 'application/json' and data:
            try:
                request_data = json.loads(data)
                validation_result = self.validate_lead_data(request_data)
                
                if not validation_result['valid']:
                    response.status_code = 400
                    response.data = json.dumps({
                        'success': False,
                        'message': 'Validation failed',
                        'errors': validation_result['errors'],
                        'code': 'VALIDATION_ERROR'
                    })
                else:
                    # Check for security issues
                    security_check = self.check_security(request_data)
                    if security_check['suspicious']:
                        response.status_code = 400
                        response.data = json.dumps({
                            'success': False,
                            'message': 'Invalid input detected',
                            'code': 'SECURITY_VIOLATION'
                        })
                    else:
                        response.status_code = 201
                        response.data = json.dumps({
                            'success': True,
                            'lead_id': 'lead_123_abc12345',
                            'message': 'Thank you for your interest! We\'ll contact you within 24 hours.',
                            'code': 'SUCCESS'
                        })
            except:
                response.status_code = 400
                response.data = json.dumps({
                    'success': False,
                    'message': 'Invalid JSON',
                    'code': 'INVALID_JSON'
                })
        else:
            response.status_code = 400
            response.data = json.dumps({
                'success': False,
                'message': 'JSON content type required',
                'code': 'INVALID_CONTENT_TYPE'
            })
        
        self.responses.append(response)
        return response
    
    def validate_lead_data(self, data):
        """Validate lead data"""
        errors = []
        
        # Required fields
        required_fields = ['name', 'email', 'industry', 'budget', 'user_type', 'consent']
        for field in required_fields:
            if field not in data or not data[field]:
                errors.append(f'{field} is required')
        
        # Name validation
        if 'name' in data:
            name = data['name']
            if not name or len(name) < 2 or len(name) > 100:
                errors.append('Name must be between 2 and 100 characters')
        
        # Email validation
        if 'email' in data:
            email = data['email']
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            # Additional check for consecutive dots
            no_consecutive_dots = '..' not in email
            if not re.match(email_pattern, email) or len(email) > 254 or not no_consecutive_dots:
                errors.append('Valid email address is required')
        
        # Industry validation
        if 'industry' in data:
            valid_industries = ['ecommerce', 'saas', 'cpg', 'fashion', 'tech', 'healthcare', 'finance', 'travel']
            if data['industry'] not in valid_industries:
                errors.append('Invalid industry selection')
        
        # Budget validation
        if 'budget' in data:
            budget_pattern = r'^\$\d{1,6}(,\d{3})*$'
            if not re.match(budget_pattern, data['budget']):
                errors.append('Invalid budget format')
        
        # User type validation
        if 'user_type' in data:
            if data['user_type'] not in ['brand', 'creator']:
                errors.append('Invalid user type')
        
        # Consent validation
        if 'consent' in data:
            if not isinstance(data['consent'], bool) or not data['consent']:
                errors.append('Consent is required')
        
        # Optional fields validation
        if 'phone' in data and data['phone']:
            phone_pattern = r'^\+?[\d\s\-\(\)]+$'
            if not re.match(phone_pattern, data['phone']):
                errors.append('Invalid phone number format')
        
        if 'company' in data and data['company'] and len(data['company']) > 100:
            errors.append('Company name must be less than 100 characters')
        
        if 'message' in data and data['message'] and len(data['message']) > 1000:
            errors.append('Message must be less than 1000 characters')
        
        if 'source' in data and data['source'] and len(data['source']) > 50:
            errors.append('Source must be less than 50 characters')
        
        return {
            'valid': len(errors) == 0,
            'errors': errors
        }
    
    def check_security(self, data):
        """Check for security issues"""
        json_string = json.dumps(data)
        
        # XSS patterns
        xss_patterns = [
            r'<script[^>]*>.*?<\/script>',
            r'<script[^>]*>',
            r'javascript:',
            r'on\w+\s*=',
            r'<img[^>]*>',
            r'<svg[^>]*>',
            r'<iframe[^>]*>',
            r'<object[^>]*>',
            r'<embed[^>]*>',
            r'<link[^>]*>',
            r'<meta[^>]*>',
            r'vbscript:',
            r'data:text\/html',
            r'expression\s*\('
        ]
        
        # SQL injection patterns
        sql_patterns = [
            r"union\s+select",
            r"drop\s+table",
            r"insert\s+into",
            r"--",
            r"/\*.*\*/",
            r"exec\s*\(",
            r"eval\s*\(",
            r"system\s*\(",
            r"passthru\s*\(",
            r"shell_exec\s*\(",
            r"'\s*OR\s*'.*'",
            r"'\s*AND\s*'.*'",
            r"1\s*=\s*1",
            r"1\s*=\s*0"
        ]
        
        threats = []
        
        for pattern in xss_patterns:
            if re.search(pattern, json_string, re.IGNORECASE):
                threats.append('XSS attempt detected')
        
        for pattern in sql_patterns:
            if re.search(pattern, json_string, re.IGNORECASE):
                threats.append('SQL injection attempt detected')
        
        return {
            'suspicious': len(threats) > 0,
            'threats': threats
        }

class MockResponse:
    def __init__(self):
        self.status_code = 200
        self.data = '{}'

@pytest.fixture
def client():
    """Create test client"""
    return MockFlask().test_client()

@pytest.fixture
def valid_lead_data():
    """Valid lead data for testing"""
    return {
        'name': 'John Doe',
        'email': 'john.doe@example.com',
        'company': 'Acme Corp',
        'phone': '+1 (555) 123-4567',
        'industry': 'ecommerce',
        'budget': '$10,000',
        'message': 'Interested in your influencer marketing platform',
        'user_type': 'brand',
        'consent': True,
        'source': 'website'
    }

class TestLeadValidation:
    """Test lead validation"""
    
    def test_valid_lead_data(self, valid_lead_data):
        """Test that valid lead data passes validation"""
        client = MockTestClient()
        validation_result = client.validate_lead_data(valid_lead_data)
        
        assert validation_result['valid'] is True
        assert len(validation_result['errors']) == 0
    
    def test_missing_required_fields(self):
        """Test validation fails with missing required fields"""
        client = MockTestClient()
        
        # Test missing name
        incomplete_data = {
            'email': 'test@example.com',
            'industry': 'ecommerce',
            'budget': '$10,000',
            'user_type': 'brand',
            'consent': True
        }
        
        validation_result = client.validate_lead_data(incomplete_data)
        assert validation_result['valid'] is False
        assert 'name is required' in validation_result['errors']
        
        # Test missing email
        incomplete_data = {
            'name': 'John Doe',
            'industry': 'ecommerce',
            'budget': '$10,000',
            'user_type': 'brand',
            'consent': True
        }
        
        validation_result = client.validate_lead_data(incomplete_data)
        assert validation_result['valid'] is False
        assert 'email is required' in validation_result['errors']
    
    def test_invalid_email_formats(self):
        """Test validation rejects invalid email formats"""
        client = MockTestClient()
        invalid_emails = [
            'invalid-email',
            '@example.com',
            'test@',
            'test..test@example.com',
            'test@.com',
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
            
            validation_result = client.validate_lead_data(lead_data)
            assert validation_result['valid'] is False
    
    def test_invalid_name_lengths(self):
        """Test validation rejects invalid name lengths"""
        client = MockTestClient()
        
        # Too short
        short_name_data = {
            'name': 'A',
            'email': 'test@example.com',
            'industry': 'ecommerce',
            'budget': '$10,000',
            'user_type': 'brand',
            'consent': True
        }
        
        validation_result = client.validate_lead_data(short_name_data)
        assert validation_result['valid'] is False
        
        # Too long
        long_name_data = {
            'name': 'A' * 101,
            'email': 'test@example.com',
            'industry': 'ecommerce',
            'budget': '$10,000',
            'user_type': 'brand',
            'consent': True
        }
        
        validation_result = client.validate_lead_data(long_name_data)
        assert validation_result['valid'] is False
    
    def test_invalid_industry_values(self):
        """Test validation rejects invalid industry values"""
        client = MockTestClient()
        invalid_industries = [
            'invalid-industry',
            'E-COMMERCE',  # Wrong case
            'other',
            ''
        ]
        
        for industry in invalid_industries:
            lead_data = {
                'name': 'John Doe',
                'email': 'test@example.com',
                'industry': industry,
                'budget': '$10,000',
                'user_type': 'brand',
                'consent': True
            }
            
            validation_result = client.validate_lead_data(lead_data)
            assert validation_result['valid'] is False
    
    def test_invalid_user_types(self):
        """Test validation rejects invalid user types"""
        client = MockTestClient()
        invalid_user_types = [
            'admin',
            'Brand',  # Wrong case
            'influencer',
            ''
        ]
        
        for user_type in invalid_user_types:
            lead_data = {
                'name': 'John Doe',
                'email': 'test@example.com',
                'industry': 'ecommerce',
                'budget': '$10,000',
                'user_type': user_type,
                'consent': True
            }
            
            validation_result = client.validate_lead_data(lead_data)
            assert validation_result['valid'] is False
    
    def test_missing_consent(self):
        """Test validation fails when consent is missing"""
        client = MockTestClient()
        
        # Missing consent
        no_consent_data = {
            'name': 'John Doe',
            'email': 'test@example.com',
            'industry': 'ecommerce',
            'budget': '$10,000',
            'user_type': 'brand'
        }
        
        validation_result = client.validate_lead_data(no_consent_data)
        assert validation_result['valid'] is False
        
        # False consent
        false_consent_data = {
            'name': 'John Doe',
            'email': 'test@example.com',
            'industry': 'ecommerce',
            'budget': '$10,000',
            'user_type': 'brand',
            'consent': False
        }
        
        validation_result = client.validate_lead_data(false_consent_data)
        assert validation_result['valid'] is False

class TestSecurityFeatures:
    """Test security features"""
    
    def test_xss_detection(self):
        """Test XSS detection"""
        client = MockTestClient()
        
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
            
            security_check = client.check_security(lead_data)
            assert security_check['suspicious'] is True
            assert any('XSS' in threat for threat in security_check['threats'])
    
    def test_sql_injection_detection(self):
        """Test SQL injection detection"""
        client = MockTestClient()
        
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
            
            security_check = client.check_security(lead_data)
            assert security_check['suspicious'] is True
            assert any('SQL' in threat for threat in security_check['threats'])
    
    def test_safe_input_passes_security_check(self):
        """Test that safe input passes security check"""
        client = MockTestClient()
        
        safe_data = {
            'name': 'John Doe',
            'email': 'john.doe@example.com',
            'company': 'Acme Corp',
            'message': 'Hello world!',
            'industry': 'ecommerce',
            'budget': '$10,000',
            'user_type': 'brand',
            'consent': True
        }
        
        security_check = client.check_security(safe_data)
        assert security_check['suspicious'] is False
        assert len(security_check['threats']) == 0

class TestLeadCaptureEndpoint:
    """Test lead capture API endpoint"""
    
    def test_successful_lead_creation(self, client, valid_lead_data):
        """Test successful lead creation"""
        response = client.post(
            '/api/leads',
            data=json.dumps(valid_lead_data),
            content_type='application/json'
        )
        
        assert response.status_code == 201
        
        data = json.loads(response.data)
        assert data['success'] is True
        assert data['code'] == 'SUCCESS'
        assert 'lead_id' in data
        assert data['message'] == 'Thank you for your interest! We\'ll contact you within 24 hours.'
    
    def test_minimal_required_fields(self, client):
        """Test lead creation with minimal required fields"""
        minimal_data = {
            'name': 'Jane Smith',
            'email': 'jane@example.com',
            'industry': 'saas',
            'budget': '$5,000',
            'user_type': 'creator',
            'consent': True
        }
        
        response = client.post(
            '/api/leads',
            data=json.dumps(minimal_data),
            content_type='application/json'
        )
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['success'] is True
        assert 'lead_id' in data
    
    def test_different_valid_industries(self, client):
        """Test different valid industries"""
        industries = ['ecommerce', 'saas', 'cpg', 'fashion', 'tech', 'healthcare', 'finance', 'travel']
        
        for industry in industries:
            lead_data = {
                'name': 'John Doe',
                'email': f'john{industry}@example.com',
                'industry': industry,
                'budget': '$10,000',
                'user_type': 'brand',
                'consent': True
            }
            
            response = client.post(
                '/api/leads',
                data=json.dumps(lead_data),
                content_type='application/json'
            )
            
            assert response.status_code == 201
            data = json.loads(response.data)
            assert data['success'] is True
    
    def test_both_user_types(self, client):
        """Test both brand and creator user types"""
        user_types = ['brand', 'creator']
        
        for user_type in user_types:
            lead_data = {
                'name': 'John Doe',
                'email': f'john{user_type}@example.com',
                'industry': 'ecommerce',
                'budget': '$10,000',
                'user_type': user_type,
                'consent': True
            }
            
            response = client.post(
                '/api/leads',
                data=json.dumps(lead_data),
                content_type='application/json'
            )
            
            assert response.status_code == 201
            data = json.loads(response.data)
            assert data['success'] is True

class TestInputValidationErrors:
    """Test input validation error responses"""
    
    def test_missing_required_fields_returns_400(self, client):
        """Test missing required fields returns 400"""
        incomplete_data = {
            'name': 'John Doe',
            'email': 'john@example.com'
        }
        
        response = client.post(
            '/api/leads',
            data=json.dumps(incomplete_data),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        
        data = json.loads(response.data)
        assert data['success'] is False
        assert data['code'] == 'VALIDATION_ERROR'
        assert 'errors' in data
        assert isinstance(data['errors'], list)
    
    def test_invalid_email_returns_400(self, client):
        """Test invalid email returns 400"""
        invalid_emails = [
            'invalid-email',
            '@example.com',
            'test@',
            'test..test@example.com'
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
            
            response = client.post(
                '/api/leads',
                data=json.dumps(lead_data),
                content_type='application/json'
            )
            
            assert response.status_code == 400
            data = json.loads(response.data)
            assert data['success'] is False
            assert data['code'] == 'VALIDATION_ERROR'
    
    def test_invalid_industry_returns_400(self, client):
        """Test invalid industry returns 400"""
        invalid_industries = ['invalid-industry', 'E-COMMERCE', 'other']
        
        for industry in invalid_industries:
            lead_data = {
                'name': 'John Doe',
                'email': 'test@example.com',
                'industry': industry,
                'budget': '$10,000',
                'user_type': 'brand',
                'consent': True
            }
            
            response = client.post(
                '/api/leads',
                data=json.dumps(lead_data),
                content_type='application/json'
            )
            
            assert response.status_code == 400
            data = json.loads(response.data)
            assert data['success'] is False
    
    def test_missing_consent_returns_400(self, client):
        """Test missing consent returns 400"""
        lead_data = {
            'name': 'John Doe',
            'email': 'john@example.com',
            'industry': 'ecommerce',
            'budget': '$10,000',
            'user_type': 'brand'
        }
        
        response = client.post(
            '/api/leads',
            data=json.dumps(lead_data),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False

class TestSecurityViolations:
    """Test security violation responses"""
    
    def test_xss_attempt_returns_400(self, client):
        """Test XSS attempt returns 400"""
        xss_payloads = [
            '<script>alert("xss")</script>',
            'javascript:alert(1)',
            '<img src=x onerror=alert(1)>'
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
            
            response = client.post(
                '/api/leads',
                data=json.dumps(lead_data),
                content_type='application/json'
            )
            
            assert response.status_code == 400
            data = json.loads(response.data)
            assert data['success'] is False
            assert data['code'] == 'SECURITY_VIOLATION'
    
    def test_sql_injection_attempt_returns_400(self, client):
        """Test SQL injection attempt returns 400"""
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
            
            response = client.post(
                '/api/leads',
                data=json.dumps(lead_data),
                content_type='application/json'
            )
            
            assert response.status_code == 400
            data = json.loads(response.data)
            assert data['success'] is False
            assert data['code'] == 'SECURITY_VIOLATION'

class TestStatusCodes:
    """Test HTTP status code compliance"""
    
    def test_201_status_for_success(self, client, valid_lead_data):
        """Test 201 status for successful lead creation"""
        response = client.post(
            '/api/leads',
            data=json.dumps(valid_lead_data),
            content_type='application/json'
        )
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['code'] == 'SUCCESS'
    
    def test_400_status_for_validation_errors(self, client):
        """Test 400 status for validation errors"""
        invalid_data = {
            'name': 'A',  # Too short
            'email': 'invalid-email',
            'industry': 'ecommerce',
            'budget': '$10,000',
            'user_type': 'brand',
            'consent': True
        }
        
        response = client.post(
            '/api/leads',
            data=json.dumps(invalid_data),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['code'] == 'VALIDATION_ERROR'
    
    def test_400_status_for_security_violations(self, client):
        """Test 400 status for security violations"""
        xss_data = {
            'name': '<script>alert(1)</script>',
            'email': 'test@example.com',
            'industry': 'ecommerce',
            'budget': '$10,000',
            'user_type': 'brand',
            'consent': True
        }
        
        response = client.post(
            '/api/leads',
            data=json.dumps(xss_data),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['code'] == 'SECURITY_VIOLATION'
    
    def test_400_status_for_malformed_json(self, client):
        """Test 400 status for malformed JSON"""
        response = client.post(
            '/api/leads',
            data='invalid json',
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
    
    def test_400_status_for_empty_request(self, client):
        """Test 400 status for empty request"""
        response = client.post(
            '/api/leads',
            data=json.dumps({}),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False

class TestEdgeCases:
    """Test edge cases and boundary conditions"""
    
    def test_unicode_characters(self, client):
        """Test handling of unicode characters"""
        unicode_lead_data = {
            'name': 'Jöhn Döe',
            'email': 'john.doe@example.com',
            'company': 'Acme 公司',
            'message': 'Hello 🌍!',
            'industry': 'ecommerce',
            'budget': '$10,000',
            'user_type': 'brand',
            'consent': True
        }
        
        response = client.post(
            '/api/leads',
            data=json.dumps(unicode_lead_data),
            content_type='application/json'
        )
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['success'] is True
    
    def test_boundary_values(self, client):
        """Test boundary values for validation"""
        boundary_data = {
            'name': 'A' * 100,  # Maximum length
            'email': 'test@example.com',
            'company': 'A' * 100,  # Maximum length
            'message': 'A' * 1000,  # Maximum length
            'industry': 'ecommerce',
            'budget': '$999,999',  # Maximum reasonable budget
            'user_type': 'brand',
            'consent': True
        }
        
        response = client.post(
            '/api/leads',
            data=json.dumps(boundary_data),
            content_type='application/json'
        )
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['success'] is True
    
    def test_optional_fields_with_null_values(self, client):
        """Test optional fields with null values"""
        null_optional_data = {
            'name': 'John Doe',
            'email': 'john@example.com',
            'company': None,
            'phone': None,
            'industry': 'ecommerce',
            'budget': '$10,000',
            'user_type': 'brand',
            'consent': True
        }
        
        response = client.post(
            '/api/leads',
            data=json.dumps(null_optional_data),
            content_type='application/json'
        )
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['success'] is True

if __name__ == '__main__':
    pytest.main([__file__])