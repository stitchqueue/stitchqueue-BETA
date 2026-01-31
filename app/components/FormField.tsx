"use client";

import { useEffect, useState } from "react";

// ============================================
// TYPES
// ============================================

interface FormFieldProps {
  label: string;
  error?: string | null;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

interface ValidatedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

interface ValidatedSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
  children: React.ReactNode;
}

interface ValidatedTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

interface FormErrorSummaryProps {
  errors: { field: string; message: string }[];
  title?: string;
  className?: string;
}

interface ValidationToastProps {
  show: boolean;
  message: string;
  onClose: () => void;
  duration?: number;
}

// ============================================
// FORM FIELD WRAPPER
// ============================================

/**
 * FormField - Wrapper component with label and error display
 *
 * Usage:
 * <FormField label="Email" error={getFieldError(errors, "email")} required>
 *   <ValidatedInput type="email" hasError={hasFieldError(errors, "email")} />
 * </FormField>
 */
export function FormField({
  label,
  error,
  required = false,
  hint,
  children,
  className = "",
}: FormFieldProps) {
  return (
    <div className={`${className}`}>
      <label className="block text-sm font-bold text-muted mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted mt-1">{hint}</p>}
      {error && (
        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
          <svg
            className="w-3 h-3 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// ============================================
// VALIDATED INPUT
// ============================================

/**
 * ValidatedInput - Input with error styling
 *
 * Usage:
 * <ValidatedInput
 *   type="text"
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 *   hasError={hasFieldError(errors, "fieldName")}
 * />
 */
export function ValidatedInput({
  hasError = false,
  className = "",
  ...props
}: ValidatedInputProps) {
  const baseClasses = "w-full px-4 py-2 border rounded-xl transition-colors";
  const normalClasses =
    "border-line focus:border-plum focus:ring-1 focus:ring-plum/20";
  const errorClasses =
    "border-red-300 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-200";

  return (
    <input
      className={`${baseClasses} ${
        hasError ? errorClasses : normalClasses
      } ${className}`}
      {...props}
    />
  );
}

// ============================================
// VALIDATED SELECT
// ============================================

/**
 * ValidatedSelect - Select with error styling
 *
 * Usage:
 * <ValidatedSelect
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 *   hasError={hasFieldError(errors, "fieldName")}
 * >
 *   <option value="">Select...</option>
 *   <option value="1">Option 1</option>
 * </ValidatedSelect>
 */
export function ValidatedSelect({
  hasError = false,
  className = "",
  children,
  ...props
}: ValidatedSelectProps) {
  const baseClasses = "w-full px-4 py-2 border rounded-xl transition-colors";
  const normalClasses =
    "border-line focus:border-plum focus:ring-1 focus:ring-plum/20";
  const errorClasses =
    "border-red-300 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-200";

  return (
    <select
      className={`${baseClasses} ${
        hasError ? errorClasses : normalClasses
      } ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

// ============================================
// VALIDATED TEXTAREA
// ============================================

/**
 * ValidatedTextarea - Textarea with error styling
 *
 * Usage:
 * <ValidatedTextarea
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 *   hasError={hasFieldError(errors, "fieldName")}
 *   rows={3}
 * />
 */
export function ValidatedTextarea({
  hasError = false,
  className = "",
  ...props
}: ValidatedTextareaProps) {
  const baseClasses = "w-full px-4 py-2 border rounded-xl transition-colors";
  const normalClasses =
    "border-line focus:border-plum focus:ring-1 focus:ring-plum/20";
  const errorClasses =
    "border-red-300 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-200";

  return (
    <textarea
      className={`${baseClasses} ${
        hasError ? errorClasses : normalClasses
      } ${className}`}
      {...props}
    />
  );
}

// ============================================
// FORM ERROR SUMMARY
// ============================================

/**
 * FormErrorSummary - Display all errors at top of form
 *
 * Usage:
 * <FormErrorSummary errors={validationResult.errors} />
 */
export function FormErrorSummary({
  errors,
  title = "Please fix the following errors:",
  className = "",
}: FormErrorSummaryProps) {
  if (errors.length === 0) return null;

  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-xl p-4 mb-6 ${className}`}
    >
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <div>
          <h3 className="font-bold text-red-800 text-sm">{title}</h3>
          <ul className="mt-2 space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-red-700">
                • {error.message}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ============================================
// VALIDATION TOAST
// ============================================

/**
 * ValidationToast - Bottom notification for validation errors
 *
 * Usage:
 * <ValidationToast
 *   show={showToast}
 *   message="Please fix the errors above"
 *   onClose={() => setShowToast(false)}
 * />
 */
export function ValidationToast({
  show,
  message,
  onClose,
  duration = 5000,
}: ValidationToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade out animation
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show, duration, onClose]);

  if (!show && !isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
        <svg
          className="w-5 h-5 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <span className="font-medium">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="ml-2 hover:bg-red-700 rounded p-1 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ============================================
// SUCCESS TOAST (BONUS)
// ============================================

interface SuccessToastProps {
  show: boolean;
  message: string;
  onClose: () => void;
  duration?: number;
}

/**
 * SuccessToast - Bottom notification for success messages
 *
 * Usage:
 * <SuccessToast
 *   show={showSuccess}
 *   message="Estimate saved successfully!"
 *   onClose={() => setShowSuccess(false)}
 * />
 */
export function SuccessToast({
  show,
  message,
  onClose,
  duration = 3000,
}: SuccessToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show, duration, onClose]);

  if (!show && !isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
        <svg
          className="w-5 h-5 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <span className="font-medium">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="ml-2 hover:bg-green-700 rounded p-1 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
