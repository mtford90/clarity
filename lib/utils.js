/**
 * Created by mtford on 31/01/2014.
 */


exports.mergeOptions = function(defaultOpts, options){
    var mergedOptions = {};
    var attributeName;
    for (attributeName in defaultOpts) {
        //noinspection JSUnfilteredForInLoop
        mergedOptions[attributeName] = defaultOpts[attributeName];
    }
    for (attributeName in options) {
        //noinspection JSUnfilteredForInLoop
        mergedOptions[attributeName] = options[attributeName];
    }
    return mergedOptions;
}
