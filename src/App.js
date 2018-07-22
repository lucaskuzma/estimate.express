import React, { Component } from 'react';
import './App.css';
import {b64EncodeUnicode} from './utils';
import {b64DecodeUnicode} from './utils';
import {pluralize} from './utils';
import {pad} from './utils';
import {isTimeWord} from './utils';

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
research 1d
css 1 week
code 1.2h

22/ dog
1 dog
2 cats
2 dog

1 day

3/🌮
2🌮

125.50 / hour

meetings 2h
server   01.5 hours

boss works 2h/day
for 200/h

he'll have 3 days of meetings

consultant does 2 days / week
1h/day
he'll work with us for 2 weeks
`
    }

    this.state = {
      value: value,
      output: '',
      totals: '',
      scrollTop: 0,
    };

    this.handleChange = this.handleChange.bind(this);
    this.copyToClipboard = this.copyToClipboard.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
  }

  componentDidMount() {
    this.updateResult(this.state.value)
  }

  componentDidUpdate() {
    this.refs.entry.scrollTop = this.state.scrollTop;
    this.refs.output.scrollTop = this.state.scrollTop;
    this.refs.total.rows = this.state.totals.split('\n').length;
  }

  handleChange(event) {
    this.updateResult(event.target.value);
  }

  handleScroll(event) {
    this.setState({
      scrollTop: event.target.scrollTop,
    })
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

    let daysPerWeek = 5;
    let hoursPerDay = 8;
    let hoursPerWeek = daysPerWeek * hoursPerDay;

    let weekTotals = new Map();
    let dayTotals = new Map();

    let rndRates = new Map();  // arbitrary per item rates
    let rndTotals = new Map(); // arbitrary totals

    let sum = 0;

    // -----------------------------------------------------------------------------------------------------------------

    let lines = text.split('\n');
    for(let i = 0; i < lines.length; i++) {
      const line = lines[i];

      let convStr = '';
      let rateStr = '';
      let amountStr = '';

      // set conversion

      let regex = /(\d+\.*\d*\s*)\s*([wdh])[a-z]*\s*\/\s*([wdh])/; // https://regexr.com/3sqbm
      let match = regex.exec(line);
      if (match) {
        const v = parseFloat(match[1]);
        const t = match[2];
        const p = match[3];
        let convSet = '';

        if (t === 'w') {
          // do nothing
        }
        if (t === 'd') {
          daysPerWeek = v;
          convSet = 'days / week';
          // update other conversions
          hoursPerWeek = daysPerWeek * hoursPerDay;
          weekly = hourly * hoursPerWeek;
          convSet += ` ($${weekly}/w)`
        }
        if (t === 'h') {
          if (p === 'd') {
            hoursPerDay = v;
            convSet = 'hours / day';
            // update other conversions
            hoursPerWeek = daysPerWeek * hoursPerDay;
            daily = hoursPerDay * hourly;
            weekly = hoursPerWeek * hourly;
            convSet += ` ($${daily}/d, $${weekly}/w)`
          }
          if (p === 'w') {
            hoursPerWeek = v;
            convSet = 'hours / week';
            // update other conversions
            weekly = hourly * hoursPerWeek;
            convSet += ` ($${weekly}/w)`
          }
        }

        convStr = convSet ? `${v} ${convSet}` : '';
      }

      // set rate

      regex = /(\d+\.*\d*\s*)\/\s*(\w+)/; // https://regexr.com/3sqep
      match = regex.exec(line);
      if(match) {
        const v = parseFloat(match[1]);
        let t = match[2];
        if(isTimeWord(t)) {
          t = t.charAt(0);

          let rateSet = '';

          if(t === 'w') {
            weekly = v;
            rateSet = 'week';

            if(hourly === 0) hourly = v / hoursPerWeek;
            if(daily === 0) daily = v / daysPerWeek;
          }
          if(t === 'd') {
            daily = v;
            rateSet = 'day';

            if(hourly === 0) hourly = v / hoursPerDay;
            if(weekly === 0) weekly = v * daysPerWeek;
          }
          if(t === 'h') {
            hourly = v;
            rateSet = 'hour';

            if(weekly === 0) weekly = v * hoursPerWeek;
            if(daily === 0) daily = v * hoursPerDay;
          }

          rateStr = rateSet ? `$${v} / ${rateSet}` : '';
        }
      }

      // set rate for an arbitrary thing

      regex = /(\d+\.*\d*\s*)\/\s*([^0-9\/\s.]+)/; // https://regexr.com/3sqem
      match = regex.exec(line);
      if(match) {
        const v = parseFloat(match[1]);
        const t = match[2];
        let rateSet = '';

        if(!isTimeWord(t))
        {
          rndRates.set(t, v);
          rateSet = t;
          rateStr = rateSet ? `$${v} / ${rateSet}` : '';
        }
      }

      // set an amount for an arbitrary thing

      regex = /(\d+\.*\d*\s*)([^0-9\/\s.]+)/; // https://regexr.com/3sqe7
      match = regex.exec(line);
      if(convStr === '' && match) {
        const v = parseFloat(match[1]);
        const t = match[2];
        let amount = 0;

        if(!isTimeWord(t))
        {
          if(rndRates.has(t)) {
            const rate = rndRates.get(t);
            const previous = rndTotals.has(t) ? rndTotals.get(t) : 0;
            rndTotals.set(t, v + previous);
            amount = v * rate;
          }
        }

        amountStr = amount > 0 ? `$${amount}` : '';
      }

      // set an amount for a task

      regex = /(\d+\.*\d*\s*)\s*(\w+)/; // https://regexr.com/3sqb7 ish
      match = regex.exec(line);
      if(convStr === '' && match) {
        const v = parseFloat(match[1]);
        let t = match[2];
        if(isTimeWord(t)) {
          t = t.charAt(0);
          let amount = 0;

          if (t === 'w') {
            weeks += v;
            amount = v * weekly;

            const previous = weekTotals.has(hoursPerWeek) ? weekTotals.get(hoursPerWeek) : 0;
            weekTotals.set(hoursPerWeek, v + previous);
          }
          if (t === 'd') {
            days += v;
            amount = v * daily;

            const previous = dayTotals.has(hoursPerDay) ? dayTotals.get(hoursPerDay) : 0;
            dayTotals.set(hoursPerDay, v + previous);
          }
          if (t === 'h') {
            hours += v;
            amount = v * hourly;
          }

          amountStr = amount > 0 ? `$${amount}` : '';

          sum += amount;
        }
      }

      // output results of parsing this line
      output +=  [amountStr, rateStr, convStr].join('') + '\n';
    }

    // -----------------------------------------------------------------------------------------------------------------

    totals += `\n\n`;

    totals += `Total time span: ${weeks} weeks`;
    totals += ` + ${days} days`;
    totals += ` + ${hours} hours\n`;

    totals += `\n`;
    totals += `Total work:\n`;
    totals += `\n`;

    // const totalHours = 40 * weeks + 8 * days + hours;

    totals += `${pad(hours.toString() + ' hours', 30)} = ${hours} hours\n`;

    let totalHours = hours;

    for (const [rate, value] of dayTotals) {
      totalHours += rate * value;
      const activity = `${value} x ${rate} hour ${pluralize('day', value)}`;
      totals += `${pad(activity, 30)} = ${rate * value} hours\n`;
    }

    for (const [rate, value] of weekTotals) {
      totalHours += rate * value;
      const activity = `${value} x ${rate} hour ${pluralize('week', value)}`;
      totals += `${pad(activity, 30)} = ${rate * value} hours\n`;
    }

    totals += `\n`;

    totals += `Total hours of work: ${totalHours}`;
    totals += `\n = days: ${totalHours/8}`;
    totals += `\n = weeks: ${totalHours/40}\n`;

    totals += `\n`;

    for (const [type, value] of rndTotals) {
      const rate = rndRates.get(type);
      const activity = `${value} x $${rate} ${pluralize(type, value)}`;
      totals += `${pad(activity, 30)} = $${rate * value}\n`;
      sum += rate * value;
    }

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
          <p>
            Define conversions like this: <strong className="mono">2 hours / day</strong> or <strong>2h/d</strong> etc.
          </p>
        </div>
        <div className="center">

          <form>
            <textarea
              ref="entry"
              className="App-entryArea App-textArea"
              rows="20"
              type="text"
              value={this.state.value}
              onScroll={this.handleScroll}
              onChange={this.handleChange}
            />
            <textarea
              ref="output"
              className="App-outputArea App-textArea"
              rows="20"
              type="text"
              value={this.state.output}
              onScroll={this.handleScroll}
              readOnly
            />
            <textarea
              ref="total"
              className="App-totalsArea App-textArea"
              rows="16"
              type="text"
              value={this.state.totals}
              readOnly />
          </form>
        </div>

        <div className="center">
          <button className="btn" onClick={this.copyToClipboard}>Copy share link</button>
        </div>

        <div className="App-colophon center">
          <p>Made with <span role="img" aria-label="love">👽</span> by <a href="http://strange.agency">The Strange Agency</a></p>
        </div>

      </div>
    );
  }
}

export default App;
