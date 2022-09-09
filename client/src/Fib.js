import React, { Component } from "react";
import axios from "axios";

class Fib extends Component {
  state = {
    seenIndexes: [],
    values: [],
    index: ""
  };

  componentDidMount() { //similiar to mounted()
    this.fetchValues();
    this.fetchIndexes();
  }

  async fetchValues() {
    const values = await axios.get("/api/values/current");
    this.setState({
      values: values.data
    });
  }

  async fetchIndexes() {
    const seenIndexes = await axios.get("/api/values/all");
    this.setState({
      seenIndexes: seenIndexes.data
    });
  }

  handleSubmit = async (event) => { //this has to be a bound function we refer to this when onSubmit occurs (don't invoke it)
    event.preventDefault();
    
    axios.post("/api/values", {
      index: this.state.index
    });

    this.setState( { index: "" });
  }

  renderSeenIndexes() {
    return this.state.seenIndexes.map(({ number }) => number).join(", "); //seen indexes is an array of objects each has a property called number (this is what we want to print)
  }

  renderValues() {
    const entries = [];

    for (let key in this.state.values) { //key represent an index in the fib sequence
      entries.push(
        <div key={key}> 
          For index {key} I calculated {this.state.values[key]};
        </div>
      );
    }

    return entries;
  }

  render() { //similar to <template></template>
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>Enter an index:</label>
          <input 
            value={this.state.index}
            onChange={event => this.setState( { index: event.target.value })}
          />
          <button>Submit</button>
        </form>

        <h3>Indexes that i have seen:</h3>
        {this.renderSeenIndexes()}

        <h3>Calculated values</h3>
        {this.renderValues()}

      </div>
    );
  }
}

export default Fib;