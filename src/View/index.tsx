import React from 'react';
import ReactDom from 'react-dom';
import type { AppArguments } from '../AppArguments';
import { App } from './App';
import {
  FluentProvider,
  createCSSRuleFromTheme,
  tokens,
  webDarkTheme,
  webLightTheme
} from '@fluentui/react-components';

// Allow arguments to be injected via Webpack BannerPlugin
declare global {
  interface Window {
    APP_ARGUMENTS: AppArguments;
  }
}

const args: AppArguments = window['APP_ARGUMENTS'];

const rootElement = document.createElement('div');
rootElement.id = 'root';
document.body.appendChild(rootElement);

const darkTheme = window.matchMedia?.('(prefers-color-scheme: dark)') as MediaQueryList | undefined;

const Root: React.FC = () => {
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
    document.body.style.backgroundColor = tokens.colorNeutralBackground1;
    document.body.style.margin = '0px';
    style.sheet?.insertRule(lightThemeCSS);
    style.sheet?.insertRule(darkThemeCSS);

    onThemeChange();
    return () => {
      darkTheme?.removeEventListener('change', onThemeChange);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <FluentProvider theme={theme}>
      <App args={args} />
    </FluentProvider>
  );
};

ReactDom.render(<Root />, document.getElementById('root'));
