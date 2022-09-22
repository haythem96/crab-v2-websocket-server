# CRAB V2 WEBSOCKET SERVER

A WebSocket server to listen to Crab V2 auction events

## LOCAL DEVELOPMENT

- `yarn install`
- `yarn compile` && `yarn start`

### Client<->Server connection local testing:

- Run the [API locally](https://github.com/KMKoushik/squeeth-portal/tree/fix/ignore-crab-king-dev-mode) and make sure to setup the needed [env vars](https://github.com/KMKoushik/squeeth-portal/blob/fix/ignore-crab-king-dev-mode/.env.example) 
- Run the websocket server `yarn start`
- Run the websocket client `node websocket_server_test.js`
- You should be able to see past auctions and current auction in the client terminal, to create new auction and submit bids, you can use the [SDK testing script](https://github.com/opynfinance/crab-v2-sdk-python#local-development)
