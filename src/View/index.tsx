import React from 'react';
import ReactDom from 'react-dom/client';
import type { AppArguments } from '../AppArguments';
import { Root } from './Root';

// Allow arguments to be injected via Webpack BannerPlugin
declare global {
  interface Window {
    APP_ARGUMENTS?: AppArguments;
  }
}

const args = window['APP_ARGUMENTS'];

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDom.createRoot(rootElement);
  root.render(<Root args={args} />);
}
