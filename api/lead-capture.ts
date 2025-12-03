/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Lead Capture API Endpoint - Node.js/Express Implementation
 */

import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { validateEmail, validateInput, sanitizeText } from '../utils/validation';
import { SecurityMonitor, RateLimiter } from '../utils/security';
import { AuthService } from '../services/auth';

// Types
interface LeadData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  industry: string;
  budget: string;
  message?: string;
  userType: 'brand' | 'creator';
  consent: boolean;
  source?: string;
}

interface LeadResponse {
  success: boolean;
  leadId?: string;
  message: string;
  errors?: string[];
}

// Rate limiting for lead capture
const leadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 leads per 15 minutes per IP
  message: {
    success: false,
    message: 'Too many lead submissions. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Input validation middleware
const validateLeadInput = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Valid email address is required')
    .normalizeEmail(),
  
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name must be less than 100 characters'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[+]?[\d\s\-\(\)]+$/)
    .withMessage('Invalid phone number format'),
  
  body('industry')
    .trim()
    .isIn(['ecommerce', 'saas', 'cpg', 'fashion', 'tech', 'healthcare', 'finance', 'travel'])
    .withMessage('Invalid industry selection'),
  
  body('budget')
    .trim()
    .matches(/^\$?\d{1,6}(,\d{3})*$/)
    .withMessage('Invalid budget format'),
  
  body('message')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Message must be less than 1000 characters'),
  
  body('userType')
    .isIn(['brand', 'creator'])
    .withMessage('Invalid user type'),
  
  body('consent')
    .isBoolean()
    .withMessage('Consent is required'),
  
  body('source')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Source must be less than 50 characters'),
];

/**
 * Lead Capture API Endpoint
 * POST /api/leads
 */
export const createLeadEndpoint = (app: express.Application) => {
  app.post('/api/leads', 
    leadRateLimit,
    validateLeadInput,
    async (req: Request, res: Response) => {
      try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          const errorMessages = errors.array().map(error => error.msg);
          
          SecurityMonitor.logSecurityEvent('LEAD_VALIDATION_FAILED', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            errors: errorMessages,
            input: req.body
          });
          
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errorMessages,
            code: 'VALIDATION_ERROR'
          } as LeadResponse);
        }

        // Extract and sanitize input data
        const rawLeadData: LeadData = req.body;
        
        // Additional security checks
        const securityCheck = SecurityMonitor.detectSuspiciousActivity(
          JSON.stringify(rawLeadData)
        );
        
        if (securityCheck.isSuspicious) {
          SecurityMonitor.logSecurityEvent('SUSPICIOUS_LEAD_INPUT', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            threats: securityCheck.threats,
            input: rawLeadData
          });
          
          return res.status(400).json({
            success: false,
            message: 'Invalid input detected',
            code: 'SECURITY_VIOLATION'
          } as LeadResponse);
        }

        // Sanitize input data
        const sanitizedLeadData: LeadData = {
          name: sanitizeText(rawLeadData.name),
          email: sanitizeText(rawLeadData.email.toLowerCase()),
          company: rawLeadData.company ? sanitizeText(rawLeadData.company) : undefined,
          phone: rawLeadData.phone ? sanitizeText(rawLeadData.phone) : undefined,
          industry: sanitizeText(rawLeadData.industry),
          budget: sanitizeText(rawLeadData.budget),
          message: rawLeadData.message ? sanitizeText(rawLeadData.message) : undefined,
          userType: rawLeadData.userType,
          consent: rawLeadData.consent,
          source: rawLeadData.source ? sanitizeText(rawLeadData.source) : undefined
        };

        // Validate email format again after sanitization
        const emailValidation = validateEmail(sanitizedLeadData.email);
        if (!emailValidation.isValid) {
          return res.status(400).json({
            success: false,
            message: emailValidation.error || 'Invalid email format',
            code: 'INVALID_EMAIL'
          } as LeadResponse);
        }

        // Check for duplicate leads (same email in last 24 hours)
        const existingLead = await checkDuplicateLead(sanitizedLeadData.email);
        if (existingLead) {
          return res.status(409).json({
            success: false,
            message: 'We already received your inquiry. We\'ll be in touch soon!',
            code: 'DUPLICATE_LEAD'
          } as LeadResponse);
        }

        // Generate lead ID
        const leadId = generateLeadId();
        
        // Save lead to database (mock implementation)
        const savedLead = await saveLeadToDatabase({
          ...sanitizedLeadData,
          id: leadId,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString(),
          status: 'new'
        });

        if (!savedLead) {
          SecurityMonitor.logSecurityEvent('LEAD_SAVE_FAILED', {
            ip: req.ip,
            leadData: sanitizedLeadData,
            error: 'Database save failed'
          });
          
          return res.status(500).json({
            success: false,
            message: 'Failed to save lead. Please try again.',
            code: 'SAVE_ERROR'
          } as LeadResponse);
        }

        // Log successful lead capture
        SecurityMonitor.logSecurityEvent('LEAD_CAPTURED', {
          leadId,
          email: sanitizedLeadData.email,
          userType: sanitizedLeadData.userType,
          industry: sanitizedLeadData.industry,
          ip: req.ip,
          source: sanitizedLeadData.source
        });

        // Return success response
        return res.status(201).json({
          success: true,
          leadId,
          message: 'Thank you for your interest! We\'ll contact you within 24 hours.',
          code: 'SUCCESS'
        } as LeadResponse);

      } catch (error) {
        console.error('Lead capture error:', error);
        
        SecurityMonitor.logSecurityEvent('LEAD_CAPTURE_ERROR', {
          ip: req.ip,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        
        return res.status(500).json({
          success: false,
          message: 'An unexpected error occurred. Please try again.',
          code: 'INTERNAL_ERROR'
        } as LeadResponse);
      }
    }
  );
};

// Helper functions (mock implementations)
async function checkDuplicateLead(email: string): Promise<boolean> {
  // In production, check database for existing leads
  // For testing, return false
  return false;
}

function generateLeadId(): string {
  return 'lead_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

async function saveLeadToDatabase(leadData: any): Promise<boolean> {
  // In production, save to database
  // For testing, return true
  return true;
}

export default createLeadEndpoint;