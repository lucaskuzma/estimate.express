import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: `500/d

research 5h
update computer 1 week

2300/wk
100/h

install react 2d
set up repo 1hr
meetings 2h
pick framework 4w
write css 1w

junior 10/h
add semicolons 4 hours`,
      output: [],
    };

    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.updateResult(this.state.value)
  }

  handleChange(event) {
    this.updateResult(event.target.value);
  }

  updateResult(text) {
    let output = [];

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

      let regex = /(\d+\s*)\/\s*([wdh])/; // https://regexr.com/3spp4
      let match = regex.exec(line);
      if(match) {
        // output.push(`${match[0]} ${match[1]} ${match[2]}\n`)

        const v = parseInt(match[1], 10);
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

        rateStr = rateSet ? `rate: $${v} per ${rateSet}` : '';
      }

      // set an amount for a task

      regex = /(\d+\s*)\s*([wdh])/; // https://regexr.com/3spq5
      match = regex.exec(line);
      if(match) {
        // output.push(`${match[0]} ${match[1]} ${match[2]}\n`)

        const v = parseInt(match[1], 10);
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

      const pad = ' '.repeat(30 - line.length);

      output.push(`${line}${pad}${amountStr}${rateStr}\n`);

    }

    const hr = '-'.repeat(80);
    output.push(`\n${hr}\n\n`);

    output.push(`total time: ${weeks} weeks`);
    output.push(` + ${days} days`);
    output.push(` + ${hours} hours\n`);

    output.push(`\n${hr}\n\n`);

    const totalHours = 40 * weeks + 8 * days + hours;
    output.push(`total weeks: ${totalHours/40}`);
    output.push(` = total days: ${totalHours/8}`);
    output.push(` = total hours: ${totalHours}\n`);

    output.push(`\n${hr}\n\n`);

    output.push(`total cash money: $${sum}\n`);

    this.setState(
      {
        value: text,
        output: output,
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
            <textarea className="App-entryArea" rows="20" type="text" value={this.state.value} onChange={this.handleChange} />
          </form>
        </div>

        <code className="App-codeArea">
          {this.state.output}
        </code>

      </div>
    );
  }
}

export default App;
