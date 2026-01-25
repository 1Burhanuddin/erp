import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './components/theme-provider'

import { Provider } from 'react-redux';
import { store } from './store';

createRoot(document.getElementById("root")!).render(
    <Provider store={store}>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <App />
        </ThemeProvider>
    </Provider>
);
