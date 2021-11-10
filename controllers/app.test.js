const app = require('../app.js')
 
// import {defaultHandler, sellHandler} from '../app.js';

describe('Test Handlers', function () {

    test('responds to /', () => {
        const req = {  };

        const res = { text: '',
            send: function(input) { this.text = input } 
        };
        app.defaultHandler(req, res);
        
        expect(res.text).toEqual('hello world!');
    });

    test('has Number', () => {

        expect(app.hasNumber("xyz")).toBe(false);;
        
    });

    test('sort by date', () => {

        expect(app.sortByDate(["01-22-2000","10-22-2000"])).toBe(["01-22-2000","10-22-2000"]);;
        
    });

    test('responds to /logout', () => {

        const req = {  };

        const res = { text: '',
            send: function(input) { this.text = input } 
        };
        app.logoutHandler(req, res);
        
        expect(res.text).toEqual('hello world!');
    });
});








// describe('app', () => {
//     let res
  
//     beforeEach(() => {
//       res = {
//         redirect: jest.fn(),
//       }
//     })
  
//     test('should call res.redirect', async () => {
//       await app({}, res)
//       expect(res.redirect.mock.calls.length).toEqual(1)
//     })
//   })


// test('string with a single number should result in the number itself', () => {
//     console.log("got here");
//     //expect(app.sortByDate.toBe(1);
// });

  