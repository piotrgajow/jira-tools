
const { StoryPoints } = require('./story-point-mapper');

describe('StoryPoints', () => {

    describe('fromNumber', () => {

        [
            { number: 1, size: '1' },
            { number: 2, size: 'XXS' },
            { number: 3, size: 'XS' },
            { number: 4, size: undefined },
            { number: 5, size: 'S' },
            { number: 8, size: 'M' },
            { number: 13, size: 'L' },
            { number: 21, size: 'XL' },
            { number: 34, size: 'XXL' },
            { number: 50, size: undefined },
        ].forEach(({ number, size }) => {

            test('should return proper size from its numeric value', () => {
                expect(StoryPoints.fromNumber(number)).toEqual(size);
            })

        })

    });

});
