import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: `500/d
2300/wk

install react 1d
set up repo 1h
hack css 1w`,
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

    var lines = text.split('\n');
    for(var i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      var n = '';
      var v = 0;
      var slashMode = false;

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
            }            
            if(char === 'd') {
              daily = v;
            }
            if(char === 'h') {
              hourly = v;
            }

          }
        }


      }

      const pad = ' '.repeat(30 - c);
      const rates = `[ ${weekly}, ${daily}, ${hourly} ]`;

      output.push(`${line}${pad}r:${rates}\n`);

    }

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
