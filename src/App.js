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
write css 1w`,
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
      const line = lines[i] + '.';
      
      var n = '';
      var v = 0;
      var slashMode = false;
      var prevChar = '';

      var rateSet = '';

      for (var c = 0; c < line.length; c++) {
        var char = line.charAt(c);

        n += char;
        if(!isNaN(n)) {
          v = parseInt(n, 10);
        } else {
          n = ''
        }

        if(char ==='/') {
          slashMode = true;
        }

        if(slashMode) {
          if(char === ' ') {
            slashMode = false;
          } else {

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

          }
        }

        var amount = 0;
        if(v > 0 && n === '' && !slashMode) {
          if(prevChar === 'w') {
              weeks += v;
              amount = v * weekly;
            }            
            if(prevChar === 'd') {
              days += v;
              amount = v * daily;
            }
            if(prevChar === 'h') {
              hours += v;
              amount = v * hourly;
            }
        }

        prevChar = char;


      }

      sum += amount;

      const pad = ' '.repeat(30 - c);
      const rates = `[ ${weekly}, ${daily}, ${hourly} ]`;

      const amountStr = amount > 0 ? `$${amount}` : '';
      const rateStr = rateSet ? `rate: $${v} per ${rateSet}` : '';

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
