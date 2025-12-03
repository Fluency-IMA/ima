"""
@license
SPDX-License-Identifier: Apache-2.0
"""

"""
Lead Capture API Endpoint - Python/Flask Implementation
"""

from flask import Flask, request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from marshmallow import Schema, fields, validate, ValidationError
from functools import wraps
import re
import json
import hashlib
import time
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

# Import security and validation utilities
from utils.security import SecurityMonitor, RateLimiter
from utils.validation import validate_email, validate_input, sanitize_text

app = Flask(__name__)

# Rate limiting configuration
rate_limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["5 per 15 minutes"]  # 5 leads per 15 minutes per IP
)

# Security monitoring
security_monitor = SecurityMonitor()

class LeadSchema(Schema):
    """Schema for lead validation"""
    name = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=100),
        error_messages={
            'required': 'Name is required',
            'invalid': 'Name must be between 2 and 100 characters'
        }
    )
    
    email = fields.Email(
        required=True,
        validate=validate.Length(max=254),
        error_messages={
            'required': 'Email is required',
            'invalid': 'Valid email address is required'
        }
    )
    
    company = fields.Str(
        missing=None,
        allow_none=True,
        validate=validate.Length(max=100),
        error_messages={'invalid': 'Company name must be less than 100 characters'}
    )
    
    phone = fields.Str(
        missing=None,
        allow_none=True,
        validate=validate.Regexp(
            regex=r'^\+?[\d\s\-\(\)]+$',
            error='Invalid phone number format'
        )
    )
    
    industry = fields.Str(
        required=True,
        validate=validate.OneOf([
            'ecommerce', 'saas', 'cpg', 'fashion', 
            'tech', 'healthcare', 'finance', 'travel'
        ]),
        error_messages={
            'required': 'Industry is required',
            'invalid': 'Invalid industry selection'
        }
    )
    
    budget = fields.Str(
        required=True,
        validate=validate.Regexp(
            regex=r'^\$\d{1,6}(,\d{3})*$',
            error='Invalid budget format'
        )
    )
    
    message = fields.Str(
        missing=None,
        allow_none=True,
        validate=validate.Length(max=1000),
        error_messages={'invalid': 'Message must be less than 1000 characters'}
    )
    
    user_type = fields.Str(
        required=True,
        validate=validate.OneOf(['brand', 'creator']),
        error_messages={
            'required': 'User type is required',
            'invalid': 'Invalid user type'
        }
    )
    
    consent = fields.Bool(
        required=True,
        error_messages={
            'required': 'Consent is required',
            'invalid': 'Consent must be a boolean'
        }
    )
    
    source = fields.Str(
        missing=None,
        allow_none=True,
        validate=validate.Length(max=50),
        error_messages={'invalid': 'Source must be less than 50 characters'}
    )

def security_monitoring(f):
    """Decorator to add security monitoring to endpoints"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Log request details
        request_data = {
            'ip': get_remote_address(),
            'user_agent': request.headers.get('User-Agent', ''),
            'method': request.method,
            'endpoint': request.endpoint,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Check for suspicious patterns
        if request.is_json:
            json_data = request.get_json(silent=True) or {}
            suspicious_check = security_monitor.detect_suspicious_activity(
                json.dumps(json_data)
            )
            
            if suspicious_check['is_suspicious']:
                security_monitor.log_security_event(
                    'SUSPICIOUS_REQUEST',
                    {
                        **request_data,
                        'threats': suspicious_check['threats'],
                        'input_data': json_data
                    }
                )
                return jsonify({
                    'success': False,
                    'message': 'Invalid input detected',
                    'code': 'SECURITY_VIOLATION'
                }), 400
        
        return f(*args, **kwargs)
    return decorated_function

def sanitize_lead_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Sanitize lead input data"""
    sanitized = {}
    
    for key, value in data.items():
        if value is not None:
            if isinstance(value, str):
                sanitized[key] = sanitize_text(value)
            else:
                sanitized[key] = value
        else:
            sanitized[key] = None
    
    # Additional email sanitization
    if 'email' in sanitized and sanitized['email']:
        sanitized['email'] = sanitize_text(sanitized['email'].lower().strip())
    
    return sanitized

def generate_lead_id() -> str:
    """Generate unique lead ID"""
    timestamp = str(int(time.time()))
    random_suffix = hashlib.md5(f"{timestamp}{request.remote_addr}".encode()).hexdigest()[:8]
    return f"lead_{timestamp}_{random_suffix}"

def check_duplicate_lead(email: str) -> bool:
    """Check for duplicate leads (mock implementation)"""
    # In production, check database for existing leads
    # For testing, return False
    return False

def save_lead_to_database(lead_data: Dict[str, Any]) -> bool:
    """Save lead to database (mock implementation)"""
    # In production, save to database
    # For testing, return True
    return True

@app.route('/api/leads', methods=['POST'])
@rate_limiter.limit("5 per 15 minutes")
@security_monitoring
def create_lead():
    """
    Lead Capture API Endpoint
    POST /api/leads
    """
    try:
        # Parse JSON data
        if not request.is_json:
            return jsonify({
                'success': False,
                'message': 'JSON content type required',
                'code': 'INVALID_CONTENT_TYPE'
            }), 400
        
        raw_data = request.get_json()
        
        # Validate input using schema
        try:
            lead_schema = LeadSchema()
            validated_data = lead_schema.load(raw_data)
        except ValidationError as err:
            security_monitor.log_security_event(
                'LEAD_VALIDATION_FAILED',
                {
                    'ip': get_remote_address(),
                    'user_agent': request.headers.get('User-Agent', ''),
                    'errors': err.messages,
                    'input_data': raw_data
                }
            )
            
            return jsonify({
                'success': False,
                'message': 'Validation failed',
                'errors': list(err.messages.values()),
                'code': 'VALIDATION_ERROR'
            }), 400
        
        # Additional security checks
        json_string = json.dumps(raw_data)
        suspicious_check = security_monitor.detect_suspicious_activity(json_string)
        
        if suspicious_check['is_suspicious']:
            security_monitor.log_security_event(
                'SUSPICIOUS_LEAD_INPUT',
                {
                    'ip': get_remote_address(),
                    'user_agent': request.headers.get('User-Agent', ''),
                    'threats': suspicious_check['threats'],
                    'input_data': raw_data
                }
            )
            
            return jsonify({
                'success': False,
                'message': 'Invalid input detected',
                'code': 'SECURITY_VIOLATION'
            }), 400
        
        # Sanitize input data
        sanitized_data = sanitize_lead_data(validated_data)
        
        # Additional email validation after sanitization
        email_validation = validate_email(sanitized_data['email'])
        if not email_validation['is_valid']:
            return jsonify({
                'success': False,
                'message': email_validation.get('error', 'Invalid email format'),
                'code': 'INVALID_EMAIL'
            }), 400
        
        # Check for duplicate leads
        if check_duplicate_lead(sanitized_data['email']):
            return jsonify({
                'success': False,
                'message': 'We already received your inquiry. We\'ll be in touch soon!',
                'code': 'DUPLICATE_LEAD'
            }), 409
        
        # Generate lead ID
        lead_id = generate_lead_id()
        
        # Prepare lead data for database
        lead_record = {
            **sanitized_data,
            'id': lead_id,
            'ip': get_remote_address(),
            'user_agent': request.headers.get('User-Agent', ''),
            'timestamp': datetime.utcnow().isoformat(),
            'status': 'new'
        }
        
        # Save lead to database
        if not save_lead_to_database(lead_record):
            security_monitor.log_security_event(
                'LEAD_SAVE_FAILED',
                {
                    'ip': get_remote_address(),
                    'lead_data': sanitized_data,
                    'error': 'Database save failed'
                }
            )
            
            return jsonify({
                'success': False,
                'message': 'Failed to save lead. Please try again.',
                'code': 'SAVE_ERROR'
            }), 500
        
        # Log successful lead capture
        security_monitor.log_security_event(
            'LEAD_CAPTURED',
            {
                'lead_id': lead_id,
                'email': sanitized_data['email'],
                'user_type': sanitized_data['user_type'],
                'industry': sanitized_data['industry'],
                'ip': get_remote_address(),
                'source': sanitized_data.get('source')
            }
        )
        
        # Return success response
        return jsonify({
            'success': True,
            'lead_id': lead_id,
            'message': 'Thank you for your interest! We\'ll contact you within 24 hours.',
            'code': 'SUCCESS'
        }), 201
        
    except Exception as e:
        # Log error
        security_monitor.log_security_event(
            'LEAD_CAPTURE_ERROR',
            {
                'ip': get_remote_address(),
                'error': str(e),
                'stack': traceback.format_exc() if 'traceback' in globals() else None
            }
        )
        
        return jsonify({
            'success': False,
            'message': 'An unexpected error occurred. Please try again.',
            'code': 'INTERNAL_ERROR'
        }), 500

@app.errorhandler(429)
def ratelimit_handler(e):
    """Handle rate limit exceeded"""
    return jsonify({
        'success': False,
        'message': 'Too many lead submissions. Please try again later.',
        'code': 'RATE_LIMIT_EXCEEDED'
    }), 429

@app.errorhandler(400)
def bad_request_handler(e):
    """Handle bad request errors"""
    return jsonify({
        'success': False,
        'message': 'Bad request',
        'code': 'BAD_REQUEST'
    }), 400

@app.errorhandler(500)
def internal_error_handler(e):
    """Handle internal server errors"""
    return jsonify({
        'success': False,
        'message': 'Internal server error',
        'code': 'INTERNAL_ERROR'
    }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)