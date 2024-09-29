import React, { Component} from "react";
import {FlashcardList} from './FlashcardList';
import { FlashcardCreate } from "./FlashcardCreate";
import { FlashcardQuiz } from "./FlashcardQuiz";
import './style.css';


// TODO: When you're ready to get started, you can remove all the example 
//   code below and start with this blank application:
type Page = { kind: "list" } | { kind: "create" } | { kind: "quiz", name: string };

type FlashcardAppState = { 
  page: Page
};

export type Props = {
  onBack: () => void;
}

/** Displays the UI of the Flashcard application. */
export class FlashcardApp extends Component<{}, FlashcardAppState> {

  constructor(props: {}) {
    super(props);

    this.state = {page: {kind: 'list'}};
  }


  render = (): JSX.Element => {
    // Renders our start page
    if (this.state.page.kind === 'list') {
      return <FlashcardList onCreateClick = {this.doCreateClick} 
                            onLoadDeckClick={this.doLoadDeckClick}/>;
    } 

    else if (this.state.page.kind === 'create') {
      return <FlashcardCreate onBackClick = {this.doBackClick}/>;
    } 

    else {
      return <FlashcardQuiz name = {this.state.page.name} onBackClick = {this.doBackClick}/>
    }

  };

  // Function to render our create page
  doCreateClick = (): void => {
    this.setState({page: {kind: 'create'}})
  }

  // Function to render the list page
  doBackClick = (): void => {
    this.setState({page: {kind: "list"}})
  }

  // Function to load our deck.
  doLoadDeckClick = (name: string): void => {
    this.setState({page: {kind: "quiz", name: name}})
  }
    

}