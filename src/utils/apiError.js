export class ApiError extends Error{ //Extend functionality of predefined Error class in javascript
    constructor(statusCode, message="Something went wrong", errors=[], stack=""){
        super(message) //Since we are extending the predefined class we use super so we can call the constructor from the error class
        this.statusCode = statusCode
        this.data = null
        this.message=message
        this.success = false
        this.errors = errors
        if(stack){
            this.stack = stack
        }
    }
}

// To standardize error messages