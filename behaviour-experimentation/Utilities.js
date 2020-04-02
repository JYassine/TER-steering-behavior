
var Utilities = {


    getMagnitude(vector) {

        return Math.sqrt(vector.x *vector.x + vector.y * vector.y + vector.z*vector.z);
    },

    getRandom (min,max) {
        return Math.floor(Math.random() * max) + min
    }



};

export default Utilities;