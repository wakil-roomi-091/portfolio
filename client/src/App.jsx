import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import api from './services/api';
import { applyAccent } from './utils/appearance';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';

// Route-level code splitting. Home + Navbar/Footer stay in the main bundle so
// the landing page paints without an extra chunk round-trip; every other route
// — especially the heavy admin dashboard — is fetched on demand.
const Work = lazy(() => import('./pages/Work'));
const Skills = lazy(() => import('./pages/Skills'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Admin = lazy(() => import('./pages/Admin'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Account = lazy(() => import('./pages/Account'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
    </div>
  );
}

function AppShell() {
  const { dark, toggleTheme, applyTheme } = useTheme();

  useEffect(() => {
    document.documentElement.style.transition = 'background-color 0.4s ease, color 0.4s ease';
  }, []);

  // Apply saved site appearance (accent + default theme) from the backend.
  // Accent always applies; the default theme only seeds the view when the
  // visitor hasn't already chosen one (so a manual toggle is never overridden).
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get('/settings');
        if (!active) return;
        const { accent, defaultTheme } = res.data || {};
        if (accent) applyAccent(accent, { persist: true });
        let saved = null;
        try {
          saved = localStorage.getItem('roomi-theme');
        } catch { /* ignore */ }
        if (!saved && (defaultTheme === 'dark' || defaultTheme === 'light')) {
          applyTheme(defaultTheme, { persist: false });
        }
      } catch {
        // Settings are optional — keep defaults on failure.
      }
    })();
    return () => {
      active = false;
    };
  }, [applyTheme]);

  return (
    <div className={`min-h-screen ${dark ? 'bg-[#0E1117] text-[#ECEEF1]' : 'bg-[#FAFAFB] text-[#14151A]'} transition-colors duration-400`}>
      <Suspense fallback={<PageFallback />}>
        <Routes>
        {/* Public Routes with Navbar + Footer */}
        <Route
          path="/"
          element={
            <>
              <Navbar dark={dark} toggleDark={toggleTheme} />
              <Home dark={dark} />
              <Footer dark={dark} />
            </>
          }
        />
        <Route
          path="/work"
          element={
            <>
              <Navbar dark={dark} toggleDark={toggleTheme} />
              <Work dark={dark} />
              <Footer dark={dark} />
            </>
          }
        />
        <Route
          path="/skills"
          element={
            <>
              <Navbar dark={dark} toggleDark={toggleTheme} />
              <Skills dark={dark} />
              <Footer dark={dark} />
            </>
          }
        />
        <Route
          path="/about"
          element={
            <>
              <Navbar dark={dark} toggleDark={toggleTheme} />
              <About dark={dark} />
              <Footer dark={dark} />
            </>
          }
        />
        <Route
          path="/contact"
          element={
            <>
              <Navbar dark={dark} toggleDark={toggleTheme} />
              <Contact dark={dark} />
              <Footer dark={dark} />
            </>
          }
        />
        <Route
          path="/project/:id"
          element={
            <>
              <Navbar dark={dark} toggleDark={toggleTheme} />
              <ProjectDetail dark={dark} />
              <Footer dark={dark} />
            </>
          }
        />
        <Route
          path="/account"
          element={
            <>
              <Navbar dark={dark} toggleDark={toggleTheme} />
              <Account />
              <Footer dark={dark} />
            </>
          }
        />
        <Route
          path="/verify-email"
          element={
            <>
              <Navbar dark={dark} toggleDark={toggleTheme} />
              <VerifyEmail />
              <Footer dark={dark} />
            </>
          }
        />
        <Route
          path="/privacy"
          element={
            <>
              <Navbar dark={dark} toggleDark={toggleTheme} />
              <Privacy dark={dark} />
              <Footer dark={dark} />
            </>
          }
        />
        <Route
          path="/terms"
          element={
            <>
              <Navbar dark={dark} toggleDark={toggleTheme} />
              <Terms dark={dark} />
              <Footer dark={dark} />
            </>
          }
        />
        {/* Auth Routes (No Navbar/Footer) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Admin Route */}
        <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </Suspense>
      <Toaster position="bottom-right" />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
