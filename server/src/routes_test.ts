import * as assert from 'assert';
import * as httpMocks from 'node-mocks-http';
import { save, load, list, resetTranscriptsForTesting, scoreSave, scoreList, resetScoreTranscripts } from './routes';


describe('routes', function() {

  // TODO: remove the tests for the dummy route

  // it('dummy', function() {
  //   const req1 = httpMocks.createRequest(
  //       {method: 'GET', url: '/api/dummy', query: {name: 'Bob'} });
  //   const res1 = httpMocks.createResponse();
  //   dummy(req1, res1);
  //   assert.strictEqual(res1._getStatusCode(), 200);
  //   assert.deepStrictEqual(res1._getData(), {msg: "Hi, Bob!"});
  // });

  it('save', function() {
    // First branch, straight line code, error case (only one possible input)
    const req1 = httpMocks.createRequest(
        {method: 'POST', url: '/save', body: {value: "some stuff"}});
    const res1 = httpMocks.createResponse();
    save(req1, res1);

    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(res1._getData(),
        'required argument "name" was missing');

    const req10 = httpMocks.createRequest(
        {method: 'POST', url: '/save', body: {value: 1n}});
    const res10 = httpMocks.createResponse();
    save(req10, res10);

    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(res1._getData(),
        'required argument "name" was missing');

    const req11 = httpMocks.createRequest(
        {method: 'POST', url: '/save', body: {value: 2}});
    const res11 = httpMocks.createResponse();
    save(req11, res11);

    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(res1._getData(),
        'required argument "name" was missing');

    // Second branch, straight line code, error case (only one possible input)
    const req2 = httpMocks.createRequest(
        {method: 'POST', url: '/save', body: {name: "A"}});
    const res2 = httpMocks.createResponse();
    save(req2, res2);

    assert.strictEqual(res2._getStatusCode(), 400);
    assert.deepStrictEqual(res2._getData(),
        'required argument "value" was missing');

    // Third branch, straight line code
    const req3 = httpMocks.createRequest({method: 'POST', url: '/save',
        body: {name: "A", value: "some stuff"}});
    const res3 = httpMocks.createResponse();
    save(req3, res3);

    assert.strictEqual(res3._getStatusCode(), 200);
    assert.deepStrictEqual(res3._getData(), {replaced: false});

    const req4 = httpMocks.createRequest({method: 'POST', url: '/save',
        body: {name: "A", value: "different stuff"}});
    const res4 = httpMocks.createResponse();
    save(req4, res4);

    assert.strictEqual(res4._getStatusCode(), 200);
    assert.deepStrictEqual(res4._getData(), {replaced: true});

    // Called to clear all saved transcripts created in this test
    //    to not effect future tests
    resetTranscriptsForTesting();
  });

  it('load', function() {
    // TODO (5c): write tests for load
    //  - note that you will need to make requests to 'save' in order for there
    //    to be transcripts for load to retrieve (see example below)
    // - You should write tests using our usual branching heuristics (including
    //   all error case branches)


    // Tests the undefined case and returns 404 where name arg is not given.
    const loadReq5 = httpMocks.createRequest(
        {method: 'GET', url: '/load', query: {name: undefined}});
    const loadRes5 = httpMocks.createResponse();
    load(loadReq5, loadRes5);

    assert.strictEqual(loadRes5._getStatusCode(), 400);
    assert.strictEqual(loadRes5._getData(), 'required argument "message" was missing');

    // Tests that 404 error is returned when the name is not of the type string. Ex, bigint and number.
    const loadReq7 = httpMocks.createRequest(
        {method: 'GET', url: '/load', query: {name: 1}});
    const loadRes7 = httpMocks.createResponse();
    load(loadReq7, loadRes7);

    assert.strictEqual(loadRes7._getStatusCode(), 400);
    assert.strictEqual(loadRes7._getData(), 'required argument "message" was missing');

    const loadReq8 = httpMocks.createRequest(
        {method: 'GET', url: '/load', query: {name: 1}});
    const loadRes8 = httpMocks.createResponse();
    load(loadReq8, loadRes8);

    assert.strictEqual(loadRes8._getStatusCode(), 400);
    assert.strictEqual(loadRes8._getData(), 'required argument "message" was missing');
    

    // Tests to see if 404 error is returned when the name is not saved in the transcirpt.
    const loadReq3 = httpMocks.createRequest(
        {method: 'GET', url: '/load', query: {name: "demon1"}});
    const loadRes3 = httpMocks.createResponse();
    load(loadReq3, loadRes3);

    assert.strictEqual(loadRes3._getStatusCode(), 404);
    assert.strictEqual(loadRes3._getData(), 'the name "${name}" is not found in transcript');

    const loadReq4 = httpMocks.createRequest(
        {method: 'GET', url: '/load', query: {name: "demon3"}});
    const loadRes4 = httpMocks.createResponse();
    load(loadReq4, loadRes4);

    assert.strictEqual(loadRes4._getStatusCode(), 404);
    assert.strictEqual(loadRes4._getData(), 'the name "${name}" is not found in transcript');


    // Tests to see if a value is returned when a name is in transcript.
    const saveReq2 = httpMocks.createRequest({method: 'POST', url: '/save',
    body: {name: "key2", value: "value transcript"}});
    const saveResp2 = httpMocks.createResponse();
    save(saveReq2, saveResp2);
    
    const loadReq2 = httpMocks.createRequest(
        {method: 'GET', url: '/load', query: {name: "key2"}});
    const loadRes2 = httpMocks.createResponse();
    load(loadReq2, loadRes2);
   
    assert.strictEqual(loadRes2._getStatusCode(), 200);
    assert.deepStrictEqual(loadRes2._getData(), {value: "value transcript"});
  
    // Tests to see if a value is returned when a name is in transcript.
    const saveReq = httpMocks.createRequest({method: 'POST', url: '/save',
        body: {name: "key", value: "transcript value"}});
    const saveResp = httpMocks.createResponse();
    save(saveReq, saveResp);
    // Now we can actually (mock a) request to load the transcript
    const loadReq = httpMocks.createRequest(
        {method: 'GET', url: '/load', query: {name: "key"}});
    const loadRes = httpMocks.createResponse();
    load(loadReq, loadRes);
    // Validate that both the status code and the output is as expected
    assert.strictEqual(loadRes._getStatusCode(), 200);
    assert.deepStrictEqual(loadRes._getData(), {value: "transcript value"});


    // Called to clear all saved transcripts created in this test
    //    to not effect future tests
    resetTranscriptsForTesting();
  });




  it('list', function() {

    // For an empty case
    const req10 = httpMocks.createRequest(
        {method: 'GET', url: '/api/list', query: []}); 
    const res10 = httpMocks.createResponse();
    list(req10, res10);
    assert.strictEqual(res10._getStatusCode(), 200);
    assert.deepEqual(res10._getData(), {items: []});

    // For 1 element.
    const saveReq = httpMocks.createRequest({method: 'POST', url: '/api/save', body: { name: "key", value: "transcript value" }});
    const saveRes = httpMocks.createResponse();
    save(saveReq, saveRes);

    const listReq = httpMocks.createRequest({method: 'GET', url: '/api/list'})
    const listRes = httpMocks.createResponse();
    list(listReq, listRes);

    assert.strictEqual(listRes._getStatusCode(), 200);
    assert.deepEqual(listRes._getData(), {items: ["key"]});

    
    // For 2 elements.
    const saveReq1 = httpMocks.createRequest({method: 'POST', url: '/api/save', body: { name: "key", value: "transcript value" }});
    const saveRes1 = httpMocks.createResponse();
    save(saveReq1, saveRes1);

    const saveReq2 = httpMocks.createRequest({method: 'POST', url: '/api/save', body: { name: "key2", value: "transcript value2" }});
    const saveRes2 = httpMocks.createResponse();
    save(saveReq2, saveRes2);

    const listReq1 = httpMocks.createRequest({method: 'GET', url: '/api/list'})
    const listRes1 = httpMocks.createResponse();
    list(listReq1, listRes1);

    assert.strictEqual(listRes1._getStatusCode(), 200);
    assert.deepEqual(listRes1._getData(), {items: ['key', 'key2']});

    // Called to clear all saved transcripts created in this test
    //    to not effect future tests
    resetTranscriptsForTesting();
  });








  it('scoreSave', function() {
    
        // First branch, straight line code, error case (only one possible input)
        const req1 = httpMocks.createRequest(
            {method: 'POST', url: '/scoreSave', body: {deckName: "some stuff", score: "1"}});
        const res1 = httpMocks.createResponse();
        scoreSave(req1, res1);
    
        assert.strictEqual(res1._getStatusCode(), 400);
        assert.deepStrictEqual(res1._getData(),
            'required argument "userName" was missing');
    
        const req10 = httpMocks.createRequest(
            {method: 'POST', url: '/scoreSave', body: {userName: 1n, deckName: "some stuff2", score: "2"}});
        const res10 = httpMocks.createResponse();
        scoreSave(req10, res10);
    
        assert.strictEqual(res10._getStatusCode(), 400);
        assert.deepStrictEqual(res10._getData(),
            'required argument "userName" was missing');

        // Third branch, straight line code
        const req11 = httpMocks.createRequest(
            {method: 'POST', url: '/scoreSave', body: {deckName: "some stuff", userName: "1"}});
        const res11 = httpMocks.createResponse();
        scoreSave(req11, res11);
    
        assert.strictEqual(res11._getStatusCode(), 400);
        assert.deepStrictEqual(res11._getData(),
            'required argument "score" was missing');
    
    
        const req2 = httpMocks.createRequest(
            {method: 'POST', url: '/scoreSave', body: {deckName: "some stuff", userName: "1", score: 1n}});
        const res2 = httpMocks.createResponse();
        scoreSave(req2, res2);
    
        assert.strictEqual(res2._getStatusCode(), 400);
        assert.deepStrictEqual(res2._getData(),
            'required argument "score" was missing');


        // 2nd branch, straight line code
        const req13 = httpMocks.createRequest(
            {method: 'POST', url: '/scoreSave', body: {userName: "1", score: "1"}});
        const res13 = httpMocks.createResponse();
        scoreSave(req13, res13);
    
        assert.strictEqual(res13._getStatusCode(), 400);
        assert.deepStrictEqual(res13._getData(),
            'required argument "deckName" was missing');
    
    
        const req30 = httpMocks.createRequest(
            {method: 'POST', url: '/scoreSave', body: {deckName: 1n, userName: "1", score: 1n}});
        const res30 = httpMocks.createResponse();
        scoreSave(req30, res30);
    
        assert.strictEqual(res30._getStatusCode(), 400);
        assert.deepStrictEqual(res30._getData(),
            'required argument "deckName" was missing');
    
        // Third branch, straight line code
    
        const req4 = httpMocks.createRequest({method: 'POST', url: '/scoreSave',
            body: {userName: "A", deckName: "different stuff", score: '3'}});
        const res4 = httpMocks.createResponse();
        scoreSave(req4, res4);
    
        assert.strictEqual(res4._getStatusCode(), 200);
        assert.deepStrictEqual(res4._getData(), {pushed: true});
    
        // Called to clear all saved transcripts created in this test
        //    to not effect future tests
        resetScoreTranscripts();
  });




  it('scoreList', function() {
    // For an empty case
    const req10 = httpMocks.createRequest(
        {method: 'GET', url: '/api/scoreList', query: []}); 
    const res10 = httpMocks.createResponse();
    scoreList(req10, res10);

    assert.strictEqual(res10._getStatusCode(), 200);
    assert.deepEqual(res10._getData(), {items: []});

    resetScoreTranscripts();

    // For 1 element.
    const saveReq = httpMocks.createRequest({method: 'POST', url: '/api/scoreSave', body: { userName: "key", deckName: "transcript value", score: "0" }});
    const saveRes = httpMocks.createResponse();
    scoreSave(saveReq, saveRes);

    const listReq = httpMocks.createRequest({method: 'GET', url: '/api/scoreList'})
    const listRes = httpMocks.createResponse();
    scoreList(listReq, listRes);

    assert.strictEqual(listRes._getStatusCode(), 200);
    assert.deepEqual(listRes._getData(), {items: [{ userName: "key", deckName: "transcript value", score: "0" }]});

    resetScoreTranscripts();

    const saveReq1 = httpMocks.createRequest({method: 'POST', url: '/api/scoreSave', body: { userName: "key2", deckName: "transcript value2", score: "2" }});
    const saveRes1 = httpMocks.createResponse();
    scoreSave(saveReq1, saveRes1);

    const saveReq2 = httpMocks.createRequest({method: 'POST', url: '/api/scoreSave', body: { userName: "key4", deckName: "transcript value4", score: "4" }});
    const saveRes2 = httpMocks.createResponse();
    scoreSave(saveReq2, saveRes2);

    const listReq1 = httpMocks.createRequest({method: 'GET', url: '/api/scoreList'})
    const listRes1 = httpMocks.createResponse();
    scoreList(listReq1, listRes1);

    assert.strictEqual(listRes1._getStatusCode(), 200);
    assert.deepEqual(listRes1._getData(), {items: [{ userName: "key2", deckName: "transcript value2", score: "2" }, { userName: "key4", deckName: "transcript value4", score: "4" }]});

    
    resetScoreTranscripts();

  });




});
