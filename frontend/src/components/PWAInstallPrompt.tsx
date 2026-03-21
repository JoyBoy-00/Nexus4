import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Snackbar,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

type PWAInstallPromptProps = {
  enabled: boolean;
};

const PROMPT_DELAY_MS = 4500;
const AUTO_HIDE_MS = 6500;

const PWAInstallPrompt = ({ enabled }: PWAInstallPromptProps) => {
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [installing, setInstalling] = useState(false);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearShowTimer = useCallback(() => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
  }, []);

  const schedulePromptDisplay = useCallback(() => {
    clearShowTimer();
    showTimerRef.current = setTimeout(() => {
      setOpen(true);
    }, PROMPT_DELAY_MS);
  }, [clearShowTimer]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);

      if (enabled) {
        schedulePromptDisplay();
      }
    };

    const handleAppInstalled = () => {
      clearShowTimer();
      setOpen(false);
      setPromptEvent(null);
      setInstalling(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      clearShowTimer();
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [enabled, schedulePromptDisplay, clearShowTimer]);

  useEffect(() => {
    if (!enabled) {
      clearShowTimer();
      setOpen(false);
      return;
    }

    if (promptEvent && !open) {
      schedulePromptDisplay();
    }
  }, [enabled, promptEvent, open, clearShowTimer, schedulePromptDisplay]);

  const handleInstall = async () => {
    if (!promptEvent || installing) {
      return;
    }

    try {
      setInstalling(true);
      await promptEvent.prompt();
      await promptEvent.userChoice;
    } finally {
      setInstalling(false);
    }

    setOpen(false);
    setPromptEvent(null);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={AUTO_HIDE_MS}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Paper
        elevation={10}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          width: { xs: 'calc(100vw - 24px)', sm: 440 },
          borderRadius: 2,
          p: 1.25,
          border: '1px solid',
          borderColor: 'divider',
          background:
            'linear-gradient(160deg, rgba(0,0,0,0.03), rgba(16,24,40,0.08))',
          backdropFilter: 'blur(6px)',
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            flexShrink: 0,
          }}
        >
          <DownloadRoundedIcon fontSize="small" />
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Install Nexus
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Get quicker launch and a smoother app-like experience.
          </Typography>
        </Box>

        <Button
          size="small"
          variant="contained"
          disableElevation
          onClick={handleInstall}
          disabled={installing}
          sx={{ minWidth: 88 }}
        >
          {installing ? 'Installing...' : 'Install'}
        </Button>

        <IconButton
          size="small"
          onClick={handleClose}
          aria-label="Dismiss install prompt"
          sx={{ color: 'text.secondary', ml: -0.5 }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Paper>
    </Snackbar>
  );
};

export default PWAInstallPrompt;
