export const helpText = `Available commands:
  <span class="text-blue-400 font-bold">Navigation & Files:</span>
    ls       - List directory contents (-a, -l)
    cd       - Change working directory
    pwd      - Print working directory
    cat      - Concatenate and print files
    touch    - Create an empty file
    mkdir    - Create a directory
    rm       - Remove files or directories (-r)
    tree     - View directory structure

  <span class="text-blue-400 font-bold">System & Utilities:</span>
    clear    - Clear terminal output
    echo     - Print text to standard output
    grep     - Search text for a pattern
    whoami   - Print current user
    date     - Print system date and time
    uname    - Print system info (-a)
    man      - Format and display the manual pages
    help     - Display this help message

  <span class="text-blue-400 font-bold">Portfolio Specific:</span>
    about    - Display author bio
    skills   - List technical skills (--graph)
    projects - List portfolio projects
    resume   - View or download resume
    github   - Open GitHub profile
    linkedin - Open LinkedIn profile
    
  <span class="text-blue-400 font-bold">Advanced & Fun:</span>
    top      - View dynamic browser processes
    neofetch - Display system overview
    curl     - Transfer data (supports -X, -d, -H)
    matrix   - Enter the matrix

Tip: You can use pipes '|' (e.g., 'ls -la | grep txt') and output redirection '>' (e.g., 'echo hello > file.txt').`;

export const manuals: Record<string, string> = {
  // Navigation & Files
  ls: "NAME\n       ls - list directory contents\n\nSYNOPSIS\n       ls [OPTION]... [FILE]...\n\nDESCRIPTION\n       List information about the FILEs (the current directory by default).\n       <span class=\"text-yellow-300\">-a</span>, <span class=\"text-yellow-300\">--all</span>                  do not ignore entries starting with .\n       <span class=\"text-yellow-300\">-l</span>                         use a long listing format",
  cd: "NAME\n       cd - change the shell working directory\n\nSYNOPSIS\n       cd [dir]\n\nDESCRIPTION\n       Change the current directory to DIR. The default DIR is the value of the HOME shell variable ('~').",
  pwd: "NAME\n       pwd - print name of current/working directory\n\nSYNOPSIS\n       pwd\n\nDESCRIPTION\n       Print the full filename of the current working directory.",
  cat: "NAME\n       cat - concatenate files and print on the standard output\n\nSYNOPSIS\n       cat [FILE]...\n\nDESCRIPTION\n       Concatenate FILE(s) to standard output.",
  touch: "NAME\n       touch - change file timestamps / create empty files\n\nSYNOPSIS\n       touch FILE...\n\nDESCRIPTION\n       Update the access and modification times of each FILE to the current time. A FILE argument that does not exist is created empty.",
  mkdir: "NAME\n       mkdir - make directories\n\nSYNOPSIS\n       mkdir DIRECTORY...\n\nDESCRIPTION\n       Create the DIRECTORY(ies), if they do not already exist.",
  rm: "NAME\n       rm - remove files or directories\n\nSYNOPSIS\n       rm [OPTION]... FILE...\n\nDESCRIPTION\n       Remove (unlink) the FILE(s).\n       <span class=\"text-yellow-300\">-r</span>, <span class=\"text-yellow-300\">-R</span>, <span class=\"text-yellow-300\">--recursive</span>   remove directories and their contents recursively",
  tree: "NAME\n       tree - list contents of directories in a tree-like format\n\nSYNOPSIS\n       tree [DIRECTORY]\n\nDESCRIPTION\n       Tree is a recursive directory listing program that produces a depth-indented listing of files.",

  // System & Utilities
  clear: "NAME\n       clear - clear the terminal screen\n\nSYNOPSIS\n       clear\n\nDESCRIPTION\n       Clears your screen if this is possible, including its scrollback buffer.",
  echo: "NAME\n       echo - display a line of text\n\nSYNOPSIS\n       echo [STRING]...\n\nDESCRIPTION\n       Echo the STRING(s) to standard output. Can be redirected to files using '>'.",
  grep: "NAME\n       grep - print lines that match patterns\n\nSYNOPSIS\n       grep PATTERN [FILE]...\n\nDESCRIPTION\n       Searches input (or files) for lines containing a match to the given PATTERN.",
  whoami: "NAME\n       whoami - print effective userid\n\nSYNOPSIS\n       whoami\n\nDESCRIPTION\n       Print the user name associated with the current effective user ID.",
  date: "NAME\n       date - print or set the system date and time\n\nSYNOPSIS\n       date\n\nDESCRIPTION\n       Display the current time in the given FORMAT.",
  uname: "NAME\n       uname - print system information\n\nSYNOPSIS\n       uname [OPTION]...\n\nDESCRIPTION\n       Print certain system information.\n       <span class=\"text-yellow-300\">-a</span>, <span class=\"text-yellow-300\">--all</span>                print all information",
  man: "NAME\n       man - an interface to the system reference manuals\n\nSYNOPSIS\n       man [COMMAND]\n\nDESCRIPTION\n       man is the system's manual pager.",
  help: "NAME\n       help - display information about builtin commands\n\nSYNOPSIS\n       help\n\nDESCRIPTION\n       Displays a list of all available commands in this terminal environment.",

  // Portfolio Specific
  about: "NAME\n       about - display author biography\n\nSYNOPSIS\n       about\n\nDESCRIPTION\n       Outputs a brief introduction, background, and current focus of the portfolio author.",
  skills: "NAME\n       skills - display technical proficiencies\n\nSYNOPSIS\n       skills [--graph]\n\nDESCRIPTION\n       Outputs a list of known programming languages, frameworks, and tools.\n       <span class=\"text-yellow-300\">--graph</span>                    render a visual percentage bar chart",
  projects: "NAME\n       projects - list portfolio projects\n\nSYNOPSIS\n       projects\n\nDESCRIPTION\n       Displays a quick overview of featured projects. Acts as a shortcut to exploring the ~/projects directory.",
  resume: "NAME\n       resume - view or download resume\n\nSYNOPSIS\n       resume [--download]\n\nDESCRIPTION\n       Opens the author's PDF resume in a new browser tab.\n       <span class=\"text-yellow-300\">--download</span>                 force download of the PDF file instead of viewing",
  github: "NAME\n       github - open GitHub profile\n\nSYNOPSIS\n       github\n\nDESCRIPTION\n       Redirects the browser to the author's official GitHub profile.",
  linkedin: "NAME\n       linkedin - open LinkedIn profile\n\nSYNOPSIS\n       linkedin\n\nDESCRIPTION\n       Redirects the browser to the author's official LinkedIn profile.",

  // Advanced & Fun
  top: "NAME\n       top - display browser system processes\n\nSYNOPSIS\n       top\n\nDESCRIPTION\n       Provides a dynamic real-time view of the browser's JavaScript heap memory, session uptime, and logical CPU cores.",
  neofetch: "NAME\n       neofetch - a fast, highly customizable system info script\n\nSYNOPSIS\n       neofetch\n\nDESCRIPTION\n       Displays information about your operating system, software and hardware in an aesthetic and visually pleasing way.",
  curl: `NAME
       curl - transfer a URL

SYNOPSIS
       curl [options...] <url>

DESCRIPTION
       Simulates fetching data from a given URL. Often used to test APIs. Includes an automatic CORS-bypass proxy fallback for cross-origin requests.

OPTIONS
       <span class="text-yellow-300">-X</span>, <span class="text-yellow-300">--request</span> <command>   Specify request command to use (GET, POST, PUT, etc)
       <span class="text-yellow-300">-d</span>, <span class="text-yellow-300">--data</span> <data>         HTTP POST data
       <span class="text-yellow-300">-H</span>, <span class="text-yellow-300">--header</span> <header>     Pass custom header(s) to server

EXAMPLES
       Try fetching my real GitHub profile data:
       <span class="text-green-400">curl https://api.github.com/users/PrithwisK07</span>

       Fetch my public repositories to see my code:
       <span class="text-green-400">curl https://api.github.com/users/PrithwisK07/repos</span>

       Test a POST request payload:
       <span class="text-green-400">curl -X POST -d "Hello Prithwis!" https://testing.requestcatcher.com/test</span>`,
       matrix: "NAME\n       matrix - enter the matrix\n\nSYNOPSIS\n       matrix\n\nDESCRIPTION\n       Renders an HTML5 Canvas-based digital rain effect. A visual Easter egg demonstrating frontend animation capabilities."
};