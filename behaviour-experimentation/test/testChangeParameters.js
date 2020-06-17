const { Builder, By, Key, until } = require('selenium-webdriver');
const {Utilities} = require("../Utilities.js")

(async function createEntity() {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        // Navigate to Url
        await driver.get('http://127.0.0.1:5500/behaviour-experimentation/seekBehaviour/');
        // Store 'Gmail' anchor web element
        let babylonCanvas = driver.findElement(By.id("renderCanvas"));
        // Capture offset positions of element
        let offset = await babylonCanvas.getRect();
        let buttonChangeParametersX = 200
        let buttonChangeParametersY = 547
        const actions = driver.actions({ async: true });
        await actions.move({ x: buttonStartX, y: buttonStartY }).press().perform()

        
        buttonChangeParametersX = 300
        buttonChangeParametersY = 547
        const actions = driver.actions({ async: true });
        await actions.move({ x: buttonStartX, y: buttonStartY }).press().perform()


        
        buttonChangeParametersX = 400
        buttonChangeParametersY = 547
        const actions = driver.actions({ async: true });
        await actions.move({ x: buttonStartX, y: buttonStartY }).press().perform()


    }
    finally {
        var jsonParameters = JSON.parse(Utilities.readTextFile("./jsonFileTest/changeParameters.json"));
        if(jsonParameters.maxSpeed === 10 && jsonParameters.maxForce === 11 && jsonParameters.mass ===60){
              console.log("Parameters changed successfully");
             await driver.quit();
        }else{
            throw "Error on changing parameters";
        }
    }
})();