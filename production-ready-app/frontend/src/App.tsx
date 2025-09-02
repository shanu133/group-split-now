import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingIndicator from './components/LoadingIndicator';
import EmptyState from './components/EmptyState';
import ConfirmationDialog from './components/ConfirmationDialog';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import ErrorPage from './pages/ErrorPage';

const App: React.FC = () => {
  return (
    <Router>
      <ErrorBoundary>
        <React.Suspense fallback={<LoadingIndicator />}>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/404" component={NotFound} />
            <Route path="/error" component={ErrorPage} />
            <Route component={NotFound} />
          </Switch>
        </React.Suspense>
      </ErrorBoundary>
    </Router>
  );
};

export default App;