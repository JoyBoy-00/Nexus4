import { FC } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: FC = () => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="p-2 rounded hover:bg-green-900/12 focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            <motion.div
              key={isDark ? 'sun' : 'moon'}
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              {isDark ? (
                <Sun color="#facc15" size={22} />
              ) : (
                <Moon color="#22c55e" size={22} />
              )}
            </motion.div>
          </motion.button>
        </Tooltip.Trigger>
        <Tooltip.Content
          className="bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-sm px-2 py-1 rounded"
          side="bottom"
        >
          Switch to {isDark ? 'light' : 'dark'} mode
          <Tooltip.Arrow className="fill-gray-800 dark:fill-gray-200" />
        </Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

export default ThemeToggle;
