// app/approve/[projectId]/page.tsx
// Public page for clients to approve/decline estimates

'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

type ResponseType = 'approve' | 'approve_with_changes' | 'decline' | null;

export default function ApprovalPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params.projectId as string;
  const token = searchParams.get('token') || '';
  const preselectedResponse = searchParams.get('response') as ResponseType;

  const [response, setResponse] = useState<ResponseType>(preselectedResponse);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-select response from URL parameter
  useEffect(() => {
    if (preselectedResponse) {
      setResponse(preselectedResponse);
    }
  }, [preselectedResponse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!response) {
      setError('Please select a response');
      return;
    }

    if (response === 'approve_with_changes' && !comment.trim()) {
      setError('Please provide details about the changes you would like');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/approve-estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          response,
          comment: comment.trim() || null,
          token,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit response');
      }

      setSuccessMessage(data.message);
      setIsSubmitted(true);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit response');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mb-6">
              {response === 'approve' && (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {response === 'approve_with_changes' && (
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              )}
              {response === 'decline' && (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Response Recorded
            </h1>
            
            <p className="text-gray-600 mb-8">
              {successMessage}
            </p>

            <p className="text-sm text-gray-500">
              The quilter will be notified of your response and will contact you soon.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#4e283a] mb-2">
            Estimate Response
          </h1>
          <p className="text-gray-600">
            Please review the estimate and let us know how you'd like to proceed.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          
          {/* Response Options */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Your Response:
            </label>
            
            <div className="space-y-3">
              {/* Approve */}
              <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                style={{
                  borderColor: response === 'approve' ? '#10b981' : '#e5e7eb',
                  backgroundColor: response === 'approve' ? '#f0fdf4' : 'white',
                }}>
                <input
                  type="radio"
                  name="response"
                  value="approve"
                  checked={response === 'approve'}
                  onChange={(e) => setResponse(e.target.value as ResponseType)}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">✓ Approve Estimate</div>
                  <div className="text-sm text-gray-600">
                    I approve this estimate and would like to proceed as quoted.
                  </div>
                </div>
              </label>

              {/* Approve with Changes */}
              <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                style={{
                  borderColor: response === 'approve_with_changes' ? '#f59e0b' : '#e5e7eb',
                  backgroundColor: response === 'approve_with_changes' ? '#fffbeb' : 'white',
                }}>
                <input
                  type="radio"
                  name="response"
                  value="approve_with_changes"
                  checked={response === 'approve_with_changes'}
                  onChange={(e) => setResponse(e.target.value as ResponseType)}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">⚠ Approve with Changes</div>
                  <div className="text-sm text-gray-600">
                    I like this estimate but would like to discuss some modifications.
                  </div>
                </div>
              </label>

              {/* Decline */}
              <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                style={{
                  borderColor: response === 'decline' ? '#ef4444' : '#e5e7eb',
                  backgroundColor: response === 'decline' ? '#fef2f2' : 'white',
                }}>
                <input
                  type="radio"
                  name="response"
                  value="decline"
                  checked={response === 'decline'}
                  onChange={(e) => setResponse(e.target.value as ResponseType)}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">✗ Decline</div>
                  <div className="text-sm text-gray-600">
                    I would like to decline this estimate at this time.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Comment Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {response === 'approve_with_changes' 
                ? 'What changes would you like? (Required)' 
                : 'Additional Comments (Optional)'}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#98823a] focus:border-transparent"
              placeholder={
                response === 'approve_with_changes'
                  ? 'Please describe the changes you would like...'
                  : 'Any questions or comments? (Optional)'
              }
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !response}
            className="w-full py-3 px-4 rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: response === 'approve' ? '#10b981' : 
                             response === 'approve_with_changes' ? '#f59e0b' : 
                             response === 'decline' ? '#ef4444' : '#9ca3af',
            }}>
            {isSubmitting ? 'Submitting...' : 'Submit Response'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Powered by <span className="font-semibold text-[#4e283a]">StitchQueue</span>
          </p>
        </div>
      </div>
    </div>
  );
}
