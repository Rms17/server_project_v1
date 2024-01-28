const robot = require('robotjs');

exports.press_key=function(){
    robot.keyToggle('shift','down')
    robot.keyTap('r')
    robot.setKeyboardDelay(1000)
    robot.keyToggle('shift','up')
}
