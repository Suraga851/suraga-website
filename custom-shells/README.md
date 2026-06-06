# Custom Shells

Two small learning shells:

- `rust-shell`: a Rust shell with builtins, quote-aware parsing, environment variables, external commands, and simple pipelines.
- `cpp-shell`: a portable C++ shell with the same core builtins; external commands are delegated to the host OS shell through `std::system`.

These are intentionally small enough to read and change. They are not replacements for PowerShell, Bash, or CMD.

## Rust

```powershell
cd .\custom-shells\rust-shell
cargo run
```

Example commands:

```text
help
pwd
ls
cd ..
set MY_NAME Suraga
env
cargo --version
cargo --version | findstr cargo
exit
```

## C++

Build with one of these, depending on what compiler you install:

```powershell
# This machine has Visual Studio Build Tools, so this should work:
.\custom-shells\cpp-shell\build-msvc.bat

# MSVC Developer PowerShell
cl /std:c++20 /EHsc .\custom-shells\cpp-shell\mysh.cpp /Fe:.\custom-shells\cpp-shell\mysh.exe

# MinGW g++
g++ -std=c++20 -O2 -Wall -Wextra -o .\custom-shells\cpp-shell\mysh.exe .\custom-shells\cpp-shell\mysh.cpp

# Clang
clang++ -std=c++20 -O2 -Wall -Wextra -o .\custom-shells\cpp-shell\mysh.exe .\custom-shells\cpp-shell\mysh.cpp
```

Then run:

```powershell
.\custom-shells\cpp-shell\mysh.exe
```
