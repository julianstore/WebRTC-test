import './App.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import AuthProvider from './contexts/AuthProvider';
import SignIn from './pages/SignIn';
import Home from './pages/Home/Home';
import AuthRoute from './contexts/AuthRoute';
import { HelmetProvider } from 'react-helmet-async';

function App() {
  const routes = [
    {
      path: '/home',
      element: <Home />
    }
  ];

  return (
    <AuthProvider>
      <HelmetProvider>
        <Router>
          <Routes>
            <Route path="/" element={<SignIn />} />
            {routes.map((item, index) => {
              return (
                <Route
                  key={index}
                  path={item.path}
                  element={<AuthRoute>{item.element}</AuthRoute>}
                />
              );
            })}
            {/* {routes.map((item, index) => {
              return (
                <Route key={index} path={item.path} element={item.element} />
              );
            })} */}
          </Routes>
        </Router>
      </HelmetProvider>
    </AuthProvider>
  );
}

export default App;
