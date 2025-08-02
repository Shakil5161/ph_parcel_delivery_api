import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seedSuperAdmin";

let server: Server;

const startServer = async () => {
    try {
        await mongoose.connect(envVars.DB_URL)
        
        server = app.listen(envVars.PORT, () =>{
            console.log("Server is listening to port 5000");
        })
    } catch (error) {
        console.log('error', error);
    }
}

(async () => {
   await startServer()
   await seedSuperAdmin()
})()


// SIGTERM come from the hosting provider
process.on("SIGTERM", (err) => {
    console.log("SIGTERM Signal received... Server Shutting down", err);
    if(server){
        server.close(() => {
            process.exit(1);
        })
    }
    process.exit(1)

})

// basically unhandledRejection is called when we forgot to use try catch in any promise.
process.on("unhandledRejection", (err) => {
    console.log("Unhandled Rejection detected... Server Shutting down", err);
    if(server){
        server.close(() => {
            process.exit(1);
        })
    }
    process.exit(1)

})


// basically uncaughtException is called when we any mistake in our local server.
process.on("uncaughtException", (err) => {
    console.log("Uncaught Exception detected... Server Shutting down", err);
    if(server){
        server.close(() => {
            process.exit(1);
        })
    }
    process.exit(1)

})