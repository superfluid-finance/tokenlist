// Import necessary modules or libraries
import express from 'express';

// Define the controller class
class Controller {
    public path = '/';
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.get(this.path, this.index);
    }

    index = (request: express.Request, response: express.Response) => {
        response.send('Welcome to my Node.js TypeScript app!');
    }
}

// Export the controller class
export default Controller;