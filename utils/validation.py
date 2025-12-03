"""
@license
SPDX-License-Identifier: Apache-2.0
"""

"""
Validation utilities for Python Flask application
"""

import re
from typing import Dict, Any

def validate_email(email: str) -> Dict[str, Any]:
    """
    Validate email format
    
    Args:
        email: Email address to validate
        
    Returns:
        Dictionary with validation result
    """
    if not email:
        return {
            'is_valid': False,
            'error': 'Email is required'
        }
    
    # Basic email regex
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    if not re.match(email_pattern, email):
        return {
            'is_valid': False,
            'error': 'Invalid email format'
        }
    
    if len(email) > 254:
        return {
            'is_valid': False,
            'error': 'Email is too long'
        }
    
    return {
        'is_valid': True,
        'error': None
    }

def validate_input(value: str, input_type: str, required: bool = True, 
                 min_length: int = 0, max_length: int = 1000) -> Dict[str, Any]:
    """
    Generic input validation
    
    Args:
        value: Value to validate
        input_type: Type of input
        required: Whether input is required
        min_length: Minimum length
        max_length: Maximum length
        
    Returns:
        Dictionary with validation result
    """
    if required and not value:
        return {
            'is_valid': False,
            'error': f'{input_type} is required'
        }
    
    if value and len(value) < min_length:
        return {
            'is_valid': False,
            'error': f'{input_type} must be at least {min_length} characters'
        }
    
    if value and len(value) > max_length:
        return {
            'is_valid': False,
            'error': f'{input_type} must be less than {max_length} characters'
        }
    
    return {
        'is_valid': True,
        'error': None
    }

def sanitize_text(text: str) -> str:
    """
    Sanitize text input to prevent XSS and injection attacks
    
    Args:
        text: Text to sanitize
        
    Returns:
        Sanitized text
    """
    if not text:
        return ''
    
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    # Remove JavaScript protocol
    text = re.sub(r'javascript:', '', text, flags=re.IGNORECASE)
    
    # Remove event handlers
    text = re.sub(r'on\w+\s*=', '', text, flags=re.IGNORECASE)
    
    # Remove quotes
    text = text.replace('"', '').replace("'", '')
    
    # Remove CSS expressions
    text = re.sub(r'expression\s*\(', '', text, flags=re.IGNORECASE)
    
    # Strip whitespace
    text = text.strip()
    
    return text