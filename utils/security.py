"""
@license
SPDX-License-Identifier: Apache-2.0
"""

"""
Security utilities for Python Flask application
"""

import re
import json
import hashlib
import traceback
from datetime import datetime, timedelta
from typing import Dict, Any, List

class SecurityMonitor:
    """Security monitoring and threat detection"""
    
    def __init__(self):
        self.suspicious_patterns = [
            r'<script\b[^<]*(?:(?!<\/script>)<[^<]*<\/script>)',
            r'javascript:',
            r'on\w+\s*=',
            r'expression\s*\(',
            r'@import',
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
        
        # Compile regex patterns
        self.compiled_patterns = [re.compile(pattern, re.IGNORECASE) for pattern in self.suspicious_patterns]
    
    def detect_suspicious_activity(self, input_data: str) -> Dict[str, Any]:
        """
        Detect suspicious activity in input data
        
        Args:
            input_data: String to analyze
            
        Returns:
            Dictionary with detection results
        """
        if not input_data:
            return {
                'is_suspicious': False,
                'threats': []
            }
        
        threats = []
        
        for pattern in self.compiled_patterns:
            matches = pattern.findall(input_data)
            if matches:
                threat_type = self._get_threat_type(pattern.pattern)
                threats.append(f'{threat_type} detected: {len(matches)} occurrence(s)')
        
        return {
            'is_suspicious': len(threats) > 0,
            'threats': threats
        }
    
    def _get_threat_type(self, pattern: str) -> str:
        """Map regex pattern to threat type"""
        threat_mapping = {
            r'<script\b': 'XSS attempt',
            r'javascript:': 'JavaScript injection',
            r'on\w+\s*=': 'Event handler injection',
            r'expression\s*\(': 'CSS expression injection',
            r'@import': 'CSS import injection',
            r'union\s+select': 'SQL injection',
            r'drop\s+table': 'SQL injection',
            r'insert\s+into': 'SQL injection',
            r'--': 'SQL comment injection',
            r'/\*.*\*/': 'SQL comment injection',
            r'exec\s*\(': 'Code execution',
            r'eval\s*\(': 'Code execution',
            r'system\s*\(': 'Code execution',
            r'passthru\s*\(': 'Code execution',
            r'shell_exec\s*\(': 'Code execution'
        }
        
        for pattern, threat in threat_mapping.items():
            if pattern in pattern.lower():
                return threat
        
        return 'Unknown threat'
    
    def log_security_event(self, event_type: str, details: Dict[str, Any]) -> None:
        """
        Log security event
        
        Args:
            event_type: Type of security event
            details: Event details
        """
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'event_type': event_type,
            'details': details,
            'severity': self._get_event_severity(event_type)
        }
        
        # In production, send to logging service
        # For testing, print to console
        print(f"SECURITY_EVENT: {json.dumps(log_entry, indent=2)}")
        
        # Store in memory for testing
        if not hasattr(self, 'events'):
            self.events = []
        
        self.events.append(log_entry)
        
        # Keep only last 100 events
        if len(self.events) > 100:
            self.events = self.events[-100:]
    
    def _get_event_severity(self, event_type: str) -> str:
        """Get severity level for event type"""
        high_severity_events = [
            'XSS attempt',
            'SQL injection attempt',
            'Code execution',
            'JavaScript injection',
            'SUSPICIOUS_LEAD_INPUT'
        ]
        
        medium_severity_events = [
            'RATE_LIMIT_EXCEEDED',
            'SUSPICIOUS_REQUEST',
            'VALIDATION_FAILED'
        ]
        
        if any(event in high_severity_events for event in [event_type]):
            return 'HIGH'
        elif any(event in medium_severity_events for event in [event_type]):
            return 'MEDIUM'
        else:
            return 'LOW'
    
    def get_events(self) -> List[Dict[str, Any]]:
        """Get logged security events"""
        return getattr(self, 'events', [])
    
    def clear_events(self) -> None:
        """Clear logged security events"""
        self.events = []

class RateLimiter:
    """Rate limiting utility"""
    
    def __init__(self):
        self.requests = {}
    
    def is_allowed(self, key: str, limit: int, window: int) -> Dict[str, Any]:
        """
        Check if request is allowed based on rate limit
        
        Args:
            key: Identifier (usually IP address)
            limit: Maximum requests allowed
            window: Time window in seconds
            
        Returns:
            Dictionary with allowance status
        """
        now = datetime.utcnow()
        
        if key not in self.requests:
            self.requests[key] = []
        
        # Remove old requests outside window
        self.requests[key] = [
            req_time for req_time in self.requests[key]
            if (now - req_time).total_seconds() < window
        ]
        
        # Check if under limit
        is_allowed = len(self.requests[key]) < limit
        
        if is_allowed:
            self.requests[key].append(now)
        
        reset_time = (now + timedelta(seconds=window)).isoformat() if not is_allowed else None
        return {
            'allowed': is_allowed,
            'remaining': max(0, limit - len(self.requests[key])),
            'reset_time': reset_time
        }
    
    def clear(self, key: str = None) -> None:
        """Clear rate limit data"""
        if key:
            self.requests.pop(key, None)
        else:
            self.requests.clear()

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