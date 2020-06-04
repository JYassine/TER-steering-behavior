
var Utilities = {


    getMagnitude(vector) {

        return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
    },

    getRandom(min, max) {
        return Math.floor(Math.random() * max) + min
    },

    createText(dynamicTexture,size,scene) {
        var plane = new BABYLON.Mesh.CreatePlane("TextPlane", size, scene, true);
        plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", scene);
        plane.material.backFaceCulling = false;
        plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
        plane.material.diffuseTexture = dynamicTexture;
        return plane;
    },

    updateTextMesh(text,mesh,scene){
        var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 250, scene, true);
        dynamicTexture.hasAlpha = true;
        dynamicTexture.drawText(text, 0, 40, "bold 36px Arial", "red", "transparent", true);
        mesh.material.diffuseTexture = dynamicTexture;
    },

     saveData(data,fileName){
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        var json = JSON.stringify(data),
         blob = new Blob([json], {type: "octet/stream"}),
        url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    },

     readTextFile(file, callback) {
        var rawFile = new XMLHttpRequest();
        rawFile.overrideMimeType("application/json");
        rawFile.open("GET", file, true);
        rawFile.onreadystatechange = function() {
            if (rawFile.readyState === 4 && rawFile.status == "200") {
                callback(rawFile.responseText);
            }
        }
        rawFile.send(null);
    }
    
};

export default Utilities;