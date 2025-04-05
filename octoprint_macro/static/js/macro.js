/*
 * View model for Sidebar Macros
 *
 * Author: Mikhail Poluboyarinov
 * License: MIT
 */
$(function () {
    function MacroViewModel(parameters) {
        var self = this;
        self.settings = parameters[0];
        self.loginState = parameters[1];
        self.connectionState = parameters[2];
		self.terminal = parameters[3]; //Hooks into the Terminal Tab
        self.isActive = function (data) {
            const dop = data.dop();
            if (dop && self.connectionState.isPrinting()) {
                return false;
            }
            return self.connectionState.isOperational() && self.loginState.isUser();
        }
        self.executeMacro = function () {
            // command matching regex
            // (Example output for inputs G0, G1, G28.1, M117 test)
            // - 1: code including optional subcode. Example: G0, G1, G28.1, M117
            // - 2: main code only. Example: G0, G1, G28, M117
            // - 3: sub code, if available. Example: undefined, undefined, .1, undefined
            // - 4: command parameters incl. leading whitespace, if any. Example: "", "", "", " test"
            var commandRe = /^(([gmt][0-9]+)(\.[0-9+])?)(\s.*)?/i;
            var commandsToSend = [];
            var commandsToProcess = this.macro().split("\n");
            for(idx in commandsToProcess){
                var command_line = commandsToProcess[idx];
                var commandMatch = command_line.match(commandRe);
                if (commandMatch !== null) {
                    command_line = commandMatch[1].toUpperCase() + (commandMatch[4] !== undefined ? commandMatch[4] : "");
                }
                commandsToSend.push(command_line);
            }
            var commandsToSend = commandsToSend.filter(function(array_val) {
                return Boolean(array_val) === true;
            });

            OctoPrint.control.sendGcode(commandsToSend);
        }
        self.getClass = function () {
            var columns = this.settings.settings.plugins.macro.column();
            return `macro-column-${columns <= 0 || columns > 5 ? 1 : columns}`;
        }
        self.getBtnClass = function (type) {
            return `btn-${typeof type === 'function' ? type() : type}`;
        }
    }
    OCTOPRINT_VIEWMODELS.push({
        construct: MacroViewModel,
        dependencies: ["settingsViewModel", "loginStateViewModel", "connectionViewModel", "terminalViewModel"],
        elements: ["#sidebar_plugin_macro"]
    });
});
