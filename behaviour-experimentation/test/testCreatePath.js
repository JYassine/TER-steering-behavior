const { Builder, By, Key, until } = require('selenium-webdriver');
const { Utilities } = require("../Utilities.js")


var pathMap = JSON.parse(Utilities.readTextFile("./jsonFileTest/mapTest1.json"));

(async function pathTest() {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        // Navigate to Url
        await driver.get('http://127.0.0.1:5500/behaviour-experimentation/pathBehaviour/');
        // Store 'Gmail' anchor web element
        let babylonCanvas = driver.findElement(By.id("renderCanvas"));


        // Capture offset positions of element
        let offset = await babylonCanvas.getRect();
        let buttonStartX = 947
        let buttonStartY = 200
        const actions = driver.actions({ async: true });
        await actions.move({ x: buttonStartX, y: buttonStartY }).press().perform()

        for (let i = 0; i < pathMap.length; i++) {
            for (let j = 0; j < pathMap.pathPoint; j++) {
                const actions = driver.actions({ async: true });
                await actions.move({ x: pathMap[i].pathPoint[j]._x, y: pathMap[i].pathPoint[j]._z }).press().perform()
            }
        }


    }
    finally {
        var mapCreated = JSON.parse(Utilities.readTextFile("./jsonFileTest/mapCreated.json"));
        var success=true;
        if (vehiclePosition !== undefined) {

            for (let i = 0; i < pathMap.length; i++) {
                for (let j = 0; j < pathMap.pathPoint; j++) {
                    if (!(mapCreated[i].pathPoint[j]._x === pathMap[i].pathPoint[j]._x && mapCreated[i].pathPoint[j]._z === pathMap[i].pathPoint[j]._z && mapCreated[i].pathPoint[j]._y === pathMap[i].pathPoint[j]._y)) {
                        success= false;
                        break;
                    }
                }
            }

            if(success){
                console.log("Map created successfully")
                await driver.quit();
            }
        } else {
            throw "Error on creation of entity";
        }
    }
})();