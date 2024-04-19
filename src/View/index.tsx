import React from 'react';
import ReactDom from 'react-dom';
import type { AppArguments } from '../AppArguments';
import { App } from './App';
import { FluentProvider, webDarkTheme, webLightTheme } from '@fluentui/react-components';

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

function isDarkModeEnabled() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches;
}

ReactDom.render(
  <FluentProvider theme={isDarkModeEnabled() ? webDarkTheme : webLightTheme}>
    <App args={args} />
  </FluentProvider>,
  document.getElementById('root')
);
