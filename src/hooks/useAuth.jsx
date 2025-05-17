// hooks/useAuth.js

// Re-export the useAuth hook from the AuthContext
// This creates a convenient import location while ensuring
// all components use the same authentication context
export { useAuth } from '../contexts/AuthContext';