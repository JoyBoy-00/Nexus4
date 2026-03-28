import { FC } from 'react';
import ProfileProvider from '../../contexts/ProfileContext';
import { SubCommunityProvider } from '../../contexts/SubCommunityContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { ReportProvider } from '../../contexts/reportContext';
import { GamificationProvider } from '../../contexts/GamificationContext';
import { EventProvider } from '../../contexts/eventContext';
import { EngagementProvider } from '../../contexts/engagementContext';
import { NewsProvider } from '../../contexts/NewsContext';
import { EngagementService } from '../../services/engagementService';

const engagementService = new EngagementService();

const AuthShell: FC<{ children: React.ReactNode }> = ({ children }) => (
  <NotificationProvider>
    <EngagementProvider engagementService={engagementService}>
      <ReportProvider>
        <EventProvider>
          <SubCommunityProvider>
            <GamificationProvider>
              <NewsProvider>
                <ProfileProvider>{children}</ProfileProvider>
              </NewsProvider>
            </GamificationProvider>
          </SubCommunityProvider>
        </EventProvider>
      </ReportProvider>
    </EngagementProvider>
  </NotificationProvider>
);

export default AuthShell;
