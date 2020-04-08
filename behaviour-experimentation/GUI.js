var GUI = {

    // Display the panel to change the parameters of one entities
    displayChangeParametersEntity(height, paramsGUI, entity, UiPanel) {

        paramsGUI.forEach((param) => {
            var header = new BABYLON.GUI.TextBlock();
            header.text = param.name + ":" + param.anim
            header.height = height;
            header.color = "yellow";
            header.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            header.paddingTop = "10px";

            UiPanel.addControl(header);
            var slider = new BABYLON.GUI.Slider();

            slider.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            slider.minimum = 0;
            slider.maximum = 1;
            slider.color = "green";
            slider.value = param.anim;
            slider.height = "20px";
            slider.width = "205px";
            UiPanel.addControl(slider);
            slider.onValueChangedObservable.add((v) => {
                param.anim = v * param.weight;
                var paramsName = [];
                paramsGUI.forEach(p => {
                    paramsName.push(p.name)
                })
                var paramsPursuer = {};
                for (let i = 0; i < paramsName.length; i++) {
                    let pName = paramsName[i]
                    paramsPursuer[pName] = paramsGUI[i].anim
                }
                header.text = param.name + ":" + param.anim.toFixed(2);
                for (let j = 0; j < paramsName.length; j++) {
                    entity[paramsName[j]] = paramsPursuer[paramsName[j]]
                }


            })
        })


    },

    // Display the panel to change the parameters of ALL entities
    displayChangeParametersEntities(height, paramsGUI, pursuers, UiPanel) {

        paramsGUI.forEach((param) => {
            var header = new BABYLON.GUI.TextBlock();
            header.text = param.name + ":" + param.anim
            header.height = height;
            header.color = "yellow";
            header.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            header.paddingTop = "10px";

            UiPanel.addControl(header);
            var slider = new BABYLON.GUI.Slider();

            slider.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            slider.minimum = 0;
            slider.maximum = 1;
            slider.color = "green";
            slider.value = param.anim;
            slider.height = "20px";
            slider.width = "205px";
            UiPanel.addControl(slider);
            slider.onValueChangedObservable.add((v) => {
                param.anim = v * param.weight;
                var paramsName = [];
                paramsGUI.forEach(p => {
                    paramsName.push(p.name)
                })
                var paramsPursuer = {};
                for (let i = 0; i < paramsName.length; i++) {
                    let pName = paramsName[i]
                    paramsPursuer[pName] = paramsGUI[i].anim
                }
                header.text = param.name + ":" + param.anim.toFixed(2);
                for (let i = 0; i < pursuers.length; i++) {
                    for (let j = 0; j < paramsName.length; j++) {
                        pursuers[i][paramsName[j]] = paramsPursuer[paramsName[j]]
                    }
                }

            })
        })

    },




    // Show the vectors of entities
    displayVectors(decorVectors, checkboxGUI, UiPanel, colorVectors) {
        var vectorsHeader = new BABYLON.GUI.TextBlock();
        vectorsHeader.text = "SHOW VECTORS "
        vectorsHeader.height = "70px"
        vectorsHeader.marginRight = "5px";
        vectorsHeader.fontWeight = "bold"
        vectorsHeader.color = "yellow";
        vectorsHeader.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;


        UiPanel.addControl(vectorsHeader);

        let i = 0;
        for (var vectorName in decorVectors) {

            var checkbox = new BABYLON.GUI.Checkbox();
            checkbox.width = "30px";
            checkbox.height = "30px";
            checkbox.name = vectorName
            checkbox.isChecked = false;
            checkbox.color = Object.keys(colorVectors)[i];
            checkbox.isEnabled = false;

            checkbox.onIsCheckedChangedObservable.add(function (value) {
                if (value) {
                    checkboxGUI.forEach(child => {
                        if (child.isChecked) {
                            if (decorVectors[child.name].length > 0) {
                                decorVectors[child.name].forEach(v => {

                                    v.meshVisualization.isVisible = true
                                })
                            }
                        }
                    })

                } else {
                    checkboxGUI.forEach(child => {
                        if (child.isChecked === false) {
                            if (decorVectors[child.name].length > 0) {
                                decorVectors[child.name].forEach(v => {
                                    v.meshVisualization.isVisible = false
                                })
                            }
                        }
                    })

                }
            });

            var vectorText = new BABYLON.GUI.TextBlock();
            vectorText.text = vectorName
            vectorText.height = "20px"
            vectorText.marginRight = "5px";
            vectorText.fontWeight = "bold"
            vectorText.color = Object.keys(colorVectors)[i]
            vectorText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;



            UiPanel.addControl(checkbox);
            UiPanel.addControl(vectorText);
            checkboxGUI.push(checkbox)
            i++;

        }


    },

    // create button
    createButton(nameButton, paddingTop, width, height, color, background) {

        var button = BABYLON.GUI.Button.CreateSimpleButton(nameButton, nameButton);
        button.paddingTop = paddingTop;
        button.width = width;
        button.height = height;
        button.color = color;
        button.background = background


        return button

    }

}


export default GUI;