const { Gateway, Wallets, TxEventHandler, GatewayOptions, DefaultEventHandlerStrategies, TxEventHandlerFactory } = require('fabric-network');
const fs = require('fs');
const path = require("path")
const log4js = require('log4js');
const logger = log4js.getLogger('BasicNetwork');
const util = require('util')
const helper = require('./helper')


const invokeTransaction = async (channelName, chaincodeName, fcn, args, username, org_name, transientData) => {
    try {
        logger.debug(util.format('\n============ invoke transaction on channel %s ============\n', channelName));

        const ccp = await helper.getCCP(org_name)
        const walletPath = await helper.getWalletPath(org_name)
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        let identity = await wallet.get(username);
        if (!identity) {
            console.log(` ${username} adlı kullanıcının kaydı bulunamadı, lütfen kayıt edin.`);
            await helper.getRegisteredUser(username, org_name, true)
            identity = await wallet.get(username);
            return;
        }
        const connectOptions = {
            wallet, identity: username, discovery: { enabled: true, asLocalhost: false },
            eventHandlerOptions: {
                commitTimeout: 100,
                strategy: DefaultEventHandlerStrategies.NETWORK_SCOPE_ALLFORTX
            }
        }

        const gateway = new Gateway();
        await gateway.connect(ccp, connectOptions);
        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);

        let result
        let message;
        if (fcn === "createProduct") {
            result = await contract.submitTransaction(fcn, args, args1, args2, args3);
            message = `Successfully added the product asset with key ${args}`

        }else if (fcn === "changeProductStatus") {
            result = await contract.submitTransaction(fcn, args, args1);
            message = `Successfully changed product status with key ${args}`

        }else if (fcn === "createSensorData") {
            args4=username
            result = await contract.submitTransaction(fcn, args, args1, args2, args3, args4);
            message = `Successfully added the sensor asset with key ${args}`

        }else if (fcn === "changeSensorData") {
            result = await contract.submitTransaction(fcn, args, args1, args2, args3);
            message = `Successfully updated sensor values with key ${args}`

        }
        else {
            return `Invocation require either createProduct or changeProductStatus as function but got ${fcn}`
        }
        await gateway.disconnect();

        let response = {
            message: message
        }

        return response;


    } catch (error) {

        console.log(`Getting error: ${error}`)
        return error.message

    }
	
}

exports.invokeTransaction = invokeTransaction;