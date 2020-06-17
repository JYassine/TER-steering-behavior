const { Builder, By, Key, until } = require('selenium-webdriver');
const {Utilities} = require("../Utilities.js")

(async function entityTest() {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        // Navigate to Url
        await driver.get('http://127.0.0.1:5500/behaviour-experimentation/seekBehaviour/');
        // Store 'Gmail' anchor web element
        let babylonCanvas = driver.findElement(By.id("renderCanvas"));
        // Capture offset positions of element
        let offset = await babylonCanvas.getRect();
        let buttonStartX = 947
        let buttonStartY = 523
        const actions = driver.actions({ async: true });
        await actions.move({ x: buttonStartX, y: buttonStartY }).press().perform()


    }
    finally {
        var vehiclePosition = JSON.parse(Utilities.readTextFile("./jsonFileTest/createEntity.json"));
        if(vehiclePosition !== undefined){
              console.log("Success on creation of entity");
             await driver.quit();
        }else{
            throw "Error on creation of entity";
        }
    }
})();