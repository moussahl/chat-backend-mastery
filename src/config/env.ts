// Centralized env variables validation with joi
   
import Joi from "joi";

const envVarsSchema = Joi.object().keys({
  //serveur
  NODE_ENV: Joi.string()
    .valid("production", "development", "test")
    .required()
    .default("development"),

  PORT: Joi.number().default(3000),
  HOST: Joi.string().default("localhost"),

  //MongoDB
  MONGO_URI: Joi.string()
    .required()
    .description("URI MongoDB connexion")
    .default("chat_app"),

  //JWT
  JWT_SECRET: Joi.string()
    .required()
    .min(32)
    .description("secret key for sign the JWT"),

  JWT_EXPIRATION: Joi.string().default("7d"),

  // CORS
  CORS_ORIGIN: Joi.string().default("http://localhost:3000"),

  //Socket.IO
  SOCKET_OING_INTERVAL: Joi.number().default(25000),
  SOCKET_PING_TIMEOUT: Joi.number().default(60000),

})
 .unknown(true); // Accepter les variables supplémentaires;



 // extract and validate the env variables
 const {value: envVars, error} = envVarsSchema.prefs({errors:{
  label: 'key'}}).validate(process.env);


if(error){
  console.log(`Configuration error: ${error.message}`);
  throw new Error(`Config validation error: ${error.message}`)
}
 


module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  host: envVars.HOST,
  mongo: {
    uri: envVars.MONGO_URI,
    dbName: envVars.MONGO_DB_NAME,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    expirationTime: envVars.JWT_EXPIRATION,
  },
  cors: {
    origin: envVars.CORS_ORIGIN,
    credentials: true,
  },
  logs: {
    level: envVars.LOG_LEVEL,
  },
  socket: {
    pingInterval: envVars.SOCKET_PING_INTERVAL,
    pingTimeout: envVars.SOCKET_PING_TIMEOUT,
  },
};
 
