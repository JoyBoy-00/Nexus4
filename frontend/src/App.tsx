import { FC, lazy, Suspense, useEffect, useRef, type ErrorInfo } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { SnackbarProvider } from 'notistack';
import { HelmetProvider } from 'react-helmet-async';
import Loader from '@/utils/loader';
import {
  GlobalErrorFallback,
  RouteErrorFallback,
} from '@/components/ErrorBoundary/ErrorFallbacks';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './route/ProtectedRoute';
import AdminRoute from './route/AdminRoute';
import { reportFrontendError } from '@/services/errorReportingService';
import AuthSessionBridge from '@/components/Auth/AuthSessionBridge';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import PageMeta from '@/components/seo/PageMeta';
import SkipLink from '@/components/a11y/SkipLink';
import PageAnnouncer from '@/components/a11y/PageAnnouncer';
import './App.css';

// Lazy load all pages for better code splitting
const LandingOptimized = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const EnhancedRegister = lazy(() => import('./pages/Register'));
const RegistrationSuccess = lazy(() => import('./pages/RegistrationSuccess'));
const AdminDocumentVerification = lazy(
  () => import('./pages/AdminDocumentVerification')
);
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Connections = lazy(() => import('./pages/Connections'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const Profile = lazy(() => import('./pages/Profile'));
const Referrals = lazy(() => import('./pages/Referrals'));
const ReferralAnalytics = lazy(() => import('./pages/ReferralAnalytics'));
const Files = lazy(() => import('./pages/Files'));
// const Landing = lazy(() => import('./pages/Landing'));
const Notification = lazy(() => import('./pages/Notification'));
const FeedPage = lazy(() => import('./pages/Posts/FeedPage'));
const PostDetailPage = lazy(() => import('./pages/Posts/PostDetailPage'));
const UserPostsPage = lazy(() => import('./pages/Posts/UserPostsPage'));
const SubCommunitiesPage = lazy(
  () => import('./pages/SubCommunity/SubCommunityPage')
);
const SearchResultsPage = lazy(() => import('./pages/Posts/SearchResultsPage'));
const SubCommunityFeedPage = lazy(
  () => import('./pages/SubCommunity/SubCommunityFeedPage')
);
const AdminModerationPage = lazy(
  () => import('./pages/Posts/AdminModerationPage')
);
const AdminSubCommunityModerationPage = lazy(
  () => import('./pages/SubCommunity/AdminSubCommunityModerationPage')
);
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const EventsPage = lazy(() => import('./pages/Events/EventsPage'));
const EventDetailPage = lazy(() => import('./pages/Events/EventDetailPage'));
const CreateEventPage = lazy(() => import('./pages/Admin/CreateEventPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/AdminAnalyticsPage'));

const RouteUnavailable = lazy(() => import('./pages/RouteUnavailable'));

const SubCommunityJoinRequestModeration = lazy(
  () => import('./pages/SubCommunity/SubCommunityJoinRequestModeration')
);
const MySubCommunitiesPage = lazy(
  () => import('./pages/SubCommunity/MySubCommunityPage')
);
const ProjectsMainPage = lazy(() => import('./pages/Project/ProjectMainPage'));
const StartupsMainPage = lazy(() => import('./pages/Startup/StartupMainPage'));
const ProjectIdPage = lazy(() => import('./pages/Project/ProjectIdPage'));
const UserProjectPage = lazy(() => import('./pages/Project/UserProjectPage'));
const Gamification = lazy(() => import('./pages/Gamification'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const NewsDetail = lazy(() => import('./components/News/NewsDetail'));
const AdminNews = lazy(() => import('./pages/AdminNews'));
const SidebarProvider = lazy(() =>
  import('./components/ui/sidebar').then((module) => ({
    default: module.SidebarProvider,
  }))
);

const TopNavbar = lazy(() => import('./components/Navbar/top-navbar'));
const MobileTopNavbar = lazy(
  () => import('./components/Navbar/mobile-top-navbar')
);
const AppSidebarNexus = lazy(() =>
  import('./components/Navbar/app-sidebar-nexus').then((module) => ({
    default: module.AppSidebarNexus,
  }))
);

// Import context providers (MUST be non-lazy for proper context setup)
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { LandingPageProvider } from './contexts/LandingPageContext';

// Lazy-loaded context providers — only pulled in when the user is authenticated
// or when the specific route is visited, keeping the landing page bundle small.
const AuthShell = lazy(() => import('./components/Auth/AuthShell'));
const DashboardProvider = lazy(() => import('./contexts/DashBoardContext'));
const ShowcaseProvider = lazy(() => import('./contexts/ShowcaseContext'));
const StartupProvider = lazy(() => import('./contexts/StartupContext'));
const PostProvider = lazy(() => import('./contexts/PostContext'));
const TagProvider = lazy(() => import('./contexts/TagContext'));

// Loading component for Suspense fallback
const LoadingSpinner: FC = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
    }}
  >
    <Loader fullScreen={false} />
  </div>
);

const toError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }

  const fallbackMessage =
    typeof error === 'string' ? error : 'Unknown error from error boundary';
  return new Error(fallbackMessage);
};

const reportBoundaryError =
  (boundary: 'global' | 'route') => (error: unknown, info: ErrorInfo) => {
    const normalizedError = toError(error);

    void reportFrontendError({
      message: normalizedError.message,
      stack: normalizedError.stack,
      componentStack: info.componentStack ?? undefined,
      boundary,
      route: window.location.pathname,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });

    // Sentry wiring can be added here when M1 is completed.
    console.error(`[ErrorBoundary:${boundary}]`, normalizedError, info);
  };

const handleGlobalBoundaryError = reportBoundaryError('global');
const handleRouteBoundaryError = reportBoundaryError('route');

type RouteMeta = {
  title: string;
  description: string;
  type?: 'website' | 'article' | 'profile';
  noindex?: boolean;
  jsonLd?: Record<string, unknown>;
};

const toTitleCase = (text: string) =>
  text
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const resolveRouteMeta = (pathname: string): RouteMeta => {
  const exactRouteMeta: Record<string, RouteMeta> = {
    '/': {
      title: 'Home',
      description:
        'Nexus connects students and alumni for mentorship, referrals, and career growth.',
      type: 'website',
    },
    '/login': {
      title: 'Login',
      description: 'Sign in to your Nexus account.',
      noindex: true,
    },
    '/register': {
      title: 'Register',
      description: 'Create your Nexus account and join the community.',
      noindex: true,
    },
    '/registration-success': {
      title: 'Registration Success',
      description: 'Your Nexus registration has been submitted successfully.',
      noindex: true,
    },
    '/dashboard': {
      title: 'Dashboard',
      description: 'Your personalized Nexus dashboard and activity overview.',
      noindex: true,
    },
    '/connections': {
      title: 'Connections',
      description: 'Manage your Nexus network and connection requests.',
      noindex: true,
    },
    '/messages': {
      title: 'Messages',
      description: 'Chat with your Nexus connections in real time.',
      noindex: true,
    },
    '/profile': {
      title: 'Profile',
      description:
        'Manage your Nexus profile, skills, and professional details.',
      noindex: true,
    },
    '/referrals': {
      title: 'Referrals',
      description: 'Browse and manage referral opportunities on Nexus.',
      noindex: true,
    },
    '/referral-analytics': {
      title: 'Referral Analytics',
      description: 'Track referral performance and outcomes on Nexus.',
      noindex: true,
    },
    '/files': {
      title: 'Files',
      description: 'Manage your shared files securely on Nexus.',
      noindex: true,
    },
    '/notifications': {
      title: 'Notifications',
      description: 'See your latest updates and alerts from Nexus.',
      noindex: true,
    },
    '/notifications/unread': {
      title: 'Unread Notifications',
      description: 'Review unread Nexus notifications.',
      noindex: true,
    },
    '/feed': {
      title: 'Feed',
      description:
        'Stay updated with the latest posts from your Nexus network.',
      noindex: true,
    },
    '/subcommunities': {
      title: 'Subcommunities',
      description: 'Discover niche communities and discussions on Nexus.',
      noindex: true,
    },
    '/subcommunities/my': {
      title: 'My Subcommunities',
      description: 'View and manage your subcommunity memberships.',
      noindex: true,
    },
    '/subcommunities/my/owned': {
      title: 'Owned Subcommunities',
      description: 'Manage subcommunities you own.',
      noindex: true,
    },
    '/subcommunities/my/moderated': {
      title: 'Moderated Subcommunities',
      description: 'Manage subcommunities you moderate.',
      noindex: true,
    },
    '/subcommunities/my/member': {
      title: 'Member Subcommunities',
      description: 'Browse subcommunities you have joined.',
      noindex: true,
    },
    '/projects': {
      title: 'Projects',
      description: 'Discover student and alumni projects on Nexus.',
    },
    '/gamification': {
      title: 'Gamification',
      description: 'Track points, badges, and progress on Nexus.',
      noindex: true,
    },
    '/startups': {
      title: 'Startups',
      description:
        'Explore startup ideas and collaborations in the Nexus ecosystem.',
      noindex: true,
    },
    '/search': {
      title: 'Search',
      description: 'Search across Nexus posts, people, and content.',
      noindex: true,
    },
    '/events': {
      title: 'Events',
      description:
        'Discover upcoming networking events and workshops on Nexus.',
    },
    '/news': {
      title: 'News',
      description:
        'Explore the latest announcements and industry stories on Nexus.',
      type: 'website',
    },
  };

  if (exactRouteMeta[pathname]) {
    return exactRouteMeta[pathname];
  }

  if (pathname === '/') {
    return {
      title: 'Home',
      description:
        'Nexus connects students and alumni for mentorship, referrals, and career growth.',
      type: 'website',
    };
  }

  if (pathname.startsWith('/profile/')) {
    const slug = decodeURIComponent(pathname.split('/')[2] || '').trim();
    const personName = slug ? toTitleCase(slug) : 'Nexus Member';
    return {
      title: `${personName} Profile`,
      description: `View ${personName}'s professional profile on Nexus.`,
      type: 'profile',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: personName,
      },
    };
  }

  if (pathname.startsWith('/news/')) {
    return {
      title: 'News Article',
      description: 'Read the latest Nexus news and updates.',
      type: 'article',
    };
  }

  if (pathname.startsWith('/projects/')) {
    return {
      title: 'Project Details',
      description:
        'Explore project details, collaborators, and updates on Nexus.',
      type: 'article',
    };
  }

  if (pathname.startsWith('/posts/')) {
    return {
      title: 'Post',
      description: 'Read conversations and updates from the Nexus community.',
      type: 'article',
    };
  }

  if (pathname.startsWith('/events/')) {
    return {
      title: 'Event Details',
      description: 'See full event details and participation info on Nexus.',
      type: 'article',
    };
  }

  if (pathname.startsWith('/users/') && pathname.endsWith('/posts')) {
    return {
      title: 'User Posts',
      description: 'Browse posts from this Nexus member.',
      noindex: true,
    };
  }

  if (pathname.startsWith('/users/') && pathname.endsWith('/projects')) {
    return {
      title: 'User Projects',
      description: 'Browse projects from this Nexus member.',
      noindex: true,
    };
  }

  if (pathname.startsWith('/subcommunities/')) {
    return {
      title: 'Subcommunity',
      description:
        'Explore this Nexus subcommunity and its latest discussions.',
      noindex: true,
    };
  }

  if (pathname.startsWith('/admin')) {
    return {
      title: 'Admin',
      description: 'Nexus administration dashboard.',
      noindex: true,
    };
  }

  return {
    title: 'Nexus',
    description: 'Nexus platform for student and alumni networking.',
    noindex: pathname !== '/',
  };
};

// Layout content component that uses auth
const LayoutContent: FC = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const origin = window.location.origin;
  const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
  const canonicalUrl = `${normalizedOrigin}${pathname}`;
  const ogImage = `${normalizedOrigin}/nexus.webp`;
  const routeMeta = resolveRouteMeta(pathname);
  const resolvedJsonLd = routeMeta.jsonLd
    ? { ...routeMeta.jsonLd, url: canonicalUrl }
    : undefined;
  const contentScrollRef = useRef<HTMLDivElement | null>(null);
  const mainRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = contentScrollRef.current;
    if (container) {
      container.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    // Focus management on route change (WCAG 2.4.3 Focus Order)
    // Set tabIndex to -1 to allow programmatic focus without tab order
    if (mainRef.current) {
      mainRef.current.setAttribute('tabIndex', '-1');
      // Focus main content after a brief delay to ensure content is rendered
      setTimeout(() => {
        mainRef.current?.focus();
      }, 100);
    }
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen w-full">
      <PageMeta
        title={routeMeta.title}
        description={routeMeta.description}
        type={routeMeta.type}
        noindex={routeMeta.noindex}
        image={ogImage}
        url={canonicalUrl}
        jsonLd={resolvedJsonLd}
      />
      <SkipLink />
      <PageAnnouncer />
      {!user && (
        <Suspense fallback={null}>
          <TopNavbar />
        </Suspense>
      )}
      {user && (
        <Suspense fallback={null}>
          <MobileTopNavbar />
        </Suspense>
      )}
      <div className="flex flex-1 overflow-hidden w-full">
        {user && (
          <Suspense fallback={null}>
            <AppSidebarNexus />
          </Suspense>
        )}
        <main
          ref={mainRef}
          id="main-content"
          className="w-full flex-1 overflow-y-auto overflow-x-hidden focus:outline-none"
          style={{
            minHeight: 'calc(100vh - 64px)',
            backgroundColor: 'var(--background)',
            position: 'relative',
            transition: 'all 0.3s ease',
          }}
        >
          <div
            id="app-scroll-container"
            data-app-scroll-container="true"
            ref={contentScrollRef}
            className="w-full flex-1"
            style={{
              minHeight: 'calc(100vh - 64px)',
              backgroundColor: 'var(--background)',
              position: 'relative',
              transition: 'all 0.3s ease',
            }}
          >
            <ErrorBoundary
              FallbackComponent={RouteErrorFallback}
              onError={handleRouteBoundaryError}
              resetKeys={[pathname]}
            >
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <LandingPageProvider>
                        <LandingOptimized />
                      </LandingPageProvider>
                    }
                  />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<EnhancedRegister />} />
                  <Route
                    path="/registration-success"
                    element={<RegistrationSuccess />}
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardProvider>
                          <Dashboard />
                        </DashboardProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/document-verification"
                    element={
                      <AdminRoute>
                        <AdminDocumentVerification />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/connections"
                    element={
                      <ProtectedRoute>
                        <Connections />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/messages"
                    element={
                      <ProtectedRoute>
                        <ChatPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile/:profileSlug"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/referrals"
                    element={
                      <ProtectedRoute>
                        <Referrals />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/referral-analytics"
                    element={
                      <ProtectedRoute>
                        <ReferralAnalytics />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/files"
                    element={
                      <ProtectedRoute>
                        <Files />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <Notification />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notifications/unread"
                    element={
                      <ProtectedRoute>
                        <Notification />
                      </ProtectedRoute>
                    }
                  />

                  {/* Post-related routes with lazy loading */}
                  <Route
                    path="/feed"
                    element={
                      <ProtectedRoute>
                        <PostProvider>
                          <Suspense fallback={<LoadingSpinner />}>
                            <FeedPage />
                          </Suspense>
                        </PostProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/posts/:id"
                    element={
                      <ProtectedRoute>
                        <PostProvider>
                          <Suspense fallback={<LoadingSpinner />}>
                            <PostDetailPage />
                          </Suspense>
                        </PostProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/users/:userId/posts"
                    element={
                      <ProtectedRoute>
                        <PostProvider>
                          <Suspense fallback={<LoadingSpinner />}>
                            <UserPostsPage />
                          </Suspense>
                        </PostProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/subcommunities"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingSpinner />}>
                          <SubCommunitiesPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/subcommunities/:id"
                    element={
                      <ProtectedRoute>
                        <PostProvider>
                          <Suspense fallback={<LoadingSpinner />}>
                            <SubCommunityFeedPage />
                          </Suspense>
                        </PostProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/subcommunities/my"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingSpinner />}>
                          <MySubCommunitiesPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/subcommunities/my/owned"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingSpinner />}>
                          <MySubCommunitiesPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/subcommunities/my/moderated"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingSpinner />}>
                          <MySubCommunitiesPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/subcommunities/my/member"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingSpinner />}>
                          <MySubCommunitiesPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/projects"
                    element={
                      <ProtectedRoute>
                        <ShowcaseProvider>
                          <ProjectsMainPage />
                        </ShowcaseProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/gamification"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingSpinner />}>
                          <Gamification />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/projects/:projectId"
                    element={
                      <ProtectedRoute>
                        <ShowcaseProvider>
                          <ProjectIdPage />
                        </ShowcaseProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/users/:userId/projects"
                    element={
                      <ProtectedRoute>
                        <ShowcaseProvider>
                          <UserProjectPage />
                        </ShowcaseProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/startups"
                    element={
                      <ProtectedRoute>
                        <StartupProvider>
                          <StartupsMainPage />
                        </StartupProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/search"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingSpinner />}>
                          <SearchResultsPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/events"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingSpinner />}>
                          <EventsPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/events/:id"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingSpinner />}>
                          <EventDetailPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/news"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingSpinner />}>
                          <NewsPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/news/:slug"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingSpinner />}>
                          <NewsDetail />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin-only routes with lazy loading */}
                  <Route
                    path="/admin/moderation"
                    element={
                      <AdminRoute>
                        <PostProvider>
                          <Suspense fallback={<LoadingSpinner />}>
                            <AdminModerationPage />
                          </Suspense>
                        </PostProvider>
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/reports"
                    element={
                      <AdminRoute>
                        <Suspense fallback={<LoadingSpinner />}>
                          <ReportsPage />
                        </Suspense>
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/news"
                    element={
                      <AdminRoute>
                        <Suspense fallback={<LoadingSpinner />}>
                          <AdminNews />
                        </Suspense>
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/events/create"
                    element={
                      <AdminRoute>
                        <Suspense fallback={<LoadingSpinner />}>
                          <TagProvider>
                            <CreateEventPage />
                          </TagProvider>
                        </Suspense>
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/moderation/subcommunities"
                    element={
                      <AdminRoute>
                        <Suspense fallback={<LoadingSpinner />}>
                          <AdminSubCommunityModerationPage />
                        </Suspense>
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/moderation/subcommunities/:id/join-requests"
                    element={
                      <AdminRoute>
                        <Suspense fallback={<LoadingSpinner />}>
                          <SubCommunityJoinRequestModeration />
                        </Suspense>
                      </AdminRoute>
                    }
                  />

                  <Route
                    path="/admin/analytics"
                    element={
                      <AdminRoute>
                        <Suspense fallback={<LoadingSpinner />}>
                          <AdminAnalyticsPage />
                        </Suspense>
                      </AdminRoute>
                    }
                  />
                  <Route path="*" element={<RouteUnavailable />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
};

// Layout component that wraps LayoutContent with SidebarProvider and Router
const Layout: FC = () => {
  const { user } = useAuth();

  return (
    <Router>
      <AuthSessionBridge />
      {user ? (
        <Suspense fallback={null}>
          <SidebarProvider>
            <LayoutContent />
          </SidebarProvider>
        </Suspense>
      ) : (
        <LayoutContent />
      )}
    </Router>
  );
};

const AuthGate: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return (
      <>
        {children}
        <PWAInstallPrompt enabled={false} />
      </>
    );
  }

  return (
    <>
      <Suspense fallback={<LoadingSpinner />}>
        <AuthShell>{children}</AuthShell>
      </Suspense>
      <PWAInstallPrompt enabled />
    </>
  );
};

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary
        FallbackComponent={GlobalErrorFallback}
        onError={handleGlobalBoundaryError}
      >
        <ThemeProvider>
          <SnackbarProvider
            maxSnack={4}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <AuthProvider>
              <AuthGate>
                <Layout />
              </AuthGate>
            </AuthProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
