import './App.css';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import AuthProvider from './contexts/AuthProvider';
import SignIn from './pages/SignIn';
import Home from './pages/Home/Home';
import AuthRoute from './contexts/AuthRoute';
import store from './store/store';
import { Provider } from 'react-redux';
function App() {
  const routes = [
    {
      path: '/home',
      element: <Home />
    }
  ];

  return (
    <>
      <Provider store={store}>
        <AuthProvider>
          <Router basename="/rtc">
            <Switch>
              <Route exact path="/">
                <SignIn />
              </Route>
              {routes.map((item, index) => {
                return (
                  <Route key={index} exact path={item.path}>
                    <AuthRoute>{item.element}</AuthRoute>
                  </Route>
                );
              })}
              {/* {routes.map((item, index) => {
              return (
                <Route key={index} path={item.path} element={item.element} />
              );
            })} */}
            </Switch>
          </Router>
        </AuthProvider>
      </Provider>
    </>
  );
}

export default App;
