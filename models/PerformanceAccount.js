const mongoose = require("mongoose");

const PerformanceSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    },
    {timestamps: true}
);

module.exports = mongoose.model('topperformance', PerformanceSchema);

