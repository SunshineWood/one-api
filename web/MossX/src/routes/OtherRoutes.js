import { lazy } from 'react';

// project imports
import Loadable from 'ui-component/Loadable';
import MinimalLayout from 'layout/MinimalLayout';
import NotifyUrl from '../views/Topup/Payment/NotifyUrl';
import ReturnUrl from '../views/Topup/Payment/ReturnUrl';

// login option 3 routing
const AuthLogin = Loadable(lazy(() => import('views/Authentication/Auth/Login')));
const AuthRegister = Loadable(lazy(() => import('views/Authentication/Auth/Register')));
const GitHubOAuth = Loadable(lazy(() => import('views/Authentication/Auth/GitHubOAuth')));
const LarkOAuth = Loadable(lazy(() => import('views/Authentication/Auth/LarkOAuth')));
const OidcOAuth = Loadable(lazy(() => import('views/Authentication/Auth/OidcOAuth')));
const ForgetPassword = Loadable(lazy(() => import('views/Authentication/Auth/ForgetPassword')));
const ResetPassword = Loadable(lazy(() => import('views/Authentication/Auth/ResetPassword')));
const Home = Loadable(lazy(() => import('views/Home')));
const About = Loadable(lazy(() => import('views/About')));
const NotFoundView = Loadable(lazy(() => import('views/Error')));

// ==============================|| AUTHENTICATION ROUTING ||============================== //

const OtherRoutes = {
  path: '/',
  element: <MinimalLayout />,
  children: [
    {
      path: '',
      element: <Home />
    },
    {
      path: '/about',
      element: <About />
    },
    {
      path: '/login',
      element: <AuthLogin />
    },
    {
      path: '/register',
      element: <AuthRegister />
    },
    {
      path: '/reset',
      element: <ForgetPassword />
    },
    {
      path: '/user/reset',
      element: <ResetPassword />
    },
    {
      path: '/oauth/github',
      element: <GitHubOAuth />
    },
    {
      path: '/oauth/lark',
      element: <LarkOAuth />
    },
    {
      path: 'oauth/oidc',
      element: <OidcOAuth />
    },
    {
      path: '/404',
      element: <NotFoundView />
    },
    {
      path: '/notify_url',
      element: <NotifyUrl />
    },
    {
      path: '/return_url',
      element: <ReturnUrl />
    }
  ]
};

export default OtherRoutes;
