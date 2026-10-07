import { Redirect, Route, type RouteProps } from 'react-router-dom';
import { IonContent, IonPage, IonSpinner } from '@ionic/react';
import { useAuth } from '../context/AuthContext';

const Loading: React.FC = () => (
  <IonPage>
    <IonContent fullscreen>
      <div className="min-h-screen flex items-center justify-center bg-background">
        <IonSpinner name="crescent" className="text-secondary" />
      </div>
    </IonContent>
  </IonPage>
);

/**
 * Route that requires a signed-in user. While the stored token is still being
 * verified we render a spinner rather than redirecting — redirecting first
 * would bounce a legitimately signed-in user to /login on every cold start.
 */
const ProtectedRoute: React.FC<RouteProps & { adminOnly?: boolean }> = ({
  children,
  adminOnly = false,
  ...rest
}) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  return (
    <Route
      {...rest}
      render={() => {
        if (loading) return <Loading />;
        if (!isAuthenticated) return <Redirect to="/login" />;
        if (adminOnly && !isAdmin) return <Redirect to="/home" />;
        return <>{children}</>;
      }}
    />
  );
};

export default ProtectedRoute;
