/**
 * @function - substitutes {placeholder} with provided mappings
 */
exports.buildStringFromMappings = (base, mappings) => base.replace(/{(\w*)}/g, (...args) => mappings[args[1]]);
