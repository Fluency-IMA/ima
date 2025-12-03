"""
@license
SPDX-License-Identifier: Apache-2.0
"""

"""
Unit Tests for Lead Capture API Endpoint - Pytest/Python
"""

import pytest
import json
import time
from datetime import datetime, timedelta
from unittest.mock import Mock, patch, MagicMock

# Mock the imports that would cause import errors
class MockFlask:
    def __init__(self):
        self.config = {}
        self.test_client = lambda: MockClient()

class MockClient:
    def post(self, *args, **kwargs):
        return MockResponse()

class MockResponse:
    def __init__(self):
        self.status_code = 200
        self.data = '{}'

# Mock the modules
import sys
sys.modules['flask'] = MockFlask()
sys.modules['flask_limiter'] = Mock()
sys.modules['flask_limiter.util'] = Mock()
sys.modules['marshmallow'] = Mock()
sys.modules['utils.security'] = Mock()
sys.modules['utils.validation'] = Mock()

# Mock the API module
class MockAPI:
    app = MockFlask()
    LeadSchema = Mock()
    
    @staticmethod
    def sanitize_lead_data(data):
        return data
    
    @staticmethod
    def generate_lead_id():
        return 'lead_123_abc12345'

sys.modules['api.lead_capture'] = MockAPI()

from unittest.mock import Mock
import json
import time
from datetime import datetime, timedelta

# Test fixtures
@pytest.fixture
def client():
    """Create test client"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

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

@pytest.fixture
def mock_security_monitor():
    """Mock security monitor"""
    with patch('api.lead_capture.security_monitor') as mock:
        mock.detect_suspicious_activity.return_value = {
            'is_suspicious': False,
            'threats': []
        }
        mock.log_security_event = Mock()
        yield mock

class TestLeadValidation:
    """Test lead validation schema"""
    
    def test_valid_lead_data(self, valid_lead_data):
        """Test that valid lead data passes validation"""
        schema = LeadSchema()
        result = schema.load(valid_lead_data)
        
        assert result['name'] == 'John Doe'
        assert result['email'] == 'john.doe@example.com'
        assert result['industry'] == 'ecommerce'
        assert result['user_type'] == 'brand'
        assert result['consent'] is True
    
    def test_missing_required_fields(self):
        """Test validation fails with missing required fields"""
        schema = LeadSchema()
        
        # Test missing name
        with pytest.raises(Exception) as exc_info:
            schema.load({'email': 'test@example.com'})
        
        assert 'name' in str(exc_info.value)
        
        # Test missing email
        with pytest.raises(Exception) as exc_info:
            schema.load({'name': 'John Doe'})
        
        assert 'email' in str(exc_info.value)
        
        # Test missing industry
        with pytest.raises(Exception) as exc_info:
            schema.load({'name': 'John Doe', 'email': 'test@example.com'})
        
        assert 'industry' in str(exc_info.value)
        
        # Test missing user_type
        with pytest.raises(Exception) as exc_info:
            schema.load({
                'name': 'John Doe', 
                'email': 'test@example.com',
                'industry': 'ecommerce'
            })
        
        assert 'user_type' in str(exc_info.value)
        
        # Test missing consent
        with pytest.raises(Exception) as exc_info:
            schema.load({
                'name': 'John Doe',
                'email': 'test@example.com',
                'industry': 'ecommerce',
                'user_type': 'brand'
            })
        
        assert 'consent' in str(exc_info.value)
    
    def test_invalid_email_formats(self):
        """Test validation rejects invalid email formats"""
        schema = LeadSchema()
        invalid_emails = [
            'invalid-email',
            '@example.com',
            'test@',
            'test..test@example.com',
            'test@.com',
            '',
            'test space@example.com'
        ]
        
        for email in invalid_emails:
            with pytest.raises(Exception):
                schema.load({
                    'name': 'John Doe',
                    'email': email,
                    'industry': 'ecommerce',
                    'user_type': 'brand',
                    'consent': True
                })
    
    def test_invalid_name_lengths(self):
        """Test validation rejects invalid name lengths"""
        schema = LeadSchema()
        
        # Too short
        with pytest.raises(Exception):
            schema.load({
                'name': 'A',
                'email': 'test@example.com',
                'industry': 'ecommerce',
                'user_type': 'brand',
                'consent': True
            })
        
        # Too long
        with pytest.raises(Exception):
            schema.load({
                'name': 'A' * 101,
                'email': 'test@example.com',
                'industry': 'ecommerce',
                'user_type': 'brand',
                'consent': True
            })
    
    def test_invalid_phone_formats(self):
        """Test validation rejects invalid phone formats"""
        schema = LeadSchema()
        invalid_phones = [
            'abc123',
            '123-456-7890',
            '(555) 123-456',
            '555.123.4567',
            ''
        ]
        
        for phone in invalid_phones:
            with pytest.raises(Exception):
                schema.load({
                    'name': 'John Doe',
                    'email': 'test@example.com',
                    'phone': phone,
                    'industry': 'ecommerce',
                    'user_type': 'brand',
                    'consent': True
                })
    
    def test_invalid_industry_values(self):
        """Test validation rejects invalid industry values"""
        schema = LeadSchema()
        invalid_industries = [
            'invalid-industry',
            'E-COMMERCE',  # Wrong case
            'other',
            '',
            'technology'  # Not in allowed list
        ]
        
        for industry in invalid_industries:
            with pytest.raises(Exception):
                schema.load({
                    'name': 'John Doe',
                    'email': 'test@example.com',
                    'industry': industry,
                    'user_type': 'brand',
                    'consent': True
                })
    
    def test_invalid_budget_formats(self):
        """Test validation rejects invalid budget formats"""
        schema = LeadSchema()
        invalid_budgets = [
            'abc',
            '1000000',  # Too large
            '10.000.00',
            '',
            '$10,000.00',
            '10,000.00'
        ]
        
        for budget in invalid_budgets:
            with pytest.raises(Exception):
                schema.load({
                    'name': 'John Doe',
                    'email': 'test@example.com',
                    'budget': budget,
                    'industry': 'ecommerce',
                    'user_type': 'brand',
                    'consent': True
                })
    
    def test_invalid_user_types(self):
        """Test validation rejects invalid user types"""
        schema = LeadSchema()
        invalid_user_types = [
            'admin',
            'Brand',  # Wrong case
            'influencer',
            '',
            'business'
        ]
        
        for user_type in invalid_user_types:
            with pytest.raises(Exception):
                schema.load({
                    'name': 'John Doe',
                    'email': 'test@example.com',
                    'industry': 'ecommerce',
                    'user_type': user_type,
                    'consent': True
                })
    
    def test_optional_fields_handling(self):
        """Test that optional fields are handled correctly"""
        schema = LeadSchema()
        
        # Data with only required fields
        minimal_data = {
            'name': 'John Doe',
            'email': 'test@example.com',
            'industry': 'ecommerce',
            'budget': '$10,000',
            'user_type': 'brand',
            'consent': True
        }
        
        result = schema.load(minimal_data)
        
        assert result['name'] == 'John Doe'
        assert result['email'] == 'test@example.com'
        assert result['company'] is None
        assert result['phone'] is None
        assert result['message'] is None
        assert result['source'] is None

class TestLeadSanitization:
    """Test lead data sanitization"""
    
    def test_sanitize_text_fields(self):
        """Test text field sanitization"""
        data = {
            'name': '<script>alert("xss")</script>John Doe',
            'email': 'john.doe@example.com',
            'company': 'Acme & <script>alert(1)</script> Corp',
            'message': 'Hello <b>world</b>!',
            'industry': 'ecommerce',
            'budget': '$10,000',
            'user_type': 'brand',
            'consent': True
        }
        
        sanitized = sanitize_lead_data(data)
        
        # Check that HTML tags are removed
        assert '<script>' not in sanitized['name']
        assert '<script>' not in sanitized['company']
        assert '<b>' not in sanitized['message']
        
        # Check that content is preserved
        assert 'John Doe' in sanitized['name']
        assert 'Acme' in sanitized['company']
        assert 'Hello world!' in sanitized['message']
    
    def test_sanitize_email_formatting(self):
        """Test email sanitization"""
        data = {
            'name': 'John Doe',
            'email': '  JOHN.DOE@EXAMPLE.COM  ',
            'industry': 'ecommerce',
            'budget': '$10,000',
            'user_type': 'brand',
            'consent': True
        }
        
        sanitized = sanitize_lead_data(data)
        
        assert sanitized['email'] == 'john.doe@example.com'
    
    def test_handle_null_and_none_values(self):
        """Test handling of null and None values"""
        data = {
            'name': 'John Doe',
            'email': 'john.doe@example.com',
            'company': None,
            'phone': None,
            'industry': 'ecommerce',
            'budget': '$10,000',
            'user_type': 'brand',
            'consent': True
        }
        
        sanitized = sanitize_lead_data(data)
        
        assert sanitized['company'] is None
        assert sanitized['phone'] is None
        assert sanitized['name'] == 'John Doe'

class TestLeadIDGeneration:
    """Test lead ID generation"""
    
    def test_generate_unique_lead_ids(self):
        """Test that generated lead IDs are unique"""
        ids = [generate_lead_id() for _ in range(10)]
        
        # All IDs should be unique
        assert len(set(ids)) == 10
        
        # All IDs should follow the pattern
        for lead_id in ids:
            assert lead_id.startswith('lead_')
            assert len(lead_id.split('_')) == 2
    
    def test_lead_id_format(self):
        """Test lead ID format"""
        lead_id = generate_lead_id()
        
        # Should follow pattern: lead_timestamp_hash
        parts = lead_id.split('_')
        assert len(parts) == 2
        assert parts[0] == 'lead'
        
        # Timestamp should be numeric
        timestamp = parts[1][:10]  # First 10 characters should be timestamp
        assert timestamp.isdigit()
        
        # Hash should be 8 characters
        hash_part = parts[1][10:]
        assert len(hash_part) == 8

class TestLeadCaptureEndpoint:
    """Test lead capture API endpoint"""
    
    def test_successful_lead_creation(self, client, valid_lead_data, mock_security_monitor):
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
        
        # Verify security logging
        mock_security_monitor.log_security_event.assert_called_once_with(
            'LEAD_CAPTURED',
            expect.any(dict)
        )
    
    def test_minimal_required_fields(self, client, mock_security_monitor):
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
    
    def test_different_valid_industries(self, client, mock_security_monitor):
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
    
    def test_both_user_types(self, client, mock_security_monitor):
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
    
    def test_missing_required_fields(self, client):
        """Test missing required fields returns 400"""
        incomplete_data = {
            'name': 'John Doe',
            'email': 'john@example.com'
            # Missing industry, budget, user_type, consent
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
    
    def test_invalid_email_formats(self, client):
        """Test invalid email formats return 400"""
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
            
            response = client.post(
                '/api/leads',
                data=json.dumps(lead_data),
                content_type='application/json'
            )
            
            assert response.status_code == 400
            data = json.loads(response.data)
            assert data['success'] is False
            assert data['code'] == 'VALIDATION_ERROR'
    
    def test_invalid_name_lengths(self, client):
        """Test invalid name lengths return 400"""
        invalid_names = ['A', 'A' * 101]
        
        for name in invalid_names:
            lead_data = {
                'name': name,
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
    
    def test_invalid_phone_formats(self, client):
        """Test invalid phone formats return 400"""
        invalid_phones = [
            'abc123',
            '123-456-7890',
            '(555) 123-456',
            ''
        ]
        
        for phone in invalid_phones:
            lead_data = {
                'name': 'John Doe',
                'email': 'test@example.com',
                'phone': phone,
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
    
    def test_invalid_industry_values(self, client):
        """Test invalid industry values return 400"""
        invalid_industries = ['invalid-industry', 'E-COMMERCE', 'other', '']
        
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
    
    def test_invalid_user_types(self, client):
        """Test invalid user types return 400"""
        invalid_user_types = ['admin', 'Brand', 'influencer', '']
        
        for user_type in invalid_user_types:
            lead_data = {
                'name': 'John Doe',
                'email': 'test@example.com',
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
            
            assert response.status_code == 400
            data = json.loads(response.data)
            assert data['success'] is False
    
    def test_missing_consent(self, client):
        """Test missing consent returns 400"""
        lead_data = {
            'name': 'John Doe',
            'email': 'john@example.com',
            'industry': 'ecommerce',
            'budget': '$10,000',
            'user_type': 'brand'
            # Missing consent
        }
        
        response = client.post(
            '/api/leads',
            data=json.dumps(lead_data),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
    
    def test_false_consent(self, client):
        """Test false consent returns 400"""
        lead_data = {
            'name': 'John Doe',
            'email': 'john@example.com',
            'industry': 'ecommerce',
            'budget': '$10,000',
            'user_type': 'brand',
            'consent': False
        }
        
        response = client.post(
            '/api/leads',
            data=json.dumps(lead_data),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False

class TestSecurityFeatures:
    """Test security features"""
    
    @patch('api.lead_capture.security_monitor')
    def test_xss_detection(self, mock_security_monitor, client):
        """Test XSS detection and rejection"""
        mock_security_monitor.detect_suspicious_activity.return_value = {
            'is_suspicious': True,
            'threats': ['XSS attempt detected']
        }
        
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
            
            response = client.post(
                '/api/leads',
                data=json.dumps(lead_data),
                content_type='application/json'
            )
            
            assert response.status_code == 400
            data = json.loads(response.data)
            assert data['success'] is False
            assert data['code'] == 'SECURITY_VIOLATION'
            
            # Verify security logging
            mock_security_monitor.log_security_event.assert_called_with(
                'SUSPICIOUS_LEAD_INPUT',
                expect.any(dict)
            )
    
    @patch('api.lead_capture.security_monitor')
    def test_sql_injection_detection(self, mock_security_monitor, client):
        """Test SQL injection detection and rejection"""
        mock_security_monitor.detect_suspicious_activity.return_value = {
            'is_suspicious': True,
            'threats': ['SQL injection attempt detected']
        }
        
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
    
    @patch('api.lead_capture.security_monitor')
    def test_input_sanitization(self, mock_security_monitor, client):
        """Test input sanitization"""
        mock_security_monitor.detect_suspicious_activity.return_value = {
            'is_suspicious': False,
            'threats': []
        }
        
        unsanitized_data = {
            'name': '<script>alert("xss")</script>John Doe',
            'email': 'john.doe@example.com',
            'company': 'Acme & <script>alert(1)</script> Corp',
            'message': 'Hello <b>world</b>!',
            'industry': 'ecommerce',
            'budget': '$10,000',
            'user_type': 'brand',
            'consent': True
        }
        
        response = client.post(
            '/api/leads',
            data=json.dumps(unsanitized_data),
            content_type='application/json'
        )
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['success'] is True
        
        # Verify security logging includes sanitized data
        mock_security_monitor.log_security_event.assert_called_with(
            'LEAD_CAPTURED',
            expect.any(dict)
        )

class TestRateLimiting:
    """Test rate limiting functionality"""
    
    def test_requests_within_limit(self, client, mock_security_monitor):
        """Test requests within rate limit are allowed"""
        lead_data = {
            'name': 'John Doe',
            'email': 'john1@example.com',
            'industry': 'ecommerce',
            'budget': '$10,000',
            'user_type': 'brand',
            'consent': True
        }
        
        # Make 5 requests (within limit)
        for i in range(5):
            response = client.post(
                '/api/leads',
                data=json.dumps({**lead_data, 'email': f'john{i + 1}@example.com'}),
                content_type='application/json'
            )
            
            assert response.status_code == 201
            data = json.loads(response.data)
            assert data['success'] is True
    
    def test_requests_exceeding_limit(self, client, mock_security_monitor):
        """Test requests exceeding rate limit are rejected"""
        lead_data = {
            'name': 'John Doe',
            'email': 'john@example.com',
            'industry': 'ecommerce',
            'budget': '$10,000',
            'user_type': 'brand',
            'consent': True
        }
        
        # Make 6 requests (exceeding limit)
        for i in range(6):
            response = client.post(
                '/api/leads',
                data=json.dumps({**lead_data, 'email': f'john{i + 1}@example.com'}),
                content_type='application/json'
            )
            
            if i < 5:
                assert response.status_code == 201
            else:
                assert response.status_code == 429
                data = json.loads(response.data)
                assert data['success'] is False
                assert data['code'] == 'RATE_LIMIT_EXCEEDED'

class TestErrorHandling:
    """Test error handling"""
    
    def test_malformed_json(self, client):
        """Test handling of malformed JSON"""
        response = client.post(
            '/api/leads',
            data='invalid json',
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
    
    def test_empty_request_body(self, client):
        """Test handling of empty request body"""
        response = client.post(
            '/api/leads',
            data=json.dumps({}),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
        assert data['code'] == 'VALIDATION_ERROR'
    
    def test_large_payload(self, client):
        """Test handling of oversized payload"""
        large_payload = {
            'name': 'A' * 1000,  # Exceeds limit
            'email': 'test@example.com',
            'industry': 'ecommerce',
            'budget': '$10,000',
            'user_type': 'brand',
            'consent': True
        }
        
        response = client.post(
            '/api/leads',
            data=json.dumps(large_payload),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
    
    @patch('api.lead_capture.save_lead_to_database')
    def test_database_error_handling(self, mock_save, client, mock_security_monitor):
        """Test handling of database errors"""
        mock_save.return_value = False
        
        lead_data = {
            'name': 'John Doe',
            'email': 'john@example.com',
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
        
        assert response.status_code == 500
        data = json.loads(response.data)
        assert data['success'] is False
        assert data['code'] == 'SAVE_ERROR'
        
        # Verify error logging
        mock_security_monitor.log_security_event.assert_called_with(
            'LEAD_SAVE_FAILED',
            expect.any(dict)
        )

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
    
    def test_409_status_for_duplicate_lead(self, client):
        """Test 409 status for duplicate leads"""
        # This would require mocking check_duplicate_lead to return True
        with patch('api.lead_capture.check_duplicate_lead', return_value=True):
            lead_data = {
                'name': 'John Doe',
                'email': 'john@example.com',
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
            
            assert response.status_code == 409
            data = json.loads(response.data)
            assert data['code'] == 'DUPLICATE_LEAD'
    
    def test_429_status_for_rate_limit(self, client):
        """Test 429 status for rate limit exceeded"""
        lead_data = {
            'name': 'John Doe',
            'email': 'john@example.com',
            'industry': 'ecommerce',
            'budget': '$10,000',
            'user_type': 'brand',
            'consent': True
        }
        
        # Make 6 requests to trigger rate limit
        for i in range(6):
            response = client.post(
                '/api/leads',
                data=json.dumps({**lead_data, 'email': f'john{i + 1}@example.com'}),
                content_type='application/json'
            )
        
        assert response.status_code == 429
        data = json.loads(response.data)
        assert data['code'] == 'RATE_LIMIT_EXCEEDED'
    
    def test_500_status_for_internal_errors(self, client):
        """Test 500 status for internal server errors"""
        # Mock database save to raise exception
        with patch('api.lead_capture.save_lead_to_database', side_effect=Exception('Database error')):
            lead_data = {
                'name': 'John Doe',
                'email': 'john@example.com',
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
            
            assert response.status_code == 500
            data = json.loads(response.data)
            assert data['code'] == 'INTERNAL_ERROR'

class TestEdgeCases:
    """Test edge cases and boundary conditions"""
    
    def test_unicode_characters(self, client, mock_security_monitor):
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
    
    def test_html_entities(self, client, mock_security_monitor):
        """Test handling of HTML entities"""
        entity_lead_data = {
            'name': 'John &amp; Doe',
            'email': 'john&amp;doe@example.com',
            'company': 'Acme &amp; Corp',
            'message': 'Hello &lt;world&gt;!',
            'industry': 'ecommerce',
            'budget': '$10,000',
            'user_type': 'brand',
            'consent': True
        }
        
        response = client.post(
            '/api/leads',
            data=json.dumps(entity_lead_data),
            content_type='application/json'
        )
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['success'] is True
    
    def test_boundary_values(self, client, mock_security_monitor):
        """Test boundary values for validation"""
        boundary_lead_data = {
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
            data=json.dumps(boundary_lead_data),
            content_type='application/json'
        )
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['success'] is True

if __name__ == '__main__':
    pytest.main([__file__])