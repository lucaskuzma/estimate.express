import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it('detects hourly rate', () => {
  const entry = '1/h';
  const state = App.updateResult(entry);
  expect(state.output).toBe('$1 / hour ($40/w, $8/d)\n')
});
