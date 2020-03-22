# NOTE: At the moment this only works on Darwin.

# Table of Contents

- [Introduction](#Introduction)
- [Installation](#Installation-Visual-Studio-Code)
- [Configurations](#configurations)
  - [Launch Configuration Settings](#launch-configuration-settings)
  - [Attach Configuration Settings](#attach-configuration-settings)
  - [Example configurations](#example-configurations)
    - [Launching](#launching)
    - [Attach to process using process ID](#attach-using-pid)
    - [Attach to process by name](#attach-by-name)
    - [Loading a core file](#loading-a-core-file)

# Introduction

The `lldb-vscode` extension packages the command line tool of the same name that
implements the [Visual Studio Code Debug
API](https://code.visualstudio.com/docs/extensionAPI/api-debugging).

lldb-vscode has two unique features. The first is that it launches lldb's
CommandInterpreter in a Terinal pane instead of shoehorning the
CommandInterpreter into the Debug Console as many other VSCode debug adapters do.

The second is the poorly named "LLDB: Free Launch" command. This launches lldb
and just lets you have access to the command line prompt with no target.  You
can then use lldb as you normally would on the command line (e.g.
`target create a.out` & `b main` & `run`) at which point VSCode will update
with the current target once it's there.

NOTE: This does not work entirely properly yet. I still need to implement this
in lldb itself. For now, it just checks for a file `/tmp/lldbmarker` and sleeps
until it exists at which point it continues. I suggest adding

`command alias mark script import os; os.system("touch /tmp/lldbmarker")`

to your `~/.lldbinit-lldb-vscode` file. With this, you can simply write

    (lldb) file a.out
    (lldb) b main
    (lldb) r
    (lldb) mark


# Configurations

Launching to attaching require you to create a [launch
configuration](https://code.visualstudio.com/Docs/editor/debugging#_launch-configurations).
This file defines arguments that get passed to `lldb-vscode` and the
configuration settings control how the launch or attach happens.

## Launch Configuration Settings

When you launch a program with Visual Studio Code you will need to create a [launch.json](https://code.visualstudio.com/Docs/editor/debugging#_launch-configurations)
file that defines how your program will be run. The JSON configuration file can contain the following `lldb-vscode` specific launch key/value pairs:

|parameter          |type|req |         |
|-------------------|----|:--:|---------|
|**name**           |string|Y| A configuration name that will be displayed in the IDE.
|**type**           |string|Y| Must be "lldb-vscode".
|**request**        |string|Y| Must be "launch".
|**program**        |string|Y| Path to the executable to launch.
|**args**           |[string]|| An array of command line argument strings to be passed to the program being launched.
|**cwd**            |string| | The program working directory.
|**env**            |dictionary| | Environment variables to set when launching the program. The format of each environment variable string is "VAR=VALUE" for environment variables with values or just "VAR" for environment variables with no values.
|**stopOnEntry**    |boolean| | Whether to stop program immediately after launching.
|**initCommands**   |[string]| | LLDB commands executed upon debugger startup prior to creating the LLDB target. Commands and command output will be sent to the debugger console when they are executed.
|**preRunCommands** |[string]| | LLDB commands executed just before launching after the LLDB target has been created. Commands and command output will be sent to the debugger console when they are executed.
|**stopCommands**   |[string]| | LLDB commands executed just after each stop. Commands and command output will be sent to the debugger console when they are executed.
|**exitCommands**   |[string]| | LLDB commands executed when the program exits. Commands and command output will be sent to the debugger console when they are executed.
|**sourceMap**      |[string[2]]| | Specify an array of path re-mappings. Each element in the array must be a two element array containing a source and destination pathname.
|**debuggerRoot**   | string| |Specify a working directory to use when launching lldb-vscode. If the debug information in your executable contains relative paths, this option can be used so that `lldb-vscode` can find source files and object files that have relative paths.

## Attaching Settings

When attaching to a process using LLDB you can attach in a few ways

1. Attach to an existing process using the process ID
2. Attach to an existing process by name
3. Attach by name by waiting for the next instance of a process to launch

The JSON configuration file can contain the following `lldb-vscode` specific launch key/value pairs:

|parameter          |type    |req |         |
|-------------------|--------|:--:|---------|
|**name**           |string  |Y| A configuration name that will be displayed in the IDE.
|**type**           |string  |Y| Must be "lldb-vscode".
|**request**        |string  |Y| Must be "attach".
|**program**        |string  | | Path to the executable to attach to. This value is optional but can help to resolve breakpoints prior the attaching to the program.
|**pid**            |number  | | The process id of the process you wish to attach to. If **pid** is omitted, the debugger will attempt to attach to the program by finding a process whose file name matches the file name from **program**.
|**stopOnEntry**    |boolean| | Whether to stop program immediately after launching.
|**waitFor**        |boolean | | Wait for the process to launch.
|**initCommands**   |[string]| | LLDB commands executed upon debugger startup prior to creating the LLDB target. Commands and command output will be sent to the debugger console when they are executed.
|**preRunCommands** |[string]| | LLDB commands executed just before launching after the LLDB target has been created. Commands and command output will be sent to the debugger console when they are executed.
|**stopCommands**   |[string]| | LLDB commands executed just after each stop. Commands and command output will be sent to the debugger console when they are executed.
|**exitCommands**   |[string]| | LLDB commands executed when the program exits. Commands and command output will be sent to the debugger console when they are executed.
|**attachCommands** |[string]| | LLDB commands that will be executed after **preRunCommands** which take place of the code that normally does the attach. The commands can create a new target and attach or launch it however desired. This allows custom launch and attach configurations. Core files can use `target create --core /path/to/core` to attach to core files.


## Example configurations

### Launching

This will launch `/tmp/a.out` with arguments `one`, `two`, and `three` and
adds `FOO=1` and `bar` to the environment:

```javascript
{
"type": "lldb-vscode",
"request": "launch",
"name": "Debug",
"program": "/tmp/a.out",
"args": [ "one", "two", "three" ],
"env": [ "FOO=1", "BAR" ],
}
```

### Attach using PID

This will attach to a process `a.out` whose process ID is 123:

```javascript
{
"type": "lldb-vscode",
"request": "attach",
"name": "Attach to PID",
"program": "/tmp/a.out",
"pid": 123
}
```

### Attach by Name

This will attach to an existing process whose base
name matches `a.out`. All we have to do is leave the `pid` value out of the
above configuration:

```javascript
{
"name": "Attach to Name",
"type": "lldb-vscode",
"request": "attach",
"program": "/tmp/a.out",
}
```

If you want to ignore any existing a.out processes and wait for the next instance
to be launched you can add the "waitFor" key value pair:

```javascript
{
"name": "Attach to Name (wait)",
"type": "lldb-vscode",
"request": "attach",
"program": "/tmp/a.out",
"waitFor": true
}
```

This will work as long as the architecture, vendor and OS supports waiting
for processes. Currently MacOS is the only platform that supports this.


### Loading a Core File

Loading a core file can use the `"attach"` request along with the
`"attachCommands"` to implement a custom attach:

```javascript
{
"name": "Attach to Name (wait)",
"type": "lldb-vscode",
"request": "attach",
"attachCommands": ["target create -c /path/to/123.core /path/to/executable"],
"stopOnEntry": false
}
```
