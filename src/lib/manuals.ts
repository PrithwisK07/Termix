export const helpText = `Available commands:
  <span class="text-blue-400 font-bold">Navigation & Files:</span>
    ls         - List directory contents
    cd         - Change working directory
    pwd        - Print working directory
    cat        - Concatenate and print files
    touch      - Create an empty file
    mkdir      - Create a directory
    rm         - Remove files or directories
    tree       - View directory structure
    find       - Recursively search for files

  <span class="text-blue-400 font-bold">Text Editors:</span>
    vim        - Vi IMproved, a programmer's text editor
    gedit      - A graphical text editor overlay
    code       - Alias for gedit

  <span class="text-blue-400 font-bold">System & Utilities:</span>
    clear      - Clear terminal output
    echo       - Print text to standard output
    grep       - Search text for a pattern
    history    - View command history
    alias      - Create custom command shortcuts
    theme      - Switch terminal color palette
    whoami     - Print current user
    date       - Print system date and time
    uname      - Print system info
    man        - Format and display the manual pages
    help       - Display this help message
    sudo       - Execute a command as superuser

  <span class="text-blue-400 font-bold">Portfolio Specific:</span>
    about      - Display author bio
    skills     - List technical skills (--graph)
    experience - View timeline of work experience
    education  - View academic background
    projects   - List portfolio projects
    resume     - View or download resume
    github     - Open GitHub profile
    linkedin   - Open LinkedIn profile
    contact    - View contact info
    hire       - Schedule an interview/meeting
    gui        - Exit terminal and open standard graphical portfolio
    source     - View the source code for this terminal
    
  <span class="text-blue-400 font-bold">Advanced & Fun:</span>
    top        - View dynamic browser processes
    neofetch   - Display system overview
    curl       - Transfer data from a URL
    ping       - Simulate network diagnostics
    weather    - Display ASCII weather forecast
    calc       - Evaluate mathematical expressions
    matrix     - Enter the matrix
    cowsay     - Linux cow speaking
    coffee     - Grab a cup of coffee

Tip: You can use pipes '|' (e.g., 'ls -la | grep txt') and output redirection '>' (e.g., 'echo hello > file.txt').`;

export const manuals: Record<string, string> = {
  vim: `NAME
       vim - Vi IMproved, a programmer's text editor

SYNOPSIS
       vim [FILE]

DESCRIPTION
       Vim is a highly configurable text editor built to make creating and changing any kind of text very efficient. 
       This terminal includes a lightweight Vim emulator that intercepts your keyboard shortcuts.

MODES & SHORTCUTS
       <span class="text-yellow-300">i</span>             Enter INSERT mode to type text.
       <span class="text-yellow-300">Esc</span>           Exit INSERT mode and return to NORMAL mode.
       <span class="text-yellow-300">:</span>             Enter COMMAND mode.

COMMANDS
       <span class="text-green-400">:wq</span> or <span class="text-green-400">:x</span>    Write changes to the file and quit.
       <span class="text-green-400">:q!</span>           Quit immediately without saving changes.
       <span class="text-green-400">:q</span>            Quit (fails if there are unsaved changes).

EXAMPLES
       vim notes.txt`,

  gedit: `NAME
       gedit - graphical text editor

SYNOPSIS
       gedit [FILE]
       code [FILE]

DESCRIPTION
       gedit is a general-purpose GUI text editor. It launches as a floating window overlay within the terminal environment, allowing for mouse-based interaction and easy saving.`,
  // --- NAVIGATION & FILES ---
  ls: `NAME
       ls - list directory contents

SYNOPSIS
       ls [OPTION]... [FILE]...

DESCRIPTION
       List information about the FILEs (the current directory by default). Sort entries alphabetically.

OPTIONS
       <span class="text-yellow-300">-a</span>, <span class="text-yellow-300">--all</span>                  do not ignore entries starting with .
       <span class="text-yellow-300">-l</span>                         use a long listing format showing permissions, owner, size, and modification date

EXAMPLES
       ls -la
       ls projects/`,

  cd: `NAME
       cd - change the shell working directory

SYNOPSIS
       cd [dir]

DESCRIPTION
       Change the current directory to DIR. The default DIR is the value of the HOME shell variable ('~').

EXAMPLES
       cd projects    (moves into the projects directory)
       cd ..          (moves up one directory level)
       cd ~           (moves to the home directory)`,

  pwd: `NAME
       pwd - print name of current/working directory

SYNOPSIS
       pwd

DESCRIPTION
       Print the full absolute path of the current working directory.`,

  cat: `NAME
       cat - concatenate files and print on the standard output

SYNOPSIS
       cat [FILE]...

DESCRIPTION
       Reads files sequentially, writing them to the standard output.

EXAMPLES
       cat about.txt`,

  touch: `NAME
       touch - change file timestamps / create empty files

SYNOPSIS
       touch FILE...

DESCRIPTION
       A FILE argument that does not exist is created empty.

EXAMPLES
       touch notes.txt`,

  mkdir: `NAME
       mkdir - make directories

SYNOPSIS
       mkdir DIRECTORY...

DESCRIPTION
       Create the DIRECTORY(ies), if they do not already exist.

EXAMPLES
       mkdir new_project`,

  rm: `NAME
       rm - remove files or directories

SYNOPSIS
       rm [OPTION]... FILE...

DESCRIPTION
       Remove (unlink) the FILE(s). By default, it does not remove directories.

OPTIONS
       <span class="text-yellow-300">-r</span>, <span class="text-yellow-300">-R</span>, <span class="text-yellow-300">--recursive</span>   remove directories and their contents recursively

EXAMPLES
       rm old_notes.txt
       rm -r unused_directory`,

  tree: `NAME
       tree - list contents of directories in a tree-like format

SYNOPSIS
       tree [DIRECTORY]

DESCRIPTION
       Tree is a recursive directory listing program that produces a depth-indented ASCII listing of files.`,

  find: `NAME
       find - search for files in a directory hierarchy

SYNOPSIS
       find [PATH] -name [PATTERN]

DESCRIPTION
       Recursively searches the virtual file system for files containing the given pattern.

EXAMPLES
       find . -name '.txt'
       find /home/user -name 'resume'`,

  // --- SYSTEM & UTILITIES ---
  clear: `NAME
       clear - clear the terminal screen

SYNOPSIS
       clear

DESCRIPTION
       Clears your screen and scrollback buffer.`,

  echo: `NAME
       echo - display a line of text

SYNOPSIS
       echo [STRING]...

DESCRIPTION
       Echo the STRING(s) to standard output. Often used with output redirection.

EXAMPLES
       echo "Hello World" > hello.txt`,

  grep: `NAME
       grep - print lines that match patterns

SYNOPSIS
       grep PATTERN [FILE]...

DESCRIPTION
       Searches input (or files) for lines containing a match to the given PATTERN and highlights the results. Highly effective when chained with pipes.

EXAMPLES
       cat about.txt | grep Developer`,

  whoami: `NAME
       whoami - print effective userid

SYNOPSIS
       whoami

DESCRIPTION
       Print the user name associated with the current effective user ID.`,

  date: `NAME
       date - print or set the system date and time

SYNOPSIS
       date

DESCRIPTION
       Display the current time in the given system FORMAT.`,

  uname: `NAME
       uname - print system information

SYNOPSIS
       uname [OPTION]...

DESCRIPTION
       Print certain system information.

OPTIONS
       <span class="text-yellow-300">-a</span>, <span class="text-yellow-300">--all</span>                print all information`,

  man: `NAME
       man - an interface to the system reference manuals

SYNOPSIS
       man [COMMAND]

DESCRIPTION
       man is the system's manual pager. Each page is a self-contained document.`,

  help: `NAME
       help - display information about builtin commands

SYNOPSIS
       help

DESCRIPTION
       Displays a categorized list of all available commands in this terminal environment.`,

  history: `NAME
       history - command history

SYNOPSIS
       history

DESCRIPTION
       Outputs a numbered list of commands previously executed during the current browser session.`,

  alias: `NAME
       alias - define or display aliases

SYNOPSIS
       alias [name='value']

DESCRIPTION
       Creates a shortcut for a command. Without arguments, prints all defined aliases.

EXAMPLES
       alias ll='ls -la'
       alias work='projects'`,

  theme: `NAME
       theme - change terminal color scheme

SYNOPSIS
       theme [THEME_NAME]
       theme custom --bg [HEX] --fg [HEX]

DESCRIPTION
       Applies a new CSS color palette to the terminal environment.

PREDEFINED THEMES
       dark, light, dracula, hacker, synthwave, midnight, deepspace

OPTIONS
       <span class="text-yellow-300">--bg</span>       Set background hex color (e.g., #000000)
       <span class="text-yellow-300">--fg</span>       Set text foreground hex color (e.g., #00ff00)

EXAMPLES
       theme hacker
       theme custom --bg #1a0b2e --fg #00ffff`,

  sudo: `NAME
       sudo - execute a command as another user

SYNOPSIS
       sudo [COMMAND]

DESCRIPTION
       Allows a permitted user to execute a command as the superuser or another user.
       Warning: In this portfolio sandbox, you are not in the sudoers file. Attempting to use this command will result in an incident report.`,

  // --- PORTFOLIO SPECIFIC ---
  about: `NAME
       about - display author biography

SYNOPSIS
       about

DESCRIPTION
       Outputs a brief introduction, background, and current focus of the portfolio author alongside ASCII art.`,

  skills: `NAME
       skills - display technical proficiencies

SYNOPSIS
       skills [--graph]

DESCRIPTION
       Outputs a list of known programming languages, frameworks, and tools.

OPTIONS
       <span class="text-yellow-300">--graph</span>                    render a visual percentage bar chart`,

  projects: `NAME
       projects - list portfolio projects

SYNOPSIS
       projects

DESCRIPTION
       Displays a quick overview of featured projects. Acts as a shortcut to exploring the ~/projects directory.`,

  experience: `NAME
       experience - view timeline of work experience

SYNOPSIS
       experience

DESCRIPTION
       Outputs a formatted chronological timeline of the author's previous professional roles, internships, and relevant experience.`,

  education: `NAME
       education - view academic background

SYNOPSIS
       education

DESCRIPTION
       Outputs the author's degree, university, graduation year, and relevant coursework.`,

  resume: `NAME
       resume - view or download resume

SYNOPSIS
       resume [--download]

DESCRIPTION
       Opens the author's PDF resume in a new browser tab.

OPTIONS
       <span class="text-yellow-300">--download</span>                 force download of the PDF file instead of viewing`,

  github: `NAME
       github - open GitHub profile

SYNOPSIS
       github

DESCRIPTION
       Redirects the browser to the author's official GitHub profile.`,

  linkedin: `NAME
       linkedin - open LinkedIn profile

SYNOPSIS
       linkedin

DESCRIPTION
       Redirects the browser to the author's official LinkedIn profile.`,

  contact: `NAME
       contact - display contact info

SYNOPSIS
       contact [--email]

DESCRIPTION
       Displays email, Discord handle, and other social links.

OPTIONS
       <span class="text-yellow-300">--email</span>                    Automatically opens your system's default mail client,
       <span class="text-yellow-300">--dm</span>                       Send a direct message from here`,

  hire: `NAME
       hire - schedule an interview

SYNOPSIS
       hire

DESCRIPTION
       Directly opens a scheduling link (like Calendly) in a new tab to facilitate a meeting or interview.`,

  source: `NAME
       source - view the source code for this terminal

SYNOPSIS
       source

DESCRIPTION
       Opens the public GitHub repository containing the source code for this terminal. Ideal for recruiters or engineers who want to review the AST parser and VFS implementations.`,

  gui: `NAME
       gui - launch graphical user interface

SYNOPSIS
       gui

DESCRIPTION
       Provides an escape hatch from the terminal environment by redirecting the user to a standard, traditional web-based portfolio UI.`,

  // --- ADVANCED & FUN ---
  top: `NAME
       top - display browser system processes

SYNOPSIS
       top

DESCRIPTION
       Provides a dynamic real-time view of the browser's JavaScript heap memory, session uptime, and logical CPU cores. Uses the native performance API. Press Ctrl+C or q to exit.`,

  neofetch: `NAME
       neofetch - a fast, highly customizable system info script

SYNOPSIS
       neofetch

DESCRIPTION
       Displays dynamically gathered information about your operating system, software, browser, and hardware resolution in an aesthetic and visually pleasing way.`,

  curl: `NAME
       curl - transfer a URL

SYNOPSIS
       curl [options...] <url>

DESCRIPTION
       Simulates fetching data from a given URL using the native Fetch API. Includes an automatic CORS-bypass proxy fallback (allorigins) for cross-origin requests. Triggers the pager for payloads > 30 lines.

OPTIONS
       <span class="text-yellow-300">-X</span>, <span class="text-yellow-300">--request</span> <command>   Specify request command to use (GET, POST, PUT, etc)
       <span class="text-yellow-300">-d</span>, <span class="text-yellow-300">--data</span> <data>         HTTP POST data
       <span class="text-yellow-300">-H</span>, <span class="text-yellow-300">--header</span> <header>     Pass custom header(s) to server

EXAMPLES
       curl https://api.github.com/users/PrithwisK07
       curl -X POST -d "Hello" https://testing.requestcatcher.com/test`,

  ping: `NAME
       ping - measure network latency

SYNOPSIS
       ping [HOST]

DESCRIPTION
       Measures the real network round-trip time to a given host using HTTP timing. Bypasses browser CORS limitations to provide accurate latency resolution. Stops automatically after 4 packets.

EXAMPLES
       ping google.com`,

  weather: `NAME
       weather - get weather forecast

SYNOPSIS
       weather [CITY]

DESCRIPTION
       Fetches real-time meteorological data and renders it as highly detailed ASCII art via wttr.in. If no city is provided, it attempts to resolve your location based on IP.

EXAMPLES
       weather
       weather London`,

  calc: `NAME
       calc - CLI calculator

SYNOPSIS
       calc [EXPRESSION]

DESCRIPTION
       Evaluates mathematical expressions securely and returns the result.

EXAMPLES
       calc 256 * 4
       calc (10 + 5) / 3`,

  matrix: `NAME
       matrix - enter the matrix

SYNOPSIS
       matrix

DESCRIPTION
       Renders an HTML5 Canvas-based digital rain effect. A visual Easter egg demonstrating frontend animation and requestAnimationFrame capabilities.`,

  cowsay: `NAME
       cowsay - configurable speaking cow

SYNOPSIS
       cowsay [MESSAGE]

DESCRIPTION
       Generates an ASCII picture of a cow saying the given message.

EXAMPLES
       cowsay Hire me!`,

  coffee: `NAME
       coffee - grab a cup of coffee

SYNOPSIS
       coffee

DESCRIPTION
       Renders a steaming cup of ASCII coffee. An essential utility for any software engineer late at night.`,
};
