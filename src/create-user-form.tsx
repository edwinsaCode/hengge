import type { CSSProperties, Dispatch, SetStateAction } from 'react';
import { useState } from 'react';

const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsiZWR3aW5zdXJ5YTE1QGdtYWlsLmNvbSJdLCJpc3MiOiJoZW5uZ2UtYWRtaXNzaW9uLWNoYWxsZW5nZSIsInN1YiI6ImNoYWxsZW5nZSJ9.5A78S5-BpTaiT69A299GSfwdu0-W3_cC0DiigiaCVmo';

const API_URL =
  'https://api.challenge.hennge.com/password-validation-challenge-api/001/challenge-signup';

interface CreateUserFormProps {
  setUserWasCreated: Dispatch<SetStateAction<boolean>>;
}

const CRITERIA = [
  {
    message: 'Password must be at least 10 characters long',
    fails: (p: string) => p.length < 10,
  },
  {
    message: 'Password must be at most 24 characters long',
    fails: (p: string) => p.length > 24,
  },
  {
    message: 'Password cannot contain spaces',
    fails: (p: string) => /\s/.test(p),
  },
  {
    message: 'Password must contain at least one number',
    fails: (p: string) => !/[0-9]/.test(p),
  },
  {
    message: 'Password must contain at least one uppercase letter',
    fails: (p: string) => !/[A-Z]/.test(p),
  },
  {
    message: 'Password must contain at least one lowercase letter',
    fails: (p: string) => !/[a-z]/.test(p),
  },
];

function CreateUserForm({ setUserWasCreated }: CreateUserFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const failingCriteria = CRITERIA.filter((c) => c.fails(password));
  const isPasswordValid = password.length > 0 && failingCriteria.length === 0;
  const showCriteriaErrors = password.length > 0 && failingCriteria.length > 0;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isUsernameBlank = !username.trim();
    const isPasswordInvalid = !isPasswordValid;

    if (isUsernameBlank || isPasswordInvalid) return;

    setApiError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        setUserWasCreated(true);
        return;
      }

      if (response.status === 401 || response.status === 403) {
        setApiError('Not authenticated to access this resource.');
        return;
      }

      if (response.status === 422) {
        setApiError('Sorry, the entered password is not allowed, please try a different one.');
        return;
      }

      setApiError('Something went wrong, please try again.');
    } catch {
      setApiError('Something went wrong, please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={formWrapper}>
      <form style={form} onSubmit={handleSubmit} noValidate>
        <label style={formLabel} htmlFor="username">
          Username
        </label>
        <input
          id="username"
          style={formInput}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />

        <label style={formLabel} htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          style={formInput}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={showCriteriaErrors ? true : undefined}
          autoComplete="new-password"
        />

        {showCriteriaErrors && (
          <ul style={criteriaList}>
            {failingCriteria.map((c) => (
              <li key={c.message} style={criteriaItem}>
                {c.message}
              </li>
            ))}
          </ul>
        )}

        {apiError !== null && <p style={apiErrorMessage}>{apiError}</p>}

        <button style={formButton} type="submit" disabled={isSubmitting}>
          Create User
        </button>
      </form>
    </div>
  );
}

export { CreateUserForm };

const formWrapper: CSSProperties = {
  maxWidth: '500px',
  width: '80%',
  backgroundColor: '#efeef5',
  padding: '24px',
  borderRadius: '8px',
};

const form: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const formLabel: CSSProperties = {
  fontWeight: 700,
};

const formInput: CSSProperties = {
  outline: 'none',
  padding: '8px 16px',
  height: '40px',
  fontSize: '14px',
  backgroundColor: '#f8f7fa',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  borderRadius: '4px',
};

const formButton: CSSProperties = {
  outline: 'none',
  borderRadius: '4px',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  backgroundColor: '#7135d2',
  color: 'white',
  fontSize: '16px',
  fontWeight: 500,
  height: '40px',
  padding: '0 8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '8px',
  alignSelf: 'flex-end',
  cursor: 'pointer',
};

const criteriaList: CSSProperties = {
  paddingLeft: '20px',
  margin: '4px 0',
};

const criteriaItem: CSSProperties = {
  color: '#c0392b',
  fontSize: '13px',
  marginBottom: '2px',
};

const apiErrorMessage: CSSProperties = {
  color: '#c0392b',
  fontSize: '13px',
  padding: '8px 12px',
  backgroundColor: '#fdecea',
  borderRadius: '4px',
  border: '1px solid #f5c6cb',
};
