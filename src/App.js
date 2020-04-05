import React from 'react';
import logo from './favicon.png'
import './App.scss';
import {Component} from 'react';

import data from './processed_data/data.json';
const parse = require('html-react-parser');

const LABEL2IDX = {
  "Item": 1,
  "State": 2,
  "Activity": 3,
  "Location": 4,
  "Time": 5,
  "Attribute": 6,
  "Cardinality": 7,
  "Agent": 8,
  "Consumable": 9,
  "Observation": 10,
  "Event": 11,
  "Unsure": 12
}

class TaggedSentence extends Component {
  constructor(props) {
    super(props);
  }

  renderSentence() {
    var html = ""
    var tokens = this.props.tokens;
    var mentions = this.props.mentions;
    var in_entity = false;

    //for(var i = 0; i < tokens.length; i++) {

    var html_tokens = []
    for(var t in tokens) {
      html_tokens.push(tokens[t])
    }


    for(var m in mentions) {
        var start = mentions[m].start
        var end   = mentions[m].end - 1


        html_tokens[start] = '\<span class="label '
        for(var l in mentions[m].labels) {
          var label = mentions[m].labels[l]
          var label_idx = LABEL2IDX[label]
          html_tokens[start] += "label-" + label_idx + " "   
          
        } 
       
        html_tokens[start] += '">' 

        


        html_tokens[start] += '\<span class="label-text">' + tokens[start]


        

        html_tokens[end] += "</span>"
        for(var l in mentions[m].labels) {
          var label = mentions[m].labels[l]
          html_tokens[end] += '\<span class="label-name">' + label + '</span>' 
        }  

        html_tokens[end] += "</span>"      
    }
    console.log(html_tokens)
    html = html_tokens.join(" ")

    return parse(html)
  }

  render() {
    var unsure = false;
    // Check if 'unsure' label present
    for(var m in this.props.mentions) {
      for(var l in this.props.mentions[m].labels) {
        if(this.props.mentions[m].labels[l] == "Unsure") {
          unsure = true;
          break;
        }
      }
    }
    return (
      <div class={"tagged-sentence" + (unsure ? " unsure" : "")}>
        <div class="author">{this.props.annotator}</div>
        {this.renderSentence()}
      </div>      
    )
  }
}

class AnnotationsTableRow extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <tr>
        <td>{this.props.rowIndex + 1}</td>
        <td>
          { Object.keys(this.props.sentence.annotations).map((annotator, i) => 
            <TaggedSentence 
              annotator={annotator}
              tokens={this.props.sentence.tokens}
              mentions={this.props.sentence.annotations[annotator]}
            />
          )}         
        </td>
        <td>{Number(this.props.annotatorAgreement).toFixed(2)}</td>
      </tr>
    )
    
  }
}
class AnnotationsTable extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    return (
    <table>
      <thead>
        <tr>
          <th>Index</th>
          <th>Document</th>
          <th>Agreement</th>
        </tr>
      </thead>
      <tbody>
        { this.props.data.map((sentence, i) => 
          <AnnotationsTableRow 
            rowIndex={sentence.doc_idx}
            sentence={sentence}
            annotatorAgreement={sentence.agreement}
          />
        ) }
      </tbody>
    </table>
    )

  }
}

// class AnnotatorSelection extends Component {
//   constructor(props) {
//     super(props);
//   }

//   render() {
//     return (
//       <div id="annotator-select">
//         <div class="inner">
//           <label>Annotator</label>
//           <select onChange={this.props.changeAnnotator()}>
//             { this.props.annotatorOptions.map((annotator, i) => <option value={annotator}>{annotator}</option>) }
//           </select>
//         </div>
//       </div>
//     )
//   }
// }

class MainWindow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      unsureOnly: false
    }
  }

  changeAnnotator(event) {
    var annotator = event.target.value
    this.setState({
      annotator: annotator
    })
  }

  updateUnsureOnly() {


    this.setState({
      unsureOnly: !this.state.unsureOnly
    })
  }

  render() {

    var documentCountText = <div class="document-count-text center">Showing all { this.props.data.length } annotated documents.</div>
    var data = this.props.data
    if(this.state.unsureOnly) {
      data = this.props.data.filter( row => row['hasUnsureLabel'])
      documentCountText = <div class="document-count-text center">Showing { data.length } documents containing an "Unsure" label.</div>
      
    }



    return (
      <main>
        <div id="controls">
          <div class="inner">
            <div class={"control left" + (this.state.unsureOnly ? " checked" : "")} onClick={ this.updateUnsureOnly.bind(this)}>
              <div class="fake-checkbox"/>
              <span class="text">Unsure only</span>
            </div>
            { documentCountText }
         
          </div>
        </div>
        <AnnotationsTable data = {data} />
      </main>
    )
  }
}
// <AnnotatorSelection changeAnnotator={() => this.changeAnnotator.bind(this)} annotatorOptions = {this.state.annotatorOptions}/>


function App() {
  return (
    <div className="App">
      <header>
        <div class="title">
          <img src={logo} class="logo"></img>
          Redcoat Annotations Visualiser
        </div>
      </header>      
      <MainWindow data={data}/>      
    </div>
  );
}

export default App;
