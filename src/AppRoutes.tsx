import React from 'react';
import { Navigate, Route, RouteProps, Routes, useLocation } from 'react-router-dom';
import { auth } from './firebase';
import HomePage from './pages/home-page';
import MissingPage from './pages/missing-page';
import StorePage from './pages/store-page';
import TransactionsPage from './pages/transactions-page';

type RouteConfig = RouteProps & {
  isPrivate?: boolean;
};

interface AuthRequiredProps {
  children: React.ReactNode;
  to?: string;
}

const routes: RouteConfig[] = [
  {
    path: '/',
    element: <HomePage />,
    index: true,
  },
  {
    path: '/store/:storeId',
    element: <StorePage />,
    isPrivate: true,
  },
  {
    path: '/store/:storeId/transactions',
    element: <TransactionsPage />,
    isPrivate: true,
  },
  {
    path: '*',
    element: <MissingPage />,
  },
];

const AppRoutes = () => {
  return <Routes>{routes.map((route) => renderRouteMap(route))}</Routes>;
};

const AuthRequired = ({ children, to = '/' }: AuthRequiredProps) => {
  const user = auth.currentUser;
  const { pathname } = useLocation();
  if (!user && pathname !== to) {
    return <Navigate to={to} replace />;
  }

  return children;
};

const renderRouteMap = ({ isPrivate, element, ...restRoute }: RouteConfig) => {
  const authRequiredElement = isPrivate ? <AuthRequired>{element}</AuthRequired> : element;
  return <Route key={restRoute.path} element={authRequiredElement} {...restRoute} />;
};

export default AppRoutes;
