import express, { Express } from "express";
import { list, load, save, scoreList, scoreSave } from './routes';
import bodyParser from 'body-parser';


// Configure and start the HTTP server.
const port: number = 8088;
const app: Express = express();
app.use(bodyParser.json());
//app.get("/api/dummy", dummy);  // TODO: REMOVE
app.post("/api/save", save); 
app.get("/api/load", load); 
app.get("/api/list", list); 
app.post("/api/scoreSave", scoreSave);  
app.get("/api/scoreList", scoreList); 
app.listen(port, () => console.log(`Server listening on ${port}`));
