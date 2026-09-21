import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './experience/experience.css';
import { Portfolio } from './portfolio';

createRoot(document.getElementById('root')!).render(<StrictMode><Portfolio /></StrictMode>);
