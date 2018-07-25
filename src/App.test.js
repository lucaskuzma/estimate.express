import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it('detects weekly rate', () => {
  const entry = '1/w';
  const state = App.updateResult(entry);
  expect(state.output).toBe('$1 / week ($0.025/h, $0.2/d)\n');
});

it('detects daily rate', () => {
  const entry = '1/d';
  const state = App.updateResult(entry);
  expect(state.output).toBe('$1 / day ($0.125/h, $5/w)\n');
});

it('detects hourly rate', () => {
  const entry = '1/h';
  const state = App.updateResult(entry);
  expect(state.output).toBe('$1 / hour ($40/w, $8/d)\n');
});

it('detects weekly rate and interval', () => {
  const entry = '1/w\n1w';
  const state = App.updateResult(entry);
  expect(state.output).toBe('$1 / week ($0.025/h, $0.2/d)\n$1\n');
});

it('detects weekly rate and interval and defaults hours', () => {
  const entry = '1/w\n1w\n1h';
  const state = App.updateResult(entry);
  expect(state.output).toBe('$1 / week ($0.025/h, $0.2/d)\n$1\n$0.025\n');
});

it('detects weekly rate and interval and defaults hours and adds sum', () => {
  const entry = '1/w\n1w\n1h';
  const state = App.updateResult(entry);
  expect(state.sum).toBe(1.025);
});

it('detects expenses', () => {
  const entry = 'lunch 5.3\ndinner 3';
  const state = App.updateResult(entry);
  expect(state.sum).toBe(8.3);
  expect(state.output).toBe('$5.3\n$3\n');
});

it('detects default change', () => {
  const entry = '100/h\n' +
    '1000/w\n' +
    '1w\n' +
    '1h';
  const state = App.updateResult(entry);
  expect(state.sum).toBe(1100);
  expect(state.output).toBe('$100 / hour ($4000/w, $800/d)\n' +
    '$1000 / week ($200/d)\n' +
    '$1000\n' +
    '$100\n');
});

it('detects schedules', () => {
  const entry = '100/h\n' +
    '2h/d\n' +
    '2d/w\n' +
    '1w';
  const state = App.updateResult(entry);
  expect(state.sum).toBe(400);
  expect(state.output).toBe('$100 / hour ($4000/w, $800/d)\n' +
    '2 hours / day ($200/d, $1000/w)\n' +
    '2 days / week ($400/w)\n' +
    '$400\n');
});

it('detects tacos', () => {
  const entry = '2/🌮\n50🌮';
  const state = App.updateResult(entry);
  expect(state.sum).toBe(100);
  expect(state.output).toBe('$2 / 🌮\n$100\n');
});