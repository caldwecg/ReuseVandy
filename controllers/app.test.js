const app = require('../app.js')
const expressRequestMock = require('express-request-mock');
const authController = require("../app");
const session = require('express-session');


describe('Test Handlers', function () {
        test ('Testing default route', async () => {
        
            // these are the data that I need for my middleware to work
        // you could have different data
        const decorators = { 
            session: { 
                email: "carter.g.caldwell@vanderbilt.edu",
            }

            //    body: {
            //        title: 'test',
            //        description: 'testing',
            //        image: 'https://res.cloudinary.com/dqhw3ma9u/image/upload/v1615827298/my-shop/before_after_analogy_rtkuec_vg8y7d.png',
            //        price: 10,
            //        stock: 1,
            //    }
        };

        const { res } = await expressRequestMock(authController.defaultHandler, decorators);
        expect(res.statusCode).toBe(200); // I tried different inputs and it works with 
                                        // every codes, the message is not available though
    
        });
        test ('Testing logout route', async () => {
        
            // these are the data that I need for my middleware to work
        // you could have different data
        const decorators = { 
            session: { 
                email: "carter.g.caldwell@vanderbilt.edu",
                // destroy = jest.fn()
            }

            //    body: {
            //        title: 'test',
            //        description: 'testing',
            //        image: 'https://res.cloudinary.com/dqhw3ma9u/image/upload/v1615827298/my-shop/before_after_analogy_rtkuec_vg8y7d.png',
            //        price: 10,
            //        stock: 1,
            //    }
        };

        const { res } = await expressRequestMock(authController.logoutHandler, decorators);
        expect(res.statusCode).toBe(200); // I tried different inputs and it works with 
                                        // every codes, the message is not available though
    
        });

        test ('Testing verify post method', async () => {
        
            // these are the data that I need for my middleware to work
        // you could have different data
        const decorators = { 
            session: { 
                email: "carter.g.caldwell@vanderbilt.edu"
            },
            body: {
                code: "abcd"

            }
        };

        const { res } = await expressRequestMock(authController.verifyPost, decorators);
        expect(res.statusCode).toBe(200); // I tried different inputs and it works with 
                                        // every codes, the message is not available though
    
        });


    test('has Number', () => {

        expect(app.hasNumber("xyz")).toBe(false);;
        
    });


    test ('Testing sell post method', async () => {
        
        // these are the data that I need for my middleware to work
    // you could have different data
    const decorators = { 
        session: { 
            email: "carter.g.caldwell@vanderbilt.edu",
        },

           body: {
            title: "title",
            desc: "description",
            price: "price",
            phone: "phone"
           }
    };

    const { res } = await expressRequestMock(authController.sellPost, decorators);
    expect(res.statusCode).toBe(200); // I tried different inputs and it works with 
                                    // every codes, the message is not available though
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

  