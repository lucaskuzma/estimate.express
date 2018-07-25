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
      value = `Estimate Express is

- a quick project cost calculator 
- like a spreadsheet, but fun.

Try the links above to see some examples.
`
    }

    this.state = {
      value: value,
      output: '',
      totals: [],
      scrollTop: 0,
      rows: value.split(/\r\n|\r|\n/).length,
    };

    this.handleChange = this.handleChange.bind(this);
    this.copyToClipboard = this.copyToClipboard.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
  }

  componentDidMount() {
    this.updateResult(this.state.value);
  }

  componentDidUpdate() {
    this.refs.entry.scrollTop = this.state.scrollTop;
    this.refs.output.scrollTop = this.state.scrollTop;
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

    let isiOSDevice = navigator.userAgent.match(/ipad|iphone/i);

    if (isiOSDevice) {
      let editable = textArea.contentEditable;
      let readOnly = textArea.readOnly;

      textArea.contentEditable = true;
      textArea.readOnly = false;

      let range = document.createRange();
      range.selectNodeContents(textArea);

      let selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      textArea.setSelectionRange(0, 999999);
      textArea.contentEditable = editable;
      textArea.readOnly = readOnly;
    } else {
      textArea.select();
    }

    document.execCommand('copy');
    textArea.remove();
  }

  updateResult(text) {
    let output = '';
    let totals = [];

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
          convSet += ` ($${weekly}/w)`;
        }
        if (t === 'h') {
          if (p === 'd') {
            hoursPerDay = v;
            convSet = 'hours / day';
            // update other conversions
            hoursPerWeek = daysPerWeek * hoursPerDay;
            daily = hoursPerDay * hourly;
            weekly = hoursPerWeek * hourly;
            convSet += ` ($${daily}/d, $${weekly}/w)`;
          }
          if (p === 'w') {
            hoursPerWeek = v;
            convSet = 'hours / week';
            // update other conversions
            weekly = hourly * hoursPerWeek;
            convSet += ` ($${weekly}/w)`;
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
          let convSet = [];

          if(t === 'w') {
            weekly = v;
            rateSet = 'week';

            if(hourly === 0) {
              hourly = v / hoursPerWeek;
              convSet.push(`$${hourly}/h`);
            }
            if(daily === 0) {
              daily = v / daysPerWeek;
              convSet.push(`$${daily}/d`);
            }
          }
          if(t === 'd') {
            daily = v;
            rateSet = 'day';

            if(hourly === 0) {
              hourly = v / hoursPerDay;
              convSet.push(`$${hourly}/h`);
            }
            if(weekly === 0) {
              weekly = v * daysPerWeek;
              convSet.push(`$${weekly}/w`);
            }
          }
          if(t === 'h') {
            hourly = v;
            rateSet = 'hour';

            if(weekly === 0) {
              weekly = v * hoursPerWeek;
              convSet.push(`$${weekly}/w`);
            }
            if(daily === 0) {
              daily = v * hoursPerDay;
              convSet.push(`$${daily}/d`);
            }
          }

          let convStr = '';
          if(convSet.length > 0) {
            convStr = `(${convSet.join(', ')})`;
          }

          rateStr = rateSet ? `$${v} / ${rateSet} ${convStr}` : '';
        }
      }

      // set rate for an arbitrary thing

      regex = /(\d+\.*\d*\s*)\/\s*([^0-9/\s.]+)/; // https://regexr.com/3sqem
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

      regex = /(\d+\.*\d*\s*)([^0-9/\s.]+)/; // https://regexr.com/3sqe7
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

    const padding = 24;

    totals.push(`Total time: ${weeks} weeks`);
    totals.push(` + ${days} days`);
    totals.push(` + ${hours} hours\n`);

    totals.push(`\n`);
    totals.push(`Total work:\n`);
    totals.push(`\n`);

    totals.push(`${pad(hours.toString() + ' hours', padding)} = ${hours} hours\n`);

    let totalHours = hours;

    for (const [rate, value] of dayTotals) {
      totalHours += rate * value;
      const activity = `${value} x ${rate} hour ${pluralize('day', value)}`;
      totals.push(`${pad(activity, padding)} = ${rate * value} hours\n`);
    }

    for (const [rate, value] of weekTotals) {
      totalHours += rate * value;
      const activity = `${value} x ${rate} hour ${pluralize('week', value)}`;
      totals.push(`${pad(activity, padding)} = ${rate * value} hours\n`);
    }

    totals.push(`${pad('', padding)} ----------- \n`);

    totals.push(`${pad('', padding)} ${totalHours} hours\n`);
    totals.push(`${pad('', padding)} = days: ${totalHours/8}\n`);
    totals.push(`${pad('', padding)} = weeks: ${totalHours/40}\n`);

    totals.push(`\n`);

    for (const [type, value] of rndTotals) {
      const rate = rndRates.get(type);
      const activity = `${value} x $${rate} ${pluralize(type, value)}`;
      totals.push(`${pad(activity, padding)} = $${rate * value}\n`);
      sum += rate * value;
    }

    totals.push(`\n`);

    totals.push(`Total cash money: $${sum}\n`);

    this.setState(
      {
        value: text,
        output: output,
        totals: totals,
        rows: text.split(/\r\n|\r|\n/).length,
      }
    );
  }

  render() {
    return (
      <div className="App">

        <div className="App-instructions">
          <p>
            Estimate Express
          </p>
          <p>
            examples:
            <a href="?e=RGVmaW5lIHJhdGVzIGxpa2UgdGhpczogNzUvaApPciB0aGlzOiA3NSAvIGhvdXIKCk5vdyB5b3UgY2FuIGxpc3QgdGFza3MgbGlrZToKClR3aWRkbGUgYml0cyAyaApDb25maWd1cmUgSlMgdG9vbGluZyA0IHdlZWtzCldyaXRlIFJlYWN0IGFwcCAyIGhvdXJzCk5vb2RsZSB3aXRoIE5vZGUgMWQKCllvdSBjYW4gY2hhbmdlIHRoZSByYXRlIGFib3ZlIHRvIHF1aWNrbHkgc2VlIGl0cyBpbXBhY3Qgb24gY29zdC4KCg==">[rates]</a>
            <a href="?e=U3RhcnQgd2l0aCAxMDAvaAoKV29yayBmb3IgMSB3awoKT3RoZXIgcmF0ZXMgYXJlIGF1dG9tYXRpY2FsbHkgYXNzdW1lZCwKYnV0IHlvdSBjYW4gZGVmaW5lIHRoZW06CgpNeSBkYXkgcmF0ZSBpcyA1MDAvZAphbmQgSSB0YWtlIDIwMDAvdwoKVGhpcyBwcm9qZWN0IHdpbGwgdGFrZSAyIHdlZWtzCnBsdXMgMWQgZXh0cmEKYW5kIHRoZXJlJ3MgdGhhdCAxIGhvdXIgbWVldGluZwoKTm90ZSB0aGF0IGFmdGVyIHNldHRpbmcgc3BlY2lmaWMgZGFpbHkgYW5kIHdlZWtseSByYXRlcywgeW91ciBob3VybHkgd2lsbCBubyBsb25nZXIgYWZmZWN0IHRoZW0uCgp0YXNrIDEgd2Vlawo1MC9oCnRhc2sgMSB3ZWVrCgo=">[defaults]</a>
            <a href="?e=V2UgYXNzdW1lIGEgZGF5IGhhcyA4IGhvdXJzLAphbmQgYSB3ZWVrIGhhcyA1IGRheXMsCmJ1dCB5b3UgY2FuIGNoYW5nZSB0aGlzLgoKVGhlIGJvc3MgbWFrZXMgMzAwL2hyCgpCdXQgdGhlIGJvc3Mgb25seSB3b3JrcyAzIGhvdXJzIC8gZGF5CkFuZCBvbmx5IDIgZGF5cyAvIHdlZWsKClNoZSBib3NzZXMgZm9yIDIgd2Vla3MKYnV0IGFsc28gaGFzIGEgMyBob3VyIG1lZXRpbmcK">[conversions]</a>
            <a href="?e=WW91IGNhbiBkZWZpbmUgYXJiaXRyYXJ5IGl0ZW1zOgoKRG9ncyBjb3N0IDMvZG9nCkNhdHMgYXJlIG9ubHkgMS9jYXQKCldlJ3JlIGdvaW5nIHRvIG5lZWQ6CjQgZG9nCmFuZCAxIGNhdAoKTm90ZSB0aGF0IDIgZG9ncyBkb2Vzbid0IHdvcmsuCgpMdW5jaCBpcyAyL/CfjK4KYW5kIHdlIHdpbGwgZWF0IDUw8J+MrgoK">[items]</a>
            <a href="?e=RXhwZW5zZXMgY2FuIHNpbXBseSBiZSBsaXN0ZWQ6CgpNZWdhQ3VydGlzQmlnIGxpY2Vuc2UgOS45OQpDb21pY1NhbnMgZmFtaWx5IHBhY2sgNjY2Cgo=">[expenses]</a>
          </p>
        </div>

        <div className="center">
          <form>
            <textarea
              ref="entry"
              className="App-entryArea App-textArea"
              rows={this.state.rows}
              type="text"
              value={this.state.value}
              onScroll={this.handleScroll}
              onChange={this.handleChange}
            />
            <textarea
              ref="output"
              className="App-outputArea App-textArea"
              rows={this.state.rows}
              type="text"
              value={this.state.output}
              onScroll={this.handleScroll}
              readOnly
            />
          </form>
        </div>

        <div ref="total" className="App-totalsArea">
          {this.state.totals}
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
