import React, { Component, ChangeEvent, MouseEvent } from "react";
import './style.css';
import { isRecord } from './record';



type CreateProps = {
  onBackClick: () => void, 
}

type CreateState = {
  deckName: string
  textArea: string
  msg: string
  decks: string[]
}

export class FlashcardCreate extends Component<CreateProps, CreateState> {

  constructor(props: CreateProps) {
    super(props);
  
    this.state = { deckName: '', textArea: '', msg: '', decks: []};
  }

  componentDidMount = (): void => {
    this.doRefreshTimeout();
};


  render = (): JSX.Element => {
    return (
    <div>
      <h1>Create</h1>
      
      <div>
        <label htmlFor="name">Name:</label>
        <input type="text" id="name" value={this.state.deckName} onChange={this.doNameChange}></input>
       </div>

      <div>
        <label htmlFor="textbox">Options (one per line, formatted as front|back)</label>
        <br/>
        <textarea id="textbox" rows={10} cols={40} value={this.state.textArea} onChange={this.doUpdateDeckClick}></textarea>
      </div>

      <div> 
        <button onClick={this.doAddClick}>Add</button>
        <button onClick={this.doBackClick}>Back</button>
      </div>

      <div className="error">{this.renderErrorMessage()}</div>
      
    </div>)

  }

  // Function to handle deck name change
  doNameChange = (evt: ChangeEvent<HTMLInputElement>): void => {
      this.setState({deckName: evt.target.value});
  };

  // Function to handle deck update
  doUpdateDeckClick = (evt: ChangeEvent<HTMLTextAreaElement>): void => {
      this.setState({textArea: evt.target.value});
  };

  doBackClick = (): void => {
    this.doRefreshTimeout();
    this.props.onBackClick();
  }

  doError = (msg: string): void => {
      console.error(`Error fetching /api/save: ${msg}`);
  };
  
  renderErrorMessage = (): JSX.Element => {
      return <p className="error">{this.state.msg}</p>;
  };

  // Response request from /api/save
  doAddClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
    // Error checking for missing params
    if (this.state.decks.includes(this.state.deckName)) {
      this.setState({ msg: "Error: Quiz already exists" });
      return;
    }
    
    else if (this.state.deckName.trim() === "") {
      this.setState({ msg: "Error: Name should not be empty" });
      return;
    }
  
    // FIX
    else if (this.state.textArea.length === 0) {
      this.setState({ msg: "Error: No cards" });
      return;
    } else {
    
      // checks for valid decks and format
    const makeDeck: string[] = this.state.textArea.split('\n');
      for (const val of makeDeck) {
        if (val.indexOf('|') === -1 || val.indexOf('|') === 0 || val.indexOf('|') === val.length - 1) {
          this.setState({ msg: "Invalid card, requires a question and answer in the specified format"})
          return;
        }
        if (val.slice(val.indexOf('|') + 1).indexOf("|") !== -1) {
          this.setState({ msg: "Make sure one | per question and answer"})
          return;
        }
      }

    this.setState({decks: makeDeck});
    fetch("/api/save", {
        method: "POST",
        body: JSON.stringify({ name: this.state.deckName, value: makeDeck}),
        headers: { "Content-Type": "application/json" }
      })
      .then((res) => this.doAddResp(res))
      .catch(() => this.doError("Failed to connect to the server"));

    }
  }

  doAddResp = (res: Response): void => {
    if (res.status === 200) {
      res.json().then(this.doAddJson)
              .catch(() => this.doError("Invalid Json format"));
    } else if (res.status === 400) {
      res.text()
            .then(this.doError)
            .catch(() => this.doError("400 reponse is not text"))
    } else {
      this.doError(`bad status code ${res.status}`);
    }
  }


  doAddJson = (val: unknown): void => {
    if (!isRecord(val)) {
      throw new Error("result wasn't json");
    }

    if (typeof val.replaced !== 'boolean') {
      console.error("Missing expected properties in JSON object:", val);
      return;
    }

    this.doBackClick();
    return;

  }

  // Response request from /api/list
  doRefreshTimeout = (): void => {
    fetch("/api/list")
        .then(this.doListDecksResp)
        .catch(() => this.doError("Failed to connect to server"));
  };

  doListDecksResp = (res: Response): void => {
    if (res.status === 200) {
      res.json().then(this.doListDecksJson)
        .catch(() => this.doError("200 response is not valid JSON"));
    } else if (res.status === 400) {
      res.text().then(this.doError)
        .catch(() => this.doError("400 response is not text"));
    } else {
      this.doError(`Bad status code ${res.status}`);
    }
  };


  doListDecksJson = (val: unknown): void => {
    if (!isRecord(val)) {
      console.error("Bad data from /list: not a record", val)
      return;
    }
  
    const itemsData = this.doParseClick(val.items);
    if (itemsData !== undefined) {
      this.setState({decks: itemsData})
    } else {
      console.error("Failed to parse items")
    }
    
  };


    // Parses our saved decks list
  doParseClick = (val: unknown): undefined | string[] => {
    if (!Array.isArray(val)) {
      console.error("Not an Array", val);
      return undefined;
    }

    const items: string[] = [];
    for (const item of val) {
      if (typeof item !== 'string') {
          console.error("item.name is missing or invalid", item.name);
          return undefined;
      } else {
          items.push(item);
      }
    }
      return items;
  };



  






}

