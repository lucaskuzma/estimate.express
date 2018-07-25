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
  expect(state.hours).toBe(0);
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
  expect(state.hours).toBe(41);
  expect(state.output).toBe('$1 / week ($0.025/h, $0.2/d)\n$1\n$0.025\n');
});

it('detects weekly rate and interval and defaults hours and adds sum', () => {
  const entry = '1/w\n1w\n1h';
  const state = App.updateResult(entry);
  expect(state.sum).toBe(1.025);
  expect(state.hours).toBe(41);
});

it('detects expenses', () => {
  const entry = 'lunch 5.3\ndinner 3';
  const state = App.updateResult(entry);
  expect(state.sum).toBe(8.3);
  expect(state.hours).toBe(0);
  expect(state.output).toBe('$5.3\n$3\n');
});

it('detects default change', () => {
  const entry = '100/h\n' +
    '1000/w\n' +
    '1w\n' +
    '1h';
  const state = App.updateResult(entry);
  expect(state.sum).toBe(1100);
  expect(state.hours).toBe(41);
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
  expect(state.hours).toBe(4);
  expect(state.output).toBe('$100 / hour ($4000/w, $800/d)\n' +
    '2 hours / day ($200/d, $1000/w)\n' +
    '2 days / week ($400/w)\n' +
    '$400\n');
});

it('detects tacos', () => {
  const entry = '2/🌮\n50🌮';
  const state = App.updateResult(entry);
  expect(state.sum).toBe(100);
  expect(state.hours).toBe(0);
  expect(state.output).toBe('$2 / 🌮\n$100\n');
});

it('deals with tweaks to defaults', () => {
  const entry = '100 / hour\n' +
    '1 h\n' +
    '1 w\n' +
    '200 / h\n' +
    '1 week\n' +
    '4000 / wk\n' +
    '1 d\n' +
    '500 / d\n' +
    '1 d\n' +
    '300 / h\n' +
    '1 w\n' +
    '1 d';
  const state = App.updateResult(entry);
  expect(state.sum).toBe(17900);
  expect(state.hours).toBe(145);
  expect(state.output).toBe('$100 / hour ($4000/w, $800/d)\n' +
    '$100\n' +
    '$4000\n' +
    '$200 / hour ($8000/w, $1600/d)\n' +
    '$8000\n' +
    '$4000 / week ($800/d)\n' +
    '$800\n' +
    '$500 / day \n' +
    '$500\n' +
    '$300 / hour \n' +
    '$4000\n' +
    '$500\n');
});

it('does not choke on leading h', () => {
  const entry = '20/h\n' +
    '30/hotdog\n' +
    '1 hotdog';
  const state = App.updateResult(entry);
  expect(state.sum).toBe(30);
  expect(state.hours).toBe(0);
  expect(state.output).toBe('$20 / hour ($800/w, $160/d)\n' +
    '$30 / hotdog\n' +
    '$30\n');
});

it('handles all abbreviations', () => {
  const entry = '20/h\n' +
    '1h\n' +
    '1 h\n' +
    '1 hour\n' +
    '1 hr\n' +
    '1d\n' +
    '1 d\n' +
    '1 day\n' +
    '2 days\n' +
    '1w\n' +
    '1 w\n' +
    '1 wk\n' +
    '1 week';
  const state = App.updateResult(entry);
  expect(state.sum).toBe(4080);
  expect(state.hours).toBe(204);
  expect(state.output).toBe('$20 / hour ($800/w, $160/d)\n' +
    '$20\n' +
    '$20\n' +
    '$20\n' +
    '$20\n' +
    '$160\n' +
    '$160\n' +
    '$160\n' +
    '$320\n' +
    '$800\n' +
    '$800\n' +
    '$800\n' +
    '$800\n');
});

it('handles decimals', () => {
  const entry = '22.5/h\n' +
    '2.5h\n' +
    '0.1d';
  const state = App.updateResult(entry);
  expect(state.sum).toBe(74.25);
  expect(state.hours).toBe(3.3);
  expect(state.output).toBe('$22.5 / hour ($900/w, $180/d)\n' +
    '$56.25\n' +
    '$18\n');
});