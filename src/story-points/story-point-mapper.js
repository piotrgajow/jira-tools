const _ = require('lodash');

const MAPPING = {
    1: '1',
    2: 'XXS',
    3: 'XS',
    5: 'S',
    8: 'M',
    13: 'L',
    21: 'XL',
    34: 'XXL',
};

class StoryPoints {

    static fromNumber(number) {
        return MAPPING[number];
    }

}

module.exports = { StoryPoints };

