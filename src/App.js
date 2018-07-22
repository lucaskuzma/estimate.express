import React, { Component } from 'react';
import './App.css';
import {b64EncodeUnicode} from './utils';
import {b64DecodeUnicode} from './utils';

class App extends Component {
  constructor(props) {
    super(props);

    let value = '';
    const search = window.location.search;
    if(search) {
      const query = search.substr(3);
      value = b64DecodeUnicode(query);
    } else {
      value = `800/d

design 2h
css 1 week
code 1.2h

125.50 / hour

meetings 2h
server   01.5 hours

`
    }

    this.state = {
      value: value,
      output: '',
      totals: '',
    };

    this.handleChange = this.handleChange.bind(this);
    this.copyToClipboard = this.copyToClipboard.bind(this);
  }

  componentDidMount() {
    this.updateResult(this.state.value)
  }

  handleChange(event) {
    this.updateResult(event.target.value);
  }

  copyToClipboard() {
    let textArea = document.createElement('textarea');
    textArea.innerText = window.location.protocol + '//' + window.location.host +  '?e=' + b64EncodeUnicode(this.state.value);
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    textArea.remove();
  }

  updateResult(text) {
    let output = '';
    let totals = '';

    let weekly = 0;
    let daily = 0;
    let hourly = 0;

    let weeks = 0;
    let days = 0;
    let hours = 0;

    let sum = 0;

    let lines = text.split('\n');
    for(let i = 0; i < lines.length; i++) {
      const line = lines[i];

      let rateStr = '';
      let amountStr = '';

      // set rate

      let regex = /(\d+\.*\d*\s*)\/\s*([wdh])/; // https://regexr.com/3spp4
      let match = regex.exec(line);
      if(match) {
        const v = parseFloat(match[1], 10);
        const t = match[2];
        let rateSet = '';

        if(t === 'w') {
          weekly = v;
          rateSet = 'week';

          if(hourly === 0) hourly = v / 40;
          if(daily === 0) daily = v / 5;
        }
        if(t === 'd') {
          daily = v;
          rateSet = 'day';

          if(hourly === 0) hourly = v/8;
          if(weekly === 0) weekly = v * 5;
        }
        if(t === 'h') {
          hourly = v;
          rateSet = 'hour';

          if(weekly === 0) weekly = v * 40;
          if(daily === 0) daily = v * 8;
        }

        rateStr = rateSet ? `$${v} / ${rateSet}` : '';
      }

      // set an amount for a task

      regex = /(\d+\.*\d*\s*)\s*([wdh])/; // https://regexr.com/3sqb7
      match = regex.exec(line);
      if(match) {
        const v = parseFloat(match[1], 10);
        const t = match[2];
        let amount = 0;

        if(t === 'w') {
          weeks += v;
          amount = v * weekly;
        }
        if(t === 'd') {
          days += v;
          amount = v * daily;
        }
        if(t === 'h') {
          hours += v;
          amount = v * hourly;
        }

        amountStr = amount > 0 ? `$${amount}` : '';

        sum += amount;
      }

      output += `${amountStr}${rateStr}\n`;
    }

    totals += `\n\n`;

    totals += `Total time: ${weeks} weeks`;
    totals += ` + ${days} days`;
    totals += ` + ${hours} hours\n`;

    totals += `\n`;

    const totalHours = 40 * weeks + 8 * days + hours;
    totals += `Total weeks: ${totalHours/40}`;
    totals += ` = total days: ${totalHours/8}`;
    totals += ` = total hours: ${totalHours}\n`;

    totals += `\n`;

    totals += `Total cash money: $${sum}\n`;

    this.setState(
      {
        value: text,
        output: output,
        totals: totals,
      }
    );
  }

  render() {
    return (
      <div className="App">

        <div className="App-instructions">
          <p>
            Define rates like this: <strong>15 / hour</strong> or <strong>15/h</strong> etc.
          </p>
          <p>
            Then use them like this: <strong className="mono">34 hours</strong> or <strong>34h</strong> etc.
          </p>
        </div>
        <div className="center">

          <form>
            <textarea className="App-entryArea App-textArea"  rows="20" type="text" value={this.state.value} onChange={this.handleChange} />
            <textarea className="App-outputArea App-textArea" rows="20" type="text" value={this.state.output} readOnly />
            <textarea className="App-totalsArea App-textArea" rows="12" type="text" value={this.state.totals} readOnly />
          </form>
        </div>

        <div className="center">
          <button className="btn" onClick={this.copyToClipboard}>Copy share link</button>
        </div>

        <div className="App-colophon center">
          <p>Made with 👽 by <a href="http://strange.agency">The Strange Agency</a></p>
        </div>

      </div>
    );
  }
}

export default App;
