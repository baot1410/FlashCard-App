import React, { Component, ChangeEvent, MouseEvent } from "react";
import { isRecord } from './record';
import './style.css';


// TODO: When you're ready to get started, you can remove all the example 
//   code below and start with this blank application:
type Page = { kind: "start" } | { kind: "create" } | { kind: "quiz", name: string };

type Scores = {userName: string, deckName: string, score: number};

type FlashcardAppState = { 
  page: Page
  deckName: string
  userName: string
  msg: string;
  decks: string[];
  correct: number;
  incorrect: number;
  items: string[];
  currIndex: number;
  flip: boolean;
  scores: Scores[];
  textArea: string;
 };

/** Displays the UI of the Flashcard application. */
export class FlashcardApp extends Component<{}, FlashcardAppState> {

  constructor(props: {}) {
    super(props);

    this.state = {page: {kind: 'start'}, deckName: "", msg: "", userName: "", 
    items: [], correct: 0, incorrect: 0, decks: [], currIndex: 0, flip: false, scores: [], textArea: ''};
  }

  // Updates and refreshes our saved lists.
  componentDidMount = (): void => {
    this.doRefreshTimeout();
    this.doRefreshTimeoutScoreClick();
  };

  
  render = (): JSX.Element => {
    // Renders our start page
    if (this.state.page.kind === 'start') {

      const listDecks: JSX.Element[] = [];
      if (this.state.items.length !== 0) {
        for (const deckName of this.state.items) {
          listDecks.push (
            <div key ={deckName}>
              <ul>
                <li>
                  <a href="#" onClick={()=> this.doLoadDeckClick(deckName)}>{deckName}</a>
                </li>
              </ul>
            </div>
          )
        }
      }

      const listScores: JSX.Element[] = [];
      if (this.state.scores.length !== 0) {
        for (const [index, score] of this.state.scores.entries()) {
          listScores.push (
            <div key={index}>
              <ul>
                <li>
                  <p>{`${score.userName}, ${score.deckName}: ${score.score}`}</p>
                </li>
              </ul>
            </div>
          )
        }
      }

      return (<div>
          <h1> Files </h1>

          <div>{listDecks}</div>

          <button onClick={this.doCreateClick}>New</button>

          <h2>Scores</h2>

          <div>{listScores}</div>
      </div>);

 
    // Renders our create page
    } else if (this.state.page.kind === 'create') {
      return (<div>
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

    // Renders our quiz page
    } else {
       if (this.state.currIndex < this.state.decks.length) {
        
        return (<div> 
        
          <h1>{this.state.deckName}</h1>
      
          <h2>Correct: {this.state.correct} | Incorrect: {this.state.incorrect}</h2>
  
          <div>
            {/* <label htmlFor="textbox"></label> */}
  
            {/* <textarea id="textbox" rows={5} cols={80} value={""} readOnly>{}</textarea> */}
            <div className="card">{this.renderCardResult()}</div>
          </div>
          
          <div>
            <button onClick={this.doFlipClick}>Flip</button> 
            <button onClick={this.doCorrectClick}>Correct</button>
            <button onClick={this.doIncorrectClick}>Incorrect</button>
          </div>
          
          
          </div>)
       } else { // Renders the end of quiz page.
        return (<div> 
        
          <h1>{this.state.deckName}</h1>
          <br/>
          <h2>Correct: {this.state.correct} | Incorrect: {this.state.incorrect}</h2>
          <br/>
          <p>End of quiz</p>

          <label htmlFor="name">Name:</label>
          <input type="text" id="name" value={this.state.userName} onChange={this.doUserNameSaveClick}></input>
          <button onClick={this.doSaveScoresClick}>Finish</button>

          </div>)
       }
    }


  };

  // Function to handle card flip
  doFlipClick = (): void => {
    this.setState({flip: !this.state.flip});
  }

  // Function to render card result
  renderCardResult = (): JSX.Element => {
    const currCard = this.state.decks[this.state.currIndex];
    const question = currCard.slice(0, currCard.indexOf('|'));
    const answer = currCard.slice(currCard.indexOf('|') + 1, currCard.length);
    if (this.state.flip === false) {
      return <p>{question}</p>
    } else {
      return <p>{answer}</p>
    }
  }

  // Function to handle deck name change
  doNameChange = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({deckName: evt.target.value});
  };

  // Function to handle deck update
  doUpdateDeckClick = (evt: ChangeEvent<HTMLTextAreaElement>): void => {
    this.setState({textArea: evt.target.value});
  };

  // Function to navigate back to start page
  doBackClick = (): void => {
    this.doRefreshTimeout();
    this.doRefreshTimeoutScoreClick();
    this.setState({ page: {kind: 'start'}, correct: 0, incorrect: 0, currIndex: 0, flip: true, msg: '', textArea: ''});
  }

 // Function to navigate to create page
  doCreateClick = (): void => {
    this.setState({ page: {kind: 'create'}, deckName: '', decks: []});
  };

  // Functions to handle correct answer and incorrect answer
  doCorrectClick = (): void => {
    this.setState({correct: this.state.correct + 1, currIndex: this.state.currIndex + 1, flip: false});
  }

  doIncorrectClick = (): void => {
    this.setState({incorrect: this.state.incorrect + 1, currIndex: this.state.currIndex + 1, flip: false});
  }

  // FUnction to render error message
  renderErrorMessage = (): JSX.Element => {
    return <p className="error">{this.state.msg}</p>;
  };

  doError = (msg: string): void => {
    console.error(`Error fetching /api/: ${msg}`);
  };

  // Function to save the user Name that took the quiz
  doUserNameSaveClick = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({userName: evt.target.value});
  };

 /*********************************************************************************************************************** */

  // Response request from /api/save
  doAddClick = (_evt: MouseEvent<HTMLButtonElement>): void => {

    // Error checking for mussing params
    if (this.state.deckName.trim() === "") {
      this.setState({ msg: "Error: Name should not be empty" });
      return;
    }
  
    if (this.state.items.includes(this.state.deckName)) {
      this.setState({ msg: "Error: Quiz already exists" });
      return;
    }
  
    // FIX
    if (this.state.textArea.length === 0) {
      this.setState({ msg: "Error: No cards" });
      return;
    }

    const makeDeck: string[] = this.state.textArea.split('\n');
    for (const val of makeDeck) {
      if (val.indexOf('|') === -1) {
        this.setState({ msg: "Invalid card, requires a question and answer"})
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
    this.setState({textArea: ''});
    return;

  }

  // Response request from /api/scoreSave
  doSaveScoresClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
    if (this.state.userName.trim() === "") {
      this.setState({ msg: "Error: Name should not be empty" });
      this.renderErrorMessage();
      return;
    }
  
    const currScore = Math.floor(100 * (this.state.correct / this.state.decks.length));
    
    fetch("/api/scoreSave", {
        method: "POST",
        body: JSON.stringify({userName: this.state.userName, deckName: this.state.deckName, score: String((currScore))}),
        headers: { "Content-Type": "application/json" }
    })
      .then((res) => this.doSaveScoresResp(res))
      .catch(() => this.doError("Failed to connect to the server"));
  }

  doSaveScoresResp = (res: Response): void => {
    if (res.status === 200) {
      res.json().then(this.doSaveScoresJson)
              .catch(() => this.doError("Invalid Json format"));
    } else if (res.status === 400) {
      res.text()
            .then(this.doError)
            .catch(() => this.doError("400 reponse is not text"))
    } else {
      this.doError(`bad status code ${res.status}`);
    }
  }

  doSaveScoresJson = (val: unknown): void => {
    if (!isRecord(val)) {
      throw new Error("result wasn't json");
    }

    if (typeof val.pushed !== 'boolean') {
      console.error("Missing expected properties in JSON object:", val);
      return;
    }

    //something
    this.doBackClick();
    this.setState({page: {kind: 'start'}, userName: ''});
    return;

  }

  /*********************************************************************************************************************** */

  // Response request from /api/load
  doLoadDeckClick = (name: string): void => {
    this.setState({deckName: name})
    fetch(`/api/load?name=${name}`)
    .then((res) => this.doLoadResp(res))
    .catch(() => this.doError("Failed to connect to the server"));
  }

  doLoadResp = (res: Response): void => {
    if (res.status === 200) {
      res.json().then(this.doLoadJson).catch(() => this.doError("200 response is not valid JSON"));
    } else if (res.status === 400) {
      res.text().then(this.doError).catch(() => this.doError("400 response is not text"));
    } else {
      this.doError(`Bad status code ${res.status}`);
    }
  }

  doLoadJson = (val: unknown): void => {
    if (!isRecord(val)) {
      console.error("Bad data: not a record", val);
      return;
    }

    const currDeck = val.value;
    if (currDeck !== undefined && Array.isArray(currDeck)) {
      this.setState({page: {kind: "quiz", name: this.state.deckName}, decks: currDeck});
    }

  }

   /*********************************************************************************************************************** */

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
        this.setState({items: itemsData})
      } else {
        console.error("Failed to parse items")
      }
      
    };


    // Response request from /api/scorelist
    doRefreshTimeoutScoreClick = (): void => {
      fetch("/api/scoreList")
          .then(this.doScoreListDecksResp)
          .catch(() => this.doError("Failed to connect to server"));
    };
    
    doScoreListDecksResp = (res: Response): void => {
      if (res.status === 200) {
        res.json().then(this.doScoreListDecksJson)
          .catch(() => this.doError("200 response is not valid JSON"));
      } else if (res.status === 400) {
        res.text().then(this.doError)
          .catch(() => this.doError("400 response is not text"));
      } else {
        this.doError(`Bad status code ${res.status}`);
      }
    };
    
    doScoreListDecksJson = (val: unknown): void => {
      if (!isRecord(val)) {
        console.error("Bad data from /scoreList: not a record", val);
        return;
      }

      const itemsData = this.doParseScoreClick(val.items);
      if (itemsData !== undefined) {
        this.setState({scores: itemsData})
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

    // Parses our saved scores list.
    doParseScoreClick = (val: unknown): undefined | Scores[] => {
      if (!Array.isArray(val)) {
        console.error("Not an Array", val);
        return undefined;
      }
    
      const items: Scores[] = [];
      for (const item of val) {
        if (!isRecord(item)) {
          console.error("item is not a record", item)
        } else if (typeof item.userName !== 'string') {
          console.error("user name is missing or invalid", item.userName);
          return undefined;
        } else if (typeof item.deckName !== 'string') {
          console.error("deck name is missing or invalid", item.deckName);
          return undefined;
        }  else if (typeof item.score !== 'string') {
          console.error("score is missing or invalid", item.score);
          return undefined;
        } else {
          items.push({userName: item.userName, deckName: item.deckName, score: Number(item.score)});
        }
      }
      return items;
    };


    













}