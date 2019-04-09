/* globals describe, it*/

const Filter = require('../lib/ansi_to_html.js');
const expect = require('chai').expect;

function test(text, result, done, opts) {
    if (!opts) {
        opts = {};
    }

    var f = new Filter(opts);

    function filtered(memo, t) {
        return memo + f.toHtml(t);
    }

    text = typeof text.reduce === 'function' ? text : [text];
    expect(text.reduce(filtered, '')).to.equal(result);

    return done();
}

describe('ansi to html', function () {
    describe('constructed with no options', function () {
        it('doesn\'t modify the input string', function (done) {
            const text = 'some text';
            const result = 'some text';

            return test(text, result, done);
        });

        it('returns plain text when given plain text', function (done) {
            const text = 'test\ntest\n';
            const result = 'test\ntest\n';

            return test(text, result, done);
        });

        it('renders foreground colors', function (done) {
            const text = 'colors: \x1b[30mblack\x1b[37mwhite';
            const result = 'colors: <span style="color:#000">black<span style="color:#AAA">white</span></span>';

            return test(text, result, done);
        });

        it('renders light foreground colors', function (done) {
            const text = 'colors: \x1b[90mblack\x1b[97mwhite';
            const result = 'colors: <span style="color:#555">black<span style="color:#FFF">white</span></span>';

            return test(text, result, done);
        });

        it('renders background colors', function (done) {
            const text = 'colors: \x1b[40mblack\x1b[47mwhite';
            const result = 'colors: <span style="background-color:#000">black<span style="background-color:#AAA">white</span></span>';

            return test(text, result, done);
        });

        it('renders light background colors', function (done) {
            const text = 'colors: \x1b[100mblack\x1b[107mwhite';
            const result = 'colors: <span style="background-color:#555">black<span style="background-color:#FFF">white</span></span>';

            return test(text, result, done);
        });

        it('renders strikethrough', function (done) {
            const text = 'strike: \x1b[9mthat';
            const result = 'strike: <strike>that</strike>';

            return test(text, result, done);
        });

        it('renders blink', function (done) {
            const text = 'blink: \x1b[5mwhat';
            const result = 'blink: <blink>what</blink>';

            return test(text, result, done);
        });

        it('renders underline', function (done) {
            const text = 'underline: \x1b[4mstuff';
            const result = 'underline: <span style="text-decoration:underline">stuff</span>';

            return test(text, result, done);
        });

        it('renders bold', function (done) {
            const text = 'bold: \x1b[1mstuff';
            const result = 'bold: <span style="font-weight:bold">stuff</span>';

            return test(text, result, done);
        });

        it('renders italic', function (done) {
            const text = 'italic: \x1b[3mstuff';
            const result = 'italic: <span style="font-style:italic">stuff</span>';

            return test(text, result, done);
        });

        it('handles resets', function (done) {
            const text = '\x1b[1mthis is bold\x1b[0m, but this isn\'t';
            const result = '<span style="font-weight:bold">this is bold</span>, but this isn\'t';

            return test(text, result, done);
        });

        it('handles multiple resets', function (done) {
            const text = 'normal, \x1b[1mbold, \x1b[4munderline, \x1b[31mred\x1b[0m, normal';
            const result = 'normal, <span style="font-weight:bold">bold, <span style="text-decoration:underline">underline, <span style="color:' + '#A00">red</span></span></span>, normal';

            return test(text, result, done);
        });

        it('handles resets with implicit 0', function (done) {
            const text = '\x1b[1mthis is bold\x1b[m, but this isn\'t';
            const result = '<span style="font-weight:bold">this is bold</span>, but this isn\'t';

            return test(text, result, done);
        });

        it('renders multi-attribute sequences', function (done) {
            const text = 'normal, \x1b[1;4;31mbold, underline, and red\x1b[0m, normal';
            const result = 'normal, <span style="font-weight:bold"><span style="text-decoration:underline"><span style="color:#A00">bold, underline,' + ' and red</span></span></span>, normal';

            return test(text, result, done);
        });

        it('renders multi-attribute sequences with a semi-colon', function (done) {
            const text = 'normal, \x1b[1;4;31;mbold, underline, and red\x1b[0m, normal';
            const result = 'normal, <span style="font-weight:bold"><span style="text-decoration:underline"><span style="color:#A00">bold, underline, and red</span></span></span>, normal';

            return test(text, result, done);
        });

        it('eats malformed sequences', function (done) {
            const text = '\x1b[25oops forgot the \'m\'';
            const result = 'oops forgot the \'m\'';

            return test(text, result, done);
        });

        it('renders xterm 256 sequences', function (done) {
            const text = '\x1b[38;5;196mhello';
            const result = '<span style="color:#ff0000">hello</span>';

            return test(text, result, done);
        });

        it('renders foreground rgb sequences', function (done) {
            const text = '\x1b[38;2;210;60;114mhello';
            const result = '<span style="color:#d23c72">hello</span>';

            return test(text, result, done);
        });

        it('renders background rgb sequences', function (done) {
            const text = '\x1b[48;2;155;42;45mhello';
            const result = '<span style="background-color:#9b2a2d">hello</span>';

            return test(text, result, done);
        });

        it('handles resetting to default foreground color', function (done) {
            const text = '\x1b[30mblack\x1b[39mdefault';
            const result = '<span style="color:#000">black<span style="color:#FFF">default</span></span>';

            return test(text, result, done);
        });

        it('handles resetting to default background color', function (done) {
            const text = '\x1b[100mblack\x1b[49mdefault';
            const result = '<span style="background-color:#555">black<span style="background-color:#000">default</span></span>';

            return test(text, result, done);
        });

        it('is able to disable underline', function (done) {
            const text = 'underline: \x1b[4mstuff\x1b[24mthings';
            const result = 'underline: <span style="text-decoration:underline">stuff<span style="text-decoration:none">things</span></span>';

            return test(text, result, done);
        });

        it('renders two escape sequences in sequence', function (done) {
            const text = 'months remaining\x1b[1;31mtimes\x1b[m\x1b[1;32mmultiplied by\x1b[m $10';
            const result = 'months remaining<span style="font-weight:bold"><span style="color:#A00">times</span></span><span style="font-weight:bold"><span style="color:#0A0">multiplied by</span></span> $10';

            return test(text, result, done);
        });

        it('drops EL code with no parameter', function (done) {
            const text = '\x1b[Khello';
            const result = 'hello';

            return test(text, result, done);
        });

        it('drops EL code with 0 parameter', function (done) {
            const text = '\x1b[0Khello';
            const result = 'hello';

            return test(text, result, done);
        });

        it('drops EL code with 0 parameter after new line character', function (done) {
            const text = 'HELLO\n\x1b[0K\u001b[33;1mWORLD\u001b[0m\n';
            const result = 'HELLO\n<span style="color:#A50"><span style="font-weight:bold">WORLD</span></span>\n';

            return test(text, result, done);
        });

        it('drops EL code with 1 parameter', function (done) {
            const text = '\x1b[1Khello';
            const result = 'hello';

            return test(text, result, done);
        });

        it('drops EL code with 2 parameter', function (done) {
            const text = '\x1b[2Khello';
            const result = 'hello';

            return test(text, result, done);
        });

        it('drops ED code with 0 parameter', function (done) {
            const text = '\x1b[Jhello';
            const result = 'hello';

            return test(text, result, done);
        });

        it('drops ED code with 1 parameter', function (done) {
            const text = '\x1b[1Jhello';
            const result = 'hello';

            return test(text, result, done);
        });

        it('drops HVP code with 0 parameter', function (done) {
            const text = '\x1b[;fhello';
            const result = 'hello';

            return test(text, result, done);
        });

        it('drops HVP code with 1 parameter', function (done) {
            const text = '\x1b[123;fhello';
            const result = 'hello';

            return test(text, result, done);
        });

        it('drops HVP code with 2 parameter', function (done) {
            const text = '\x1b[123;456fhello';
            const result = 'hello';

            return test(text, result, done);
        });

        it('drops setusg0 sequence', function (done) {
            const text = '\x1b[(Bhello';
            const result = 'hello';

            return test(text, result, done);
        });

        it('renders un-italic code appropriately', function (done) {
            const text = '\x1b[3mHello\x1b[23m World';
            const result = '<span style="font-style:italic">Hello<span style="font-style:normal"> World</span></span>';

            return test(text, result, done);
        });

        it('renders overline on', function (done) {
            const text = '\x1b[53mHello World';
            const result = '<span style="text-decoration:overline">Hello World</span>';

            return test(text, result, done);
        });

        it('renders overline off', function (done) {
            const text = '\x1b[53mHello \x1b[55mWorld';
            const result = '<span style="text-decoration:overline">Hello <span style="text-decoration:none">World</span></span>';

            return test(text, result, done);
        });

        it('renders normal text', function (done) {
            const text = '\x1b[22mnormal text';
            const result = '<span style="font-weight:normal;text-decoration:none;font-style:normal">normal text</span>';

            return test(text, result, done);
        });
    });

    describe('with escapeXML option enabled', function () {
        it('escapes XML entities', function (done) {
            const text = 'normal, \x1b[1;4;31;mbold, <underline>, and red\x1b[0m, normal';
            const result = 'normal, <span style="font-weight:bold"><span style="text-decoration:underline"><span style="color:#A00">bold, &lt;underline&gt;, and red</span></span></span>, normal';

            return test(text, result, done, {escapeXML: true});
        });
    });

    describe('with newline option enabled', function () {
        it('renders line breaks', function (done) {
            const text = 'test\ntest\n';
            const result = 'test<br/>test<br/>';

            return test(text, result, done, {newline: true});
        });

        it('renders multiple line breaks', function (done) {
            const text = 'test\n\ntest\n';
            const result = 'test<br/><br/>test<br/>';

            return test(text, result, done, {newline: true});
        });
    });

    describe('with stream option enabled', function () {
        it('persists styles between toHtml() invocations', function (done) {
            const text = ['\x1b[31mred', 'also red'];
            const result = '<span style="color:#A00">red</span><span style="color:#A00">also red</span>';

            return test(text, result, done, {stream: true});
        });

        it('persists styles between more than two toHtml() invocations', function (done) {
            const text = ['\x1b[31mred', 'also red', 'and red'];
            const result = '<span style="color:#A00">red</span><span style="color:#A00">also red</span><span style="color:#A00">and red</span>';

            return test(text, result, done, {stream: true});
        });

        it('does not persist styles beyond their usefulness', function (done) {
            const text = ['\x1b[31mred', 'also red', '\x1b[30mblack', 'and black'];
            const result = '<span style="color:#A00">red</span><span style="color:#A00">also red</span><span style="color:#A00"><span style="color:#000">black</span></span><span style="color:#000">and black</span>';

            return test(text, result, done, {stream: true});
        });

        it('removes one state when encountering a reset', function (done) {
            const text = ['\x1b[1mthis is bold\x1b[0m, but this isn\'t', ' nor is this'];
            const result = '<span style="font-weight:bold">this is bold</span>, but this isn\'t nor is this';

            return test(text, result, done, {stream: true});
        });

        it('removes multiple state when encountering a reset', function (done) {
            const text = ['\x1b[1mthis \x1b[9mis bold\x1b[0m, but this isn\'t', ' nor is this'];
            const result = '<span style="font-weight:bold">this <strike>is bold</strike></span>, but this isn\'t nor is this';

            return test(text, result, done, {stream: true});
        });
    });

    describe('with custom colors enabled', function () {
        it('renders basic colors', function (done) {
            const text = ['\x1b[31mblue', 'not blue'];
            const result = '<span style="color:#00A">blue</span>not blue';

            return test(text, result, done, {colors: {1: '#00A'}});
        });

        it('renders basic colors with streaming', function (done) {
            const text = ['\x1b[31mblue', 'also blue'];
            const result = '<span style="color:#00A">blue</span><span style="color:#00A">also blue</span>';

            return test(text, result, done, {stream: true, colors: {1: '#00A'}});
        });

        it('renders custom colors and default colors', function (done) {
            const text = ['\x1b[31mblue', 'not blue', '\x1b[94mlight blue', 'not colored'];
            const result = '<span style="color:#00A">blue</span>not blue<span style="color:#55F">light blue</span>not colored';

            return test(text, result, done, {colors: {1: '#00A'}});
        });

        it('renders custom colors and default colors together', function (done) {
            const text = ['\x1b[31mblue', 'not blue', '\x1b[94mlight blue', 'not colored'];
            const result = '<span style="color:#00A">blue</span>not blue<span style="color:#55F">light blue</span>not colored';

            return test(text, result, done, {colors: {1: '#00A'}});
        });

        it('renders custom 8/ 16 colors', function (done) {
            // code - 90 + 8 = color
            // so 94 - 90 + 8 = 12
            const text = ['\x1b[94mlighter blue'];
            const result = '<span style="color:#33F">lighter blue</span>';

            return test(text, result, done, {colors: {12: '#33F'}});
        });

        it('renders custom 256 colors', function (done) {
            // code - 90 + 8 = color
            // so 94 - 90 + 8 = 12
            const text = ['\x1b[38;5;125mdark red', 'then \x1b[38;5;126msome other color'];
            const result = '<span style="color:#af005f">dark red</span>then <span style="color:#af225f">some other color</span>';

            return test(text, result, done, {colors: {126: '#af225f'}});
        });
    });
});
