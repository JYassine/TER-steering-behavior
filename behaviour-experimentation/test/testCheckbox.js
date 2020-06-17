const { Builder, By, Key, until } = require('selenium-webdriver');
const {Utilities} = require("../Utilities.js")

(async function checkBoxTest() {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        // Navigate to Url
        await driver.get('http://127.0.0.1:5500/behaviour-experimentation/seekBehaviour/');
        // Store 'Gmail' anchor web element
        let babylonCanvas = driver.findElement(By.id("renderCanvas"));
        // Capture offset positions of element
        let offset = await babylonCanvas.getRect();
        let buttonChangeParametersX = 750
        let buttonChangeParametersY = 547
        const actions = driver.actions({ async: true });
        await actions.move({ x: buttonStartX, y: buttonStartY }).press().perform()

        
        buttonChangeParametersX = 650
        buttonChangeParametersY = 547
        const actions = driver.actions({ async: true });
        await actions.move({ x: buttonStartX, y: buttonStartY }).press().perform()


        
        buttonChangeParametersX = 550
        buttonChangeParametersY = 547
        const actions = driver.actions({ async: true });
        await actions.move({ x: buttonStartX, y: buttonStartY }).press().perform()


    }
    finally {
        var jsonParameters = JSON.parse(Utilities.readTextFile("./jsonFileTest/changeCheckBox.json"));
        if(jsonParameters.checkBoxMaxSpeed.isChecked===true && jsonParameters.checkBoxMaxForce.isChecked===true && jsonParameters.checkBoxVelocity.isChecked===true){
              console.log("CheckBox checked successfully");
             await driver.quit();
        }else{
            throw "Error on checkbox";
        }
    }
})();