import React, {Component} from 'react';
import './style.css';
import { isRecord } from './record';


type Scores = {userName: string, deckName: string, score: number};

type ListProps = {
    onCreateClick: () => void, 
    onLoadDeckClick: (name: string) => void
}

type ListState = {
    decks: string[];
    scores: Scores[];
}

export class FlashcardList extends Component<ListProps, ListState> {

    constructor(props: ListProps) {
      super(props);
      this.state = { decks: [], scores: []};
    }

    componentDidMount = (): void => {
        this.doRefreshTimeout();
        this.doRefreshTimeoutScoreClick();
    };


    render = (): JSX.Element => {
        const listDecks: JSX.Element[] = [];
        if (this.state.decks.length !== 0) {
            for (const deckName of this.state.decks) {
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

    }

    // Function to render the create page
    doCreateClick = (): void => {
        this.props.onCreateClick();
    }

    // Function to load the deck
    doLoadDeckClick = (name: string): void => {
        this.props.onLoadDeckClick(name);
    }

    // Error msg for both our lists
    doError = (msg: string): void => {
        console.error(`Error fetching /api/list: ${msg}`);
    };
    
    doError2Click = (msg: string): void => {
        console.error(`Error fetching /api/scoreList: ${msg}`);
    };


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


    // Response request from /api/scorelist
    doRefreshTimeoutScoreClick = (): void => {
        fetch("/api/scoreList")
            .then(this.doScoreListDecksResp)
            .catch(() => this.doError("Failed to connect to server"));
    };
    
    doScoreListDecksResp = (res: Response): void => {
        if (res.status === 200) {
        res.json().then(this.doScoreListDecksJson)
            .catch(() => this.doError2Click("200 response is not valid JSON"));
        } else if (res.status === 400) {
        res.text().then(this.doError2Click)
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
            } else if (typeof item.score !== 'string') {
                console.error("score is missing or invalid", item.score);
                return undefined;
            } else {
                items.push({userName: item.userName, deckName: item.deckName, score: Number(item.score)});
            }
        }
        return items;
    };


  






}

