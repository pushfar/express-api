# RELEASE

## 1.1.2

Add auto switch from 404 to 200 on browser options reuqets that 404 (as browsers must have a 200 back or CORS error hides the 404)

## 1.1.1

Created new CryptoTools and deprecated Crypto.
Created new DataTools, FileTools, Eval

## 1.1.0

Added support for zod schemas to automatically generate OpenAPI schemas and support mcp services.
Upgraded application to expose controller class to client.
Exposed method and path to both request and response.
Fixed bug with application not passing generic response to middleware, response is converted after all middleware has run.

## 1.0.4

Add correct return type for mysql so generics can be used to infer return types.
Allow service names to be changed, so multiple conenctions can be used with same service classes

## 1.0.3

Add correct return type for mysql so generics can be used to infer return types.
Allow service names to be changed, so multiple conenctions can be used with same service classes

## 1.0.2

Fixed types for Models.

## 1.0.1

README changes.

## 1.0.0

Init release.