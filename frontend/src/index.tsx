import ReactDOM from 'react-dom/client';
import { StyledEngineProvider } from '@mui/material/styles';
import { registerSW } from 'virtual:pwa-register';
import './index.css';
import App from './App';

const validateEnvironment = () => {
  const requiredVars = ['VITE_BACKEND_URL'] as const;
  const missingRequired = requiredVars.filter(
    (key) => !import.meta.env[key]?.trim()
  );

  if (missingRequired.length > 0) {
    throw new Error(
      `Missing required frontend environment variables: ${missingRequired.join(', ')}`
    );
  }

  const firebaseVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_FIREBASE_VAPID_KEY',
  ] as const;

  const definedFirebase = firebaseVars.filter((key) =>
    Boolean(import.meta.env[key]?.trim())
  );

  if (
    definedFirebase.length > 0 &&
    definedFirebase.length < firebaseVars.length
  ) {
    const missingFirebase = firebaseVars.filter(
      (key) => !import.meta.env[key]?.trim()
    );
    throw new Error(
      `Incomplete Firebase configuration. Missing: ${missingFirebase.join(', ')}`
    );
  }
};

validateEnvironment();

registerSW({ immediate: true });

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StyledEngineProvider injectFirst>
    <App />
  </StyledEngineProvider>
);
