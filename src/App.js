import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: `500/d
2300/wk
100/h

install react 2d
set up repo 1hr
meetings 2h
pick framework 4w
write css 1w

junior 1/h
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
    var output = [];

    var weekly = 0;
    var daily = 0;
    var hourly = 0;

    var weeks = 0;
    var days = 0;
    var hours = 0;

    var sum = 0;

    var lines = text.split('\n');
    for(var i = 0; i < lines.length; i++) {
      const line = lines[i];

      var rateStr = '';
      var amountStr = '';


      var regex = /(\d+\s*)\/\s*(w|d|h)/; // https://regexr.com/3spp4
      var match = regex.exec(line);
      if(match) {
        // output.push(`${match[0]} ${match[1]} ${match[2]}\n`)

        const v = parseInt(match[1]);
        const char = match[2];
        var rateSet = '';

        if(char === 'w') {
          weekly = v;
          rateSet = 'week';
        }            
        if(char === 'd') {
          daily = v;
          rateSet = 'day';
        }
        if(char === 'h') {
          hourly = v;
          rateSet = 'hour';
        }

        rateStr = rateSet ? `rate: $${v} per ${rateSet}` : '';
      }

      regex = /(\d+\s*)\s*(w|d|h)/; // https://regexr.com/3spq5
      match = regex.exec(line);
      if(match) {
        // output.push(`${match[0]} ${match[1]} ${match[2]}\n`)

        const v = parseInt(match[1]);
        const char = match[2];
        var amount = 0;

        if(char === 'w') {
          weeks += v;
          amount = v * weekly;
        }            
        if(char === 'd') {
          days += v;
          amount = v * daily;
        }
        if(char === 'h') {
          hours += v;
          amount = v * hourly;
        }

        amountStr = amount > 0 ? `$${amount}` : '';

        sum += amount;
      }

      const pad = ' '.repeat(30 - line.length);

      output.push(`${i} ${line}${pad}${amountStr}${rateStr}\n`);

    }

    const hr = '-'.repeat(80);
    output.push(`\n${hr}\n\n`);

    output.push(`${weeks} weeks\n`)
    output.push(`${days} days\n`)
    output.push(`${hours} hours\n`)

    output.push(`\n$${sum}\n`)

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
        <form>
          <textarea className="App-entryArea" rows="20" type="text" value={this.state.value} onChange={this.handleChange} />
      </form>

        <code className="App-codeArea">
          {this.state.output}
        </code>

      </div>
    );
  }
}

export default App;
