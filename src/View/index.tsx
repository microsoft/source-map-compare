import * as React from 'react';
import * as ReactDom from 'react-dom';
import type { AppArguments } from '../AppArguments';
import { BundleComparisonApp, SingleBundleApp } from './App';

// Allow arguments to be injected via Webpack BannerPlugin
declare global {
  interface Window {
    APP_ARGUMENTS: AppArguments;
  }
}
const args: AppArguments = window['APP_ARGUMENTS'];
let root: React.ReactElement;

if (args.mode === 'comparison') {
  root = <BundleComparisonApp leftBundle={args.leftBundle} rightBundle={args.rightBundle} />;
} else {
  root = <SingleBundleApp exploredBundle={args.bundle} />;
}

const rootElement = document.createElement('div');
rootElement.id = 'root';
document.body.appendChild(rootElement);

ReactDom.render(root, document.getElementById('root'));
