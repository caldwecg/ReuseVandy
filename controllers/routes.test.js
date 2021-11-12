// const index = require("../app");

// const request = require("supertest");
// const express = require("express");
// const app = express();

// app.use(express.urlencoded({ extended: false }));
// app.use("/", index);

// test("index route works", done => {
//     request(app)
//       .get("/")
//       .expect("Content-Type", /json/)
//       .expect({ name: "frodo" })
//       .expect(200, done);
//   });

  
// describe('Routes', function () {

//   test('responds to /', async () => {
//     const res = await request(app).get('/');
//     expect(res.header['content-type']).toBe('text/html; charset=utf-8');
//     expect(res.statusCode).toBe(200);
//     console.log(res.body);
//   });
  
//   test('responds to /hello/:name', async () => {
//     const res = await request(app).get('/hello/jaxnode'); 
//     expect(res.header['content-type']).toBe('text/html; charset=utf-8');
//     expect(res.statusCode).toBe(200);
//     expect(res.text).toEqual('hello jaxnode!');
//   });

//   test('responds to /hello/Annie', async () => {
//     const res = await request(app).get('/hello/Annie'); 
//     expect(res.header['content-type']).toBe('text/html; charset=utf-8');
//     expect(res.statusCode).toBe(200);
//     expect(res.text).toEqual('hello Annie!');
//   });

// });