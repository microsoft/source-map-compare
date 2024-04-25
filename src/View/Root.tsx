import React from 'react';
import { webDarkTheme, webLightTheme, createCSSRuleFromTheme, FluentProvider } from '@fluentui/react-components';
import { App } from './App';
import type { AppArguments } from '../AppArguments';
import { useStyles } from './Root.styles';

const darkTheme = window.matchMedia?.('(prefers-color-scheme: dark)') as MediaQueryList | undefined;

export interface RootProps {
  args?: AppArguments;
}

export const Root: React.FC<RootProps> = ({ args }) => {
  const styles = useStyles();
  const theme = darkTheme?.matches ? webDarkTheme : webLightTheme;
  React.useLayoutEffect(() => {
    const lightThemeCSS = createCSSRuleFromTheme('.fluentui-light-theme', webLightTheme);
    const darkThemeCSS = createCSSRuleFromTheme('.fluentui-dark-theme', webDarkTheme);
    function onThemeChange() {
      document.body.classList.toggle('fluentui-dark-theme', darkTheme?.matches);
      document.body.classList.toggle('fluentui-light-theme', !darkTheme?.matches);
    }
    darkTheme?.addEventListener('change', onThemeChange);

    const style = document.createElement('style');
    document.head.appendChild(style);
    style.sheet?.insertRule(lightThemeCSS);
    style.sheet?.insertRule(darkThemeCSS);

    onThemeChange();
    return () => {
      darkTheme?.removeEventListener('change', onThemeChange);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <FluentProvider className={styles.root} theme={theme}>
      <App initialArgs={args} />
    </FluentProvider>
  );
};
