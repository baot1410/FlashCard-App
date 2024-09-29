import React, { Component, ChangeEvent, MouseEvent } from "react";
import './style.css';
import { isRecord } from './record';



type QuizProps = {
  onBackClick: () => void, 
  name: string
}

type QuizState = {
  userName: string
  msg: string
  decks: string[]
  currIndex: number;
  incorrect: number;
  correct: number;
  flip: boolean;
}


export class FlashcardQuiz extends Component<QuizProps, QuizState> {

  constructor(props: QuizProps) {
    super(props);
  
    this.state = { userName: '', msg: '', decks: [], currIndex: 0, incorrect: 0, correct: 0, flip: false};
  }

  componentDidMount = (): void => {
    this.doLoadDeckClick();
  }

  render = (): JSX.Element => {
    if (this.state.currIndex !== this.state.decks.length) {
    return (<div> 
    
        <h1>{this.props.name}</h1>
    
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

        return (
        
        <div> 

            <h1>{this.props.name}</h1>
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



  doBackClick = (): void => {
    this.props.onBackClick();
  }

  doError = (msg: string): void => {
      console.error(`Error fetching /api/scoreSave: ${msg}`);
  };
  
  renderErrorMessage = (): JSX.Element => {
      return <p className="error">{this.state.msg}</p>;
  };

  // Functions to handle correct answer and incorrect answer
  doCorrectClick = (): void => {
    this.setState({correct: this.state.correct + 1, currIndex: this.state.currIndex + 1, flip: false});
  }

  doIncorrectClick = (): void => {
    this.setState({incorrect: this.state.incorrect + 1, currIndex: this.state.currIndex + 1, flip: false});
  }

// Function to save the user Name that took the quiz
doUserNameSaveClick = (evt: ChangeEvent<HTMLInputElement>): void => {
    this.setState({userName: evt.target.value});
};

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
        body: JSON.stringify({userName: this.state.userName, deckName: this.props.name, score: String((currScore))}),
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
    return;

  }


  // Response request from /api/load
  doLoadDeckClick = () : void => {
    fetch(`/api/load?name=${this.props.name}`)
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
    if (currDeck !== undefined && Array.isArray(currDeck) && currDeck != null) {
      this.setState({decks: currDeck});
    }

  }

}

