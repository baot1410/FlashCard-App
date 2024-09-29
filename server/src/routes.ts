import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";


// Require type checking of request body.
type SafeRequest = Request<ParamsDictionary, {}, Record<string, unknown>>;
type SafeResponse = Response;  // only writing, so no need to check



const fileTranscript: Map<string, unknown> = new Map<string, unknown>();

/** Handles request for /save by storing the given name and value
* @param req Express Request object with a body containing 'name' and 'value'.
* @param res Express Response object to send the response.
* @returns 400 if required arguments are missing or invalid.
*/
export const save = (req: SafeRequest, res: SafeResponse): void => {
  const name = req.body.name;
  if (name === undefined || typeof name !== 'string') {
    res.status(400).send('required argument "name" was missing');
    return;
  }

  const value = req.body.value;
  if (value === undefined) {
    res.status(400).send('required argument "value" was missing');
    return;
  }

  const replaced = fileTranscript.has(name);
  fileTranscript.set(name, value);
  res.send({replaced});  // TODO(5a): replace 
}

/**
* Handles request for /load by returning the transcript requested.
* @param req - Express Request object with a query parameter
* @param res - Express Response object to send the response.
* @returns 400 if the 'name' parameter is missing or not a string.
* @returns 404 if no value is found for the specified name.
*/
export const load = (req: SafeRequest, res: SafeResponse): void => {
  // TODO(5b): implement this function
  //  - chat() & save() functions may be useful examples for error checking!
  const name = first(req.query.name);
  if (name === undefined || typeof name !== 'string') {
    res.status(400).send('required argument "message" was missing');
    return;
  } else {

  const getName = fileTranscript.has(name);
  
  if (!getName) {
    res.status(404).send('the name "${name}" is not found in transcript');
    return;
  }

  res.send({value: fileTranscript.get(name)});

  }


}

/**
* Retrieves the list of file names from fileContent.
* @param res - Express Response object to send the response.
* @param req - Express Request object with a query parameter
*/
export const list = (_req: SafeRequest, res: SafeResponse): void => {
  const fileNames = Array.from(fileTranscript.keys());
  res.status(200).send({items: fileNames});
};

/** Used in tests to set the transcripts map back to empty. */
export const resetTranscriptsForTesting = (): void => {
  // Do not use this function except in tests!
  fileTranscript.clear();
};







let scoreTranscript: unknown[] = [];

/** Handles request for /scoreSave by storing the given userName, deckName, score
* @param req Express Request object with a body containing 'name' and 'value'.
* @param res Express Response object to send the response.
* @returns 400 if required arguments are missing or invalid.
*/
export const scoreSave = (req: SafeRequest, res: SafeResponse): void => {
  const userName = req.body.userName;
  const deckName = req.body.deckName;
  const score = req.body.score;

  if (userName === undefined || typeof userName !== 'string') {
    res.status(400).send('required argument "userName" was missing');
    return;
  }

  if (deckName === undefined || typeof deckName !== 'string') {
    res.status(400).send('required argument "deckName" was missing');
    return;
  }

  if (score === undefined || typeof score !== 'string') {
    res.status(400).send('required argument "score" was missing');
    return;
  }

  scoreTranscript.push({userName: userName, deckName: deckName, score: score})
  res.send({pushed: true});  // TODO(5a): replace 
}


/**
* Retrieves the list of scores from fileContent.
* @param res - Express Response object to send the response.
* @param req - Express Request object with a query parameter
*/
export const scoreList = (_req: SafeRequest, res: SafeResponse): void => {
  res.status(200).send({items: scoreTranscript});
};


/** Used in tests to set the transcripts map back to empty. */
export const resetScoreTranscripts = (): void => {
  // Do not use this function except in tests!
  scoreTranscript = [];
};




// Helper to return the (first) value of the parameter if any was given.
// (This is mildly annoying because the client can also give mutiple values,
// in which case, express puts them into an array.)
const first = (param: unknown): string|undefined => {
  if (Array.isArray(param)) {
    return first(param[0]);
  } else if (typeof param === 'string') {
    return param;
  } else {
    return undefined;
  }
};
