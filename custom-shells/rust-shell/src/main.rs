use std::env;
use std::fs;
use std::io::{self, Write};
use std::process::{Command, Stdio};

#[derive(Debug, Clone, PartialEq, Eq)]
enum Token {
    Word(String),
    Pipe,
}

#[derive(Debug, Clone, PartialEq, Eq)]
enum BuiltinResult {
    Handled,
    Exit,
    NotBuiltin,
}

fn main() {
    println!("mysh-rs 0.1.0");
    println!("Type 'help' for commands. Type 'exit' to leave.");

    loop {
        print_prompt();

        let mut line = String::new();
        match io::stdin().read_line(&mut line) {
            Ok(0) => {
                println!();
                break;
            }
            Ok(_) => {}
            Err(error) => {
                eprintln!("read error: {error}");
                continue;
            }
        }

        let line = line.trim();
        if line.is_empty() {
            continue;
        }

        let tokens = match tokenize(line) {
            Ok(tokens) => tokens,
            Err(error) => {
                eprintln!("parse error: {error}");
                continue;
            }
        };

        let pipeline = match split_pipeline(tokens) {
            Ok(commands) => commands,
            Err(error) => {
                eprintln!("parse error: {error}");
                continue;
            }
        };

        if pipeline.len() == 1 {
            match run_builtin(&pipeline[0]) {
                BuiltinResult::Handled => continue,
                BuiltinResult::Exit => break,
                BuiltinResult::NotBuiltin => {}
            }
        }

        if let Err(error) = run_pipeline(&pipeline, line) {
            eprintln!("{error}");
        }
    }
}

fn print_prompt() {
    let cwd = env::current_dir()
        .map(|path| {
            path.file_name()
                .and_then(|name| name.to_str())
                .map(String::from)
                .unwrap_or_else(|| path.display().to_string())
        })
        .unwrap_or_else(|_| "?".to_string());

    print!("mysh:{cwd}> ");
    let _ = io::stdout().flush();
}

fn tokenize(line: &str) -> Result<Vec<Token>, String> {
    let mut tokens = Vec::new();
    let mut word = String::new();
    let mut chars = line.chars().peekable();
    let mut quote: Option<char> = None;

    while let Some(ch) = chars.next() {
        match quote {
            Some('\'') => {
                if ch == '\'' {
                    quote = None;
                } else {
                    word.push(ch);
                }
            }
            Some('"') => {
                if ch == '"' {
                    quote = None;
                } else if ch == '\\' {
                    if let Some(next) = chars.next() {
                        word.push(next);
                    } else {
                        word.push('\\');
                    }
                } else {
                    word.push(ch);
                }
            }
            Some(_) => unreachable!(),
            None => match ch {
                '\'' | '"' => quote = Some(ch),
                '#' if word.is_empty() => break,
                '|' => {
                    push_word(&mut tokens, &mut word);
                    tokens.push(Token::Pipe);
                }
                ch if ch.is_whitespace() => push_word(&mut tokens, &mut word),
                '\\' => {
                    match chars.peek().copied() {
                        Some(next)
                            if next.is_whitespace()
                                || next == '\''
                                || next == '"'
                                || next == '|'
                                || next == '\\' =>
                        {
                            word.push(chars.next().unwrap());
                        }
                        _ => word.push('\\'),
                    }
                }
                _ => word.push(ch),
            },
        }
    }

    if let Some(ch) = quote {
        return Err(format!("missing closing {ch} quote"));
    }

    push_word(&mut tokens, &mut word);
    Ok(tokens)
}

fn push_word(tokens: &mut Vec<Token>, word: &mut String) {
    if !word.is_empty() {
        tokens.push(Token::Word(std::mem::take(word)));
    }
}

fn split_pipeline(tokens: Vec<Token>) -> Result<Vec<Vec<String>>, String> {
    let mut commands = vec![Vec::new()];

    for token in tokens {
        match token {
            Token::Word(word) => commands.last_mut().unwrap().push(word),
            Token::Pipe => {
                if commands.last().unwrap().is_empty() {
                    return Err("empty command before pipe".to_string());
                }
                commands.push(Vec::new());
            }
        }
    }

    if commands.last().is_some_and(Vec::is_empty) {
        return Err("empty command after pipe".to_string());
    }

    Ok(commands)
}

fn run_builtin(args: &[String]) -> BuiltinResult {
    if args.is_empty() {
        return BuiltinResult::Handled;
    }

    match args[0].as_str() {
        "exit" | "quit" => BuiltinResult::Exit,
        "help" => {
            print_help();
            BuiltinResult::Handled
        }
        "pwd" => {
            match env::current_dir() {
                Ok(path) => println!("{}", path.display()),
                Err(error) => eprintln!("pwd: {error}"),
            }
            BuiltinResult::Handled
        }
        "cd" => {
            let target = args.get(1).map(String::as_str).unwrap_or("~");
            if let Err(error) = change_dir(target) {
                eprintln!("cd: {error}");
            }
            BuiltinResult::Handled
        }
        "ls" => {
            let target = args.get(1).map(String::as_str).unwrap_or(".");
            if let Err(error) = list_dir(target) {
                eprintln!("ls: {error}");
            }
            BuiltinResult::Handled
        }
        "set" => {
            if args.len() < 3 {
                eprintln!("usage: set NAME VALUE");
            } else {
                env::set_var(&args[1], args[2..].join(" "));
            }
            BuiltinResult::Handled
        }
        "unset" => {
            if args.len() != 2 {
                eprintln!("usage: unset NAME");
            } else {
                env::remove_var(&args[1]);
            }
            BuiltinResult::Handled
        }
        "env" => {
            let mut values: Vec<_> = env::vars().collect();
            values.sort_by(|a, b| a.0.cmp(&b.0));
            for (name, value) in values {
                println!("{name}={value}");
            }
            BuiltinResult::Handled
        }
        _ => BuiltinResult::NotBuiltin,
    }
}

fn print_help() {
    println!("Builtins:");
    println!("  help             show this message");
    println!("  pwd              print current directory");
    println!("  cd [DIR]         change directory, or home if DIR is omitted");
    println!("  ls [DIR]         list a directory");
    println!("  set NAME VALUE   set an environment variable for this shell");
    println!("  unset NAME       remove an environment variable for this shell");
    println!("  env              print environment variables");
    println!("  exit             leave the shell");
    println!();
    println!("Features:");
    println!("  Quotes:          cd \"C:\\Users\\Suraga\\Downloads\"");
    println!("  Pipelines:       cargo --version | findstr cargo");
    println!("  Comments:        # anything after this is ignored");
}

fn change_dir(target: &str) -> io::Result<()> {
    let path = if target == "~" {
        home_dir().ok_or_else(|| io::Error::new(io::ErrorKind::NotFound, "home directory not found"))?
    } else {
        target.into()
    };

    env::set_current_dir(path)
}

fn home_dir() -> Option<std::path::PathBuf> {
    #[cfg(windows)]
    {
        env::var_os("USERPROFILE").map(Into::into)
    }

    #[cfg(not(windows))]
    {
        env::var_os("HOME").map(Into::into)
    }
}

fn list_dir(target: &str) -> io::Result<()> {
    let mut entries = fs::read_dir(target)?
        .map(|entry| entry.map(|entry| entry.path()))
        .collect::<Result<Vec<_>, _>>()?;
    entries.sort();

    for path in entries {
        let marker = if path.is_dir() { "/" } else { "" };
        let name = path
            .file_name()
            .and_then(|name| name.to_str())
            .unwrap_or("<invalid utf-8>");
        println!("{name}{marker}");
    }

    Ok(())
}

fn run_pipeline(commands: &[Vec<String>], original_line: &str) -> io::Result<()> {
    let mut children = Vec::new();
    let mut previous_stdout = None;

    for (index, args) in commands.iter().enumerate() {
        if args.is_empty() {
            continue;
        }

        let is_last = index == commands.len() - 1;
        let mut command = Command::new(&args[0]);
        command.args(&args[1..]);

        if let Some(stdout) = previous_stdout.take() {
            command.stdin(Stdio::from(stdout));
        }

        if !is_last {
            command.stdout(Stdio::piped());
        }

        let mut child = match command.spawn() {
            Ok(child) => child,
            Err(error) if cfg!(windows) && commands.len() == 1 && error.kind() == io::ErrorKind::NotFound => {
                let mut fallback = Command::new("cmd");
                fallback.args(["/C", original_line]);
                fallback.spawn()?
            }
            Err(error) => {
                return Err(io::Error::new(
                    error.kind(),
                    format!("{}: {error}", args[0]),
                ));
            }
        };

        if !is_last {
            previous_stdout = child.stdout.take();
        }
        children.push(child);
    }

    for mut child in children {
        let status = child.wait()?;
        if !status.success() {
            eprintln!("process exited with {status}");
        }
    }

    Ok(())
}

