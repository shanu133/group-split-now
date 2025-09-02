import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from '../pages/Home';
import NotFound from '../pages/NotFound';
import ErrorPage from '../pages/ErrorPage';

const AppRoutes: React.FC = () => {
    return (
        <Router>
            <Switch>
                <Route exact path="/" component={Home} />
                <Route path="/404" component={NotFound} />
                <Route path="/error" component={ErrorPage} />
                <Route component={NotFound} />
            </Switch>
        </Router>
    );
};

export default AppRoutes;